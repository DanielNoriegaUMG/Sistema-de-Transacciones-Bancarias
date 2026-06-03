/**
 * Transfer Controller Tests
 */

const transferenciaController = require("../controllers/transferencia.controller");
const transferenciaService = require("../services/transferencia.services");

jest.mock("../services/transferencia.services");

describe("Transfer Controller", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      user: {
        id: 1,
        username: "user1",
        name: "Test User",
        email: "user@test.com",
        role: "customer",
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getAll", () => {
    it("should return all transfers for user", async () => {
      const mockResponse = {
        success: true,
        data: [
          {
            id: 1,
            fromAccountId: 1,
            toAccountId: 2,
            amount: 100.00,
            transferDate: "2026-06-02T10:00:00.000Z",
            description: "Payment to savings",
          },
        ],
      };

      transferenciaService.getAll.mockResolvedValue(mockResponse);

      await transferenciaController.getAll(req, res, next);

      expect(transferenciaService.getAll).toHaveBeenCalledWith(req.user);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should handle service errors", async () => {
      const mockError = new Error("Database connection failed");
      transferenciaService.getAll.mockRejectedValue(mockError);

      await transferenciaController.getAll(req, res, next);

      expect(next).toHaveBeenCalledWith(mockError);
    });
  });

  describe("create", () => {
    it("should create transfer with valid data", async () => {
      req.body = {
        fromAccountId: 1,
        toAccountId: 2,
        amount: 250.50,
        description: "Transfer for bill payment",
      };

      const mockResponse = {
        success: true,
        message: "Transferencia creada correctamente.",
        data: {
          id: 1,
          fromAccountId: 1,
          toAccountId: 2,
          amount: 250.50,
          transferDate: "2026-06-02T10:05:00.000Z",
          description: "Transfer for bill payment",
        },
      };

      transferenciaService.create.mockResolvedValue(mockResponse);

      await transferenciaController.create(req, res, next);

      expect(transferenciaService.create).toHaveBeenCalledWith(req.body, req.user);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should return error for insufficient funds", async () => {
      req.body = {
        fromAccountId: 1,
        toAccountId: 2,
        amount: 50000,
        description: "Too much money",
      };

      const mockResponse = {
        success: false,
        message: "Saldo insuficiente para realizar la transferencia.",
      };

      transferenciaService.create.mockResolvedValue(mockResponse);

      await transferenciaController.create(req, res, next);

      expect(transferenciaService.create).toHaveBeenCalledWith(req.body, req.user);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should handle service errors", async () => {
      req.body = {
        fromAccountId: 1,
        toAccountId: 2,
        amount: 100,
      };

      const mockError = new Error("Transaction failed");
      transferenciaService.create.mockRejectedValue(mockError);

      await transferenciaController.create(req, res, next);

      expect(next).toHaveBeenCalledWith(mockError);
    });
  });
});
