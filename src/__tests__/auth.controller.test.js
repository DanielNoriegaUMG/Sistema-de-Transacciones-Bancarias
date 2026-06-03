/**
 * Auth Controller Tests
 */

const authController = require("../controllers/auth.controller");
const authService = require("../services/auth.services");

jest.mock("../services/auth.services");

describe("Auth Controller", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      user: null,
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

  describe("login", () => {
    it("should return success and token on valid credentials", async () => {
      req.body = { username: "user1", password: "pass123" };

      const mockResponse = {
        success: true,
        message: "Sesión iniciada correctamente.",
        token: "mock-jwt-token",
        user: {
          id: 1,
          username: "user1",
          name: "Test User",
          email: "user@test.com",
          role: "customer",
        },
      };

      authService.login.mockResolvedValue(mockResponse);

      await authController.login(req, res, next);

      expect(authService.login).toHaveBeenCalledWith("user1", "pass123");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should return 401 on invalid credentials", async () => {
      req.body = { username: "user1", password: "wrongpass" };

      const mockResponse = {
        success: false,
        message: "Credenciales incorrectas. Verifique su usuario y contraseña.",
      };

      authService.login.mockResolvedValue(mockResponse);

      await authController.login(req, res, next);

      expect(authService.login).toHaveBeenCalledWith("user1", "wrongpass");
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it("should handle service errors", async () => {
      req.body = { username: "user1", password: "pass123" };

      const mockError = new Error("Database connection failed");
      authService.login.mockRejectedValue(mockError);

      await authController.login(req, res, next);

      expect(next).toHaveBeenCalledWith(mockError);
    });
  });

  describe("logout", () => {
    it("should return success message", async () => {
      await authController.logout(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Sesión cerrada correctamente.",
      });
    });
  });

  describe("me", () => {
    it("should return authenticated user", async () => {
      req.user = {
        id: 1,
        username: "user1",
        name: "Test User",
        email: "user@test.com",
        role: "customer",
      };

      await authController.me(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        user: req.user,
      });
    });
  });
});
