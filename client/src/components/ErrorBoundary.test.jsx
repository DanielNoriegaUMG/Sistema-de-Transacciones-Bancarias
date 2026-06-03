import React from "react";
import { render, screen } from "@testing-library/react";
import ErrorBoundary from "../components/ErrorBoundary";

/**
 * ErrorBoundary Component Tests
 */

// Mock console.error to avoid cluttering test output
jest.spyOn(console, "error").mockImplementation();

const ThrowError = () => {
  throw new Error("Test error component");
};

describe("ErrorBoundary Component", () => {
  afterEach(() => {
    console.error.mockClear();
  });

  it("should render children when there is no error", () => {
    render(
      <ErrorBoundary>
        <div>Safe Content</div>
      </ErrorBoundary>,
    );

    expect(screen.getByText("Safe Content")).toBeInTheDocument();
  });

  it("should render error UI when child component throws", () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>,
    );

    expect(screen.getByText(/algo salió mal/i)).toBeInTheDocument();
    expect(screen.getByText(/error inesperado/i)).toBeInTheDocument();
  });

  it("should display reload button", () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>,
    );

    const reloadBtn = screen.getByRole("button", { name: /recargar página/i });
    expect(reloadBtn).toBeInTheDocument();
  });

  it("should show error details in development mode", () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>,
    );

    expect(screen.getByText(/detalles del error/i)).toBeInTheDocument();

    process.env.NODE_ENV = originalNodeEnv;
  });

  it("should handle multiple errors", () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>,
    );

    expect(screen.getByText(/algo salió mal/i)).toBeInTheDocument();

    rerender(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>,
    );

    expect(screen.getByText(/algo salió mal/i)).toBeInTheDocument();
  });
});
