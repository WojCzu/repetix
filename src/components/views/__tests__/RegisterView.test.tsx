import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RegisterView } from "../RegisterView";

// Mock auth schema to isolate component from validation logic
vi.mock("@/lib/schemas/auth.schema", () => ({
  registrationSchema: {
    parse: vi.fn().mockImplementation((data) => data),
  },
  emailSchema: { parse: vi.fn() },
  passwordSchema: { parse: vi.fn() },
}));

// Mock RegistrationForm component to focus on RegisterView's responsibilities
vi.mock("../../auth/RegistrationForm", () => ({
  RegistrationForm: vi.fn(({ onSubmit, isLoading }) => (
    <div data-testid="registration-form">
      <form
        data-testid="mock-registration-form"
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
          {isLoading ? "Creating account..." : "Create account"}
        </button>
      </form>
    </div>
  )),
}));

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

describe("RegisterView", () => {
  // Set up mock user for simulating user interactions
  const user = userEvent.setup();

  beforeEach(() => {
    // Reset mocks before each test
    mockFetch.mockReset();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("renders the registration form initially", () => {
    render(<RegisterView />);

    expect(screen.getByTestId("registration-form")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create account/i })).toBeInTheDocument();
  });

  it("passes the registration handler to RegistrationForm", async () => {
    // Mock successful API response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    render(<RegisterView />);

    // Submit form
    await user.click(screen.getByRole("button", { name: /create account/i }));

    // Verify fetch was called correctly
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: "test@example.com", password: "password123" }),
      });
    });
  });

  it("shows verification message after successful registration", async () => {
    // Mock successful API response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    render(<RegisterView />);

    // Submit form
    await user.click(screen.getByRole("button", { name: /create account/i }));

    // Verify verification message is displayed
    await waitFor(() => {
      expect(screen.getByText(/check your email/i)).toBeInTheDocument();
      expect(screen.getByText(/we have sent you an email with a verification link/i)).toBeInTheDocument();
    });
  });

  it("handles API error responses correctly", async () => {
    // Mock failed API response (e.g., email already in use)
    const errorMessage = "Email already in use";
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: errorMessage }),
    });

    render(<RegisterView />);

    // Submit form
    await user.click(screen.getByRole("button", { name: /create account/i }));

    // Verify proper error handling - verification message should not be displayed
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
      expect(screen.queryByText(/check your email/i)).not.toBeInTheDocument();
    });
  });

  it("handles network errors during registration", async () => {
    // Mock network error
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    render(<RegisterView />);

    // Submit form
    await user.click(screen.getByRole("button", { name: /create account/i }));

    // Verify verification message is not displayed
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
      expect(screen.queryByText(/check your email/i)).not.toBeInTheDocument();
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

    render(<RegisterView />);

    // Submit form
    await user.click(screen.getByRole("button", { name: /create account/i }));

    // Verify button is in loading state
    expect(screen.getByRole("button", { name: /creating account/i })).toBeDisabled();

    // Wait for API response to complete and verification message to appear
    await waitFor(() => {
      expect(screen.getByText(/check your email/i)).toBeInTheDocument();
    });
  });
});
