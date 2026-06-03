/**
 * Error Middleware Tests
 */

const errorHandler = require("../middlewares/error.middleware");

describe("Error Middleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should handle generic errors with default status", () => {
    const error = new Error("Something went wrong");

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Something went wrong",
      }),
    );
  });

  it("should use custom status from error object", () => {
    const error = new Error("Unauthorized");
    error.status = 401;

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Unauthorized",
      }),
    );
  });

  it("should include details if available", () => {
    const error = new Error("Validation failed");
    error.status = 422;
    error.details = {
      field: "email",
      message: "Invalid email format",
    };

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Validation failed",
        details: {
          field: "email",
          message: "Invalid email format",
        },
      }),
    );
  });

  it("should use 500 status if not specified", () => {
    const error = new Error("Database error");

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
