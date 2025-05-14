import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginView } from "../LoginView";

// Mock auth schema to isolate component from validation logic
vi.mock("@/lib/schemas/auth.schema", () => ({
  loginSchema: {
    parse: vi.fn().mockImplementation((data) => data),
  },
  emailSchema: { parse: vi.fn() },
  passwordSchema: { parse: vi.fn() },
}));

// Mock LoginForm component to focus on LoginView's responsibilities
vi.mock("../../auth/LoginForm", () => ({
  LoginForm: vi.fn(({ onSubmit, isLoading }) => (
    <div data-testid="login-form">
      <form
        data-testid="mock-form"
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            await onSubmit({ email: "test@example.com", password: "password123" });
          } catch (error) {
            // Intentionally catching the error here to avoid unhandled rejections
            // In a real component, this would be handled by the error state
          }
        }}
      >
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  )),
}));

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

// Mock window.location
const mockLocation = {
  href: "",
};
vi.stubGlobal("location", mockLocation);

describe("LoginView", () => {
  // Set up mock user for simulating user interactions
  const user = userEvent.setup();

  // Common redirect path
  const redirectPath = "/dashboard";

  beforeEach(() => {
    // Reset mocks before each test
    mockFetch.mockReset();
    mockLocation.href = "";
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("passes the onSubmit handler to LoginForm", async () => {
    // Mock successful API response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    render(<LoginView redirectTo={redirectPath} />);

    // Use the mocked form
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    // Verify fetch was called correctly
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: "test@example.com", password: "password123" }),
      });
    });

    // Verify redirection
    await waitFor(() => {
      expect(mockLocation.href).toBe(redirectPath);
    });
  });

  it("handles API error responses correctly", async () => {
    // Mock failed API response
    const errorMessage = "Invalid email or password";
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: errorMessage }),
    });

    render(<LoginView redirectTo={redirectPath} />);

    // Submit form
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    // Verify proper error handling - should throw an error that LoginForm would catch
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
      expect(mockLocation.href).not.toBe(redirectPath);
    });
  });

  it("handles network errors during login", async () => {
    // Mock network error
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    render(<LoginView redirectTo={redirectPath} />);

    // Submit form
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    // Verify no redirection happened
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
      expect(mockLocation.href).not.toBe(redirectPath);
    });
  });

  it("handles malformed API responses", async () => {
    // Mock response with unexpected format
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    });

    render(<LoginView redirectTo={redirectPath} />);

    // Submit form
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    // Verify no redirection happened
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
      expect(mockLocation.href).not.toBe(redirectPath);
    });
  });

  it("sets isLoading state during form submission", async () => {
    // Mock slow API response to test loading state
    mockFetch.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              ok: true,
              json: async () => ({ success: true }),
            });
          }, 100);
        })
    );

    render(<LoginView redirectTo={redirectPath} />);

    // Submit form
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    // Verify button is in loading state
    expect(screen.getByRole("button", { name: /signing in/i })).toBeDisabled();

    // Wait for API response to complete
    await waitFor(() => {
      expect(mockLocation.href).toBe(redirectPath);
    });
  });
});
