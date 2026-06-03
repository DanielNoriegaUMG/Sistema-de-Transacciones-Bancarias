/**
 * Account Controller Tests
 */

const cuentaController = require("../controllers/cuenta.controller");
const cuentaService = require("../services/cuenta.services");

jest.mock("../services/cuenta.services");

describe("Account Controller", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      params: {},
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
    it("should return all accounts for user", async () => {
      const mockResponse = {
        success: true,
        data: [
          {
            id: 1,
            accountNumber: "ACC001",
            accountType: "savings",
            balance: 5000.00,
            userId: 1,
          },
          {
            id: 2,
            accountNumber: "ACC002",
            accountType: "checking",
            balance: 2500.00,
            userId: 1,
          },
        ],
      };

      cuentaService.getAll.mockResolvedValue(mockResponse);

      await cuentaController.getAll(req, res, next);

      expect(cuentaService.getAll).toHaveBeenCalledWith(req.user);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should handle service errors", async () => {
      const mockError = new Error("Database connection failed");
      cuentaService.getAll.mockRejectedValue(mockError);

      await cuentaController.getAll(req, res, next);

      expect(next).toHaveBeenCalledWith(mockError);
    });
  });

  describe("getById", () => {
    it("should return specific account", async () => {
      req.params.id = "1";

      const mockResponse = {
        success: true,
        data: {
          id: 1,
          accountNumber: "ACC001",
          accountType: "savings",
          balance: 5000.00,
          userId: 1,
        },
      };

      cuentaService.getById.mockResolvedValue(mockResponse);

      await cuentaController.getById(req, res, next);

      expect(cuentaService.getById).toHaveBeenCalledWith("1", req.user);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should handle service errors", async () => {
      req.params.id = "1";

      const mockError = new Error("Account not found");
      cuentaService.getById.mockRejectedValue(mockError);

      await cuentaController.getById(req, res, next);

      expect(next).toHaveBeenCalledWith(mockError);
    });
  });
});
