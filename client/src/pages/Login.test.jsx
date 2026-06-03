import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import Login from "../pages/Login";
import { AuthProvider, useAuth } from "../context/AuthContext";
import * as api from "../api";

jest.mock("../api");

/**
 * Login Component Tests
 */

describe("Login Component", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  const renderWithRouter = (component) => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          {component}
        </AuthProvider>
      </BrowserRouter>,
    );
  };

  it("should render login form", () => {
    renderWithRouter(<Login />);

    expect(screen.getByLabelText(/usuario/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /iniciar sesión/i })).toBeInTheDocument();
  });

  it("should update form inputs when user types", async () => {
    const user = userEvent.setup();
    renderWithRouter(<Login />);

    const usernameInput = screen.getByLabelText(/usuario/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);

    await user.type(usernameInput, "testuser");
    await user.type(passwordInput, "testpass123");

    expect(usernameInput.value).toBe("testuser");
    expect(passwordInput.value).toBe("testpass123");
  });

  it("should show error when submitting empty form", async () => {
    const user = userEvent.setup();
    renderWithRouter(<Login />);

    const submitBtn = screen.getByRole("button", { name: /iniciar sesión/i });
    await user.click(submitBtn);

    expect(screen.getByText(/por favor complete todos los campos/i)).toBeInTheDocument();
  });

  it("should call login function on form submit", async () => {
    const user = userEvent.setup();
    const mockLoginResponse = {
      success: true,
      token: "jwt-token",
      user: {
        id: 1,
        username: "testuser",
        name: "Test User",
        email: "test@test.com",
        role: "customer",
      },
    };

    api.apiPost.mockResolvedValue(mockLoginResponse);

    renderWithRouter(<Login />);

    const usernameInput = screen.getByLabelText(/usuario/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    const submitBtn = screen.getByRole("button", { name: /iniciar sesión/i });

    await user.type(usernameInput, "testuser");
    await user.type(passwordInput, "testpass123");
    await user.click(submitBtn);

    await waitFor(() => {
      expect(api.apiPost).toHaveBeenCalledWith("/auth/login", {
        username: "testuser",
        password: "testpass123",
      });
    });
  });

  it("should toggle password visibility", async () => {
    const user = userEvent.setup();
    renderWithRouter(<Login />);

    const passwordInput = screen.getByLabelText(/contraseña/i);
    const toggleBtn = screen.getByRole("button", { name: /mostrar|ocultar/i });

    expect(passwordInput.type).toBe("password");

    await user.click(toggleBtn);

    expect(passwordInput.type).toBe("text");
  });
});
