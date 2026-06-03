/**
 * Transfer Services Tests
 */

jest.mock("../config/db", () => ({
  connect: jest.fn(),
}));
jest.mock("../models/cuenta.model");
jest.mock("../models/transferencia.model");
jest.mock("../models/estadoCuenta.model");
jest.mock("../services/exchange.services");

const pool = require("../config/db");
const cuentaModel = require("../models/cuenta.model");
const transferenciaModel = require("../models/transferencia.model");
const estadoCuentaModel = require("../models/estadoCuenta.model");
const exchangeServices = require("../services/exchange.services");
const transferenciaService = require("../services/transferencia.services");

describe("Transfer Services", () => {
  let client;
  const user = { id: 1 };

  beforeEach(() => {
    client = {
      query: jest.fn().mockResolvedValue({ rows: [] }),
      release: jest.fn(),
    };

    pool.connect.mockResolvedValue(client);
    jest.clearAllMocks();
  });

  it("should convert credited amount when source and target currencies differ", async () => {
    cuentaModel.findById
      .mockResolvedValueOnce({
        id: 1,
        user_id: 1,
        account_number: "1000100010001000",
        balance: "1000.00",
        currency: "USD",
      })
      .mockResolvedValueOnce({
        id: 2,
        user_id: 2,
        account_number: "2000200020002000",
        balance: "500.00",
        currency: "GTQ",
      });

    exchangeServices.getConversionInfo.mockResolvedValue({
      originalAmount: 100,
      convertedAmount: 775,
      rate: 7.75,
      fromCurrency: "USD",
      toCurrency: "GTQ",
    });

    transferenciaModel.createTransfer.mockResolvedValue({
      id: 10,
      from_account_id: 1,
      to_account_id: 2,
      amount: 100,
      amount_received: 775,
      exchange_rate: 7.75,
      from_currency: "USD",
      to_currency: "GTQ",
    });

    const result = await transferenciaService.create(
      {
        fromAccountId: 1,
        toAccountId: 2,
        amount: 100,
        description: "Currency transfer",
      },
      user,
    );

    expect(exchangeServices.getConversionInfo).toHaveBeenCalledWith(100, "USD", "GTQ", client);
    expect(cuentaModel.updateBalance).toHaveBeenCalledWith(1, 900, client);
    expect(cuentaModel.updateBalance).toHaveBeenCalledWith(2, 1275, client);
    expect(transferenciaModel.createTransfer).toHaveBeenCalledWith(
      1,
      2,
      100,
      775,
      7.75,
      "USD",
      "GTQ",
      "Currency transfer",
      client,
    );
    expect(estadoCuentaModel.insertTransaction).toHaveBeenCalledWith(
      1,
      -100,
      "DEBIT",
      900,
      expect.stringContaining("USD 100 = GTQ 775 @ 7.75"),
      client,
    );
    expect(estadoCuentaModel.insertTransaction).toHaveBeenCalledWith(
      2,
      775,
      "CREDIT",
      1275,
      expect.stringContaining("USD 100 = GTQ 775 @ 7.75"),
      client,
    );
    expect(client.query).toHaveBeenCalledWith("COMMIT");
    expect(result.success).toBe(true);
  });

  it("should keep the original amount when currencies are equal", async () => {
    cuentaModel.findById
      .mockResolvedValueOnce({
        id: 1,
        user_id: 1,
        account_number: "1000100010001000",
        balance: "1000.00",
        currency: "GTQ",
      })
      .mockResolvedValueOnce({
        id: 2,
        user_id: 2,
        account_number: "2000200020002000",
        balance: "500.00",
        currency: "GTQ",
      });

    transferenciaModel.createTransfer.mockResolvedValue({
      id: 11,
      amount: 100,
      amount_received: 100,
      exchange_rate: 1,
      from_currency: "GTQ",
      to_currency: "GTQ",
    });

    const result = await transferenciaService.create(
      {
        fromAccountId: 1,
        toAccountId: 2,
        amount: 100,
      },
      user,
    );

    expect(exchangeServices.getConversionInfo).not.toHaveBeenCalled();
    expect(cuentaModel.updateBalance).toHaveBeenCalledWith(1, 900, client);
    expect(cuentaModel.updateBalance).toHaveBeenCalledWith(2, 600, client);
    expect(transferenciaModel.createTransfer).toHaveBeenCalledWith(
      1,
      2,
      100,
      100,
      1,
      "GTQ",
      "GTQ",
      "",
      client,
    );
    expect(client.query).toHaveBeenCalledWith("COMMIT");
    expect(result.success).toBe(true);
  });

  it("should rollback and return an error when exchange rate is missing", async () => {
    cuentaModel.findById
      .mockResolvedValueOnce({
        id: 1,
        user_id: 1,
        account_number: "1000100010001000",
        balance: "1000.00",
        currency: "USD",
      })
      .mockResolvedValueOnce({
        id: 2,
        user_id: 2,
        account_number: "2000200020002000",
        balance: "500.00",
        currency: "GTQ",
      });

    exchangeServices.getConversionInfo.mockRejectedValue(
      new Error("No exchange rate found for USD to GTQ"),
    );

    const result = await transferenciaService.create(
      {
        fromAccountId: 1,
        toAccountId: 2,
        amount: 100,
      },
      user,
    );

    expect(client.query).toHaveBeenCalledWith("ROLLBACK");
    expect(cuentaModel.updateBalance).not.toHaveBeenCalled();
    expect(transferenciaModel.createTransfer).not.toHaveBeenCalled();
    expect(result).toEqual({
      success: false,
      message: "No exchange rate found for USD to GTQ",
      data: null,
    });
  });
});
