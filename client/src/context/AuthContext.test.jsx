import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "../context/AuthContext";
import * as api from "../api";

jest.mock("../api");

/**
 * Auth Context Tests
 */

describe("AuthContext", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it("should provide initial auth state", () => {
    let contextValue = null;

    function TestComponent() {
      contextValue = useAuth();
      return <div>Test</div>;
    }

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    expect(contextValue).toMatchObject({
      user: null,
      token: null,
      loading: false,
      login: expect.any(Function),
      logout: expect.any(Function),
      refreshProfile: expect.any(Function),
    });
  });

  it("should load token from localStorage on mount", () => {
    const mockToken = "test-jwt-token";
    localStorage.setItem("banco_token", mockToken);

    let contextValue = null;

    function TestComponent() {
      contextValue = useAuth();
      return <div>Test</div>;
    }

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    expect(contextValue.token).toBe(mockToken);
  });

  it("should handle login successfully", async () => {
    const credentials = { username: "user1", password: "pass123" };
    const mockResponse = {
      success: true,
      token: "new-jwt-token",
      user: {
        id: 1,
        username: "user1",
        name: "Test User",
        email: "user@test.com",
        role: "customer",
      },
    };

    api.apiPost.mockResolvedValue(mockResponse);

    let authContext = null;

    function TestComponent() {
      authContext = useAuth();
      return <button onClick={() => authContext.login(credentials)}>Login</button>;
    }

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    const loginBtn = screen.getByRole("button", { name: /login/i });
    loginBtn.click();

    await waitFor(() => {
      expect(api.apiPost).toHaveBeenCalledWith("/auth/login", credentials);
      expect(localStorage.getItem("banco_token")).toBe(mockResponse.token);
      expect(localStorage.getItem("banco_user")).toBe(JSON.stringify(mockResponse.user));
    });
  });

  it("should handle logout", () => {
    const mockToken = "test-jwt-token";
    localStorage.setItem("banco_token", mockToken);
    localStorage.setItem("banco_user", JSON.stringify({ id: 1, username: "user1" }));

    let authContext = null;

    function TestComponent() {
      authContext = useAuth();
      return <button onClick={() => authContext.logout()}>Logout</button>;
    }

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    const logoutBtn = screen.getByRole("button", { name: /logout/i });
    logoutBtn.click();

    expect(localStorage.getItem("banco_token")).toBeNull();
    expect(localStorage.getItem("banco_user")).toBeNull();
  });
});
