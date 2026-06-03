/**
 * Exchange Services Tests
 */

const exchangeServices = require("../services/exchange.services");
const exchangeModel = require("../models/exchange.model");

jest.mock("../models/exchange.model");

describe("Exchange Services", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("convert", () => {
    it("should return same amount for same currency", async () => {
      const result = await exchangeServices.convert(100, "USD", "USD");
      expect(result).toBe(100);
    });

    it("should convert USD to GTQ", async () => {
      exchangeModel.getRate.mockResolvedValue(7.75);

      const result = await exchangeServices.convert(100, "USD", "GTQ");

      expect(exchangeModel.getRate).toHaveBeenCalledWith("USD", "GTQ", null);
      expect(result).toBe(775);
    });

    it("should convert GTQ to USD", async () => {
      exchangeModel.getRate.mockResolvedValue(0.129032);

      const result = await exchangeServices.convert(775, "GTQ", "USD");

      expect(exchangeModel.getRate).toHaveBeenCalledWith("GTQ", "USD", null);
      expect(result).toBe(100);
    });

    it("should round to 2 decimals", async () => {
      exchangeModel.getRate.mockResolvedValue(7.75);

      const result = await exchangeServices.convert(99.99, "USD", "GTQ");

      expect(result).toBeCloseTo(774.92, 2);
    });

    it("should throw error if rate not found", async () => {
      exchangeModel.getRate.mockResolvedValue(null);

      await expect(exchangeServices.convert(100, "USD", "EUR")).rejects.toThrow(
        "No exchange rate found for USD to EUR",
      );
    });
  });

  describe("getConversionInfo", () => {
    it("should return conversion info for same currency", async () => {
      const result = await exchangeServices.getConversionInfo(100, "USD", "USD");

      expect(result).toEqual({
        originalAmount: 100,
        convertedAmount: 100,
        rate: 1,
        fromCurrency: "USD",
        toCurrency: "USD",
      });
    });

    it("should return conversion info with rate", async () => {
      exchangeModel.getRate.mockResolvedValue(7.75);

      const result = await exchangeServices.getConversionInfo(100, "USD", "GTQ");

      expect(result).toEqual({
        originalAmount: 100,
        convertedAmount: 775,
        rate: 7.75,
        fromCurrency: "USD",
        toCurrency: "GTQ",
      });
    });

    it("should throw error if rate not found", async () => {
      exchangeModel.getRate.mockResolvedValue(null);

      await expect(
        exchangeServices.getConversionInfo(100, "USD", "EUR"),
      ).rejects.toThrow("No exchange rate found for USD to EUR");
    });
  });
});
