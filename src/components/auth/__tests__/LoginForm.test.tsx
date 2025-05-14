import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "../LoginForm";
import { axe } from "../../../test/vitest.setup";
import type { LoginFormData } from "@/lib/schemas/auth.schema";

// Mock zewnętrznych zależności
vi.mock("@/lib/schemas/auth.schema", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/schemas/auth.schema")>();
  return {
    ...actual,
    loginSchema: {
      parse: vi.fn((data: LoginFormData) => {
        const errors: { errors?: { path: string[]; message: string }[] } = { errors: [] };

        if (!data.email) {
          errors.errors?.push({ path: ["email"], message: "Email is required" });
        } else if (!data.email.includes("@")) {
          errors.errors?.push({ path: ["email"], message: "Invalid email format" });
        }

        if (!data.password) {
          errors.errors?.push({ path: ["password"], message: "Password is required" });
        } else if (data.password.length < 8) {
          errors.errors?.push({
            path: ["password"],
            message: "Password must be at least 8 characters long",
          });
        }

        if (errors.errors?.length) {
          const error = new Error("Validation failed");
          Object.assign(error, errors);
          throw error;
        }

        return data;
      }),
    },
  };
});

describe("LoginForm", () => {
  const mockOnSubmit = vi.fn();
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    mockOnSubmit.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders all required form elements", () => {
      render(<LoginForm onSubmit={mockOnSubmit} />);

      expect(screen.getByText(/sign in to your account/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
      expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
      expect(screen.getByText(/forgot your password/i)).toBeInTheDocument();
    });

    it("renders with proper ARIA attributes for accessibility", () => {
      render(<LoginForm onSubmit={mockOnSubmit} />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      expect(emailInput).toHaveAttribute("aria-invalid", "false");
      expect(emailInput).not.toHaveAttribute("aria-describedby");
      expect(passwordInput).toHaveAttribute("aria-invalid", "false");
      expect(passwordInput).not.toHaveAttribute("aria-describedby");
    });

    it("disables form elements when isLoading is true", () => {
      render(<LoginForm onSubmit={mockOnSubmit} isLoading={true} />);

      expect(screen.getByLabelText(/email/i)).toBeDisabled();
      expect(screen.getByLabelText(/password/i)).toBeDisabled();
      expect(screen.getByRole("button", { name: /signing in/i })).toBeDisabled();
    });

    it("changes button text when isLoading is true", () => {
      render(<LoginForm onSubmit={mockOnSubmit} isLoading={true} />);

      expect(screen.getByRole("button", { name: /signing in/i })).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /sign in$/i })).not.toBeInTheDocument();
    });

    it("has no accessibility violations", async () => {
      const { container } = render(<LoginForm onSubmit={mockOnSubmit} />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("Form Validation", () => {
    it("shows validation error for empty email", async () => {
      render(<LoginForm onSubmit={mockOnSubmit} />);

      const submitButton = screen.getByRole("button", { name: /sign in$/i });
      await user.click(submitButton);

      expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it("shows validation error for invalid email format", async () => {
      render(<LoginForm onSubmit={mockOnSubmit} />);

      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, "invalid-email");

      const submitButton = screen.getByRole("button", { name: /sign in$/i });
      await user.click(submitButton);

      expect(await screen.findByText(/invalid email format/i)).toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it("shows validation error for empty password", async () => {
      render(<LoginForm onSubmit={mockOnSubmit} />);

      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, "test@example.com");

      const submitButton = screen.getByRole("button", { name: /sign in$/i });
      await user.click(submitButton);

      expect(await screen.findByText(/password is required/i)).toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it("shows validation error for too short password", async () => {
      render(<LoginForm onSubmit={mockOnSubmit} />);

      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, "test@example.com");

      const passwordInput = screen.getByLabelText(/password/i);
      await user.type(passwordInput, "short");

      const submitButton = screen.getByRole("button", { name: /sign in$/i });
      await user.click(submitButton);

      expect(await screen.findByText(/password must be at least 8 characters long/i)).toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it("clears field-specific error when user starts typing", async () => {
      render(<LoginForm onSubmit={mockOnSubmit} />);

      // Trigger validation error
      const submitButton = screen.getByRole("button", { name: /sign in$/i });
      await user.click(submitButton);

      // Verify error is shown
      const emailError = await screen.findByText(/email is required/i);
      expect(emailError).toBeInTheDocument();

      // Type in the field
      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, "a");

      // Verify error is cleared
      await waitFor(() => {
        expect(screen.queryByText(/email is required/i)).not.toBeInTheDocument();
      });
    });
  });

  describe("Form Submission", () => {
    it("calls onSubmit with correct data on valid form submission", async () => {
      render(<LoginForm onSubmit={mockOnSubmit} />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole("button", { name: /sign in$/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledTimes(1);
        expect(mockOnSubmit).toHaveBeenCalledWith({
          email: "test@example.com",
          password: "password123",
        });
      });
    });

    it("displays API error message when onSubmit throws an error", async () => {
      mockOnSubmit.mockRejectedValueOnce(new Error("Invalid login credentials"));

      render(<LoginForm onSubmit={mockOnSubmit} />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole("button", { name: /sign in$/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      // Sprawdzamy nie tylko czy element alert istnieje, ale również jego zawartość
      const errorMessage = await screen.findByRole("alert");
      expect(errorMessage).toHaveTextContent(/invalid email or password/i);
    });

    it("handles network error", async () => {
      mockOnSubmit.mockRejectedValueOnce(new Error("network"));

      render(<LoginForm onSubmit={mockOnSubmit} />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole("button", { name: /sign in$/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      // Sprawdzamy dokładną treść komunikatu błędu
      const errorMessage = await screen.findByRole("alert");
      expect(errorMessage).toHaveTextContent(/network error/i);
    });

    it("disables form during submission", async () => {
      // Create a delayed promise to check the form state during submission
      let resolveSubmit: ((value: unknown) => void) | undefined;
      mockOnSubmit.mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveSubmit = resolve;
          })
      );

      render(<LoginForm onSubmit={mockOnSubmit} />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole("button", { name: /sign in$/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");

      // Submit form
      const submitPromise = user.click(submitButton);

      // Check form state during submission
      await waitFor(() => {
        expect(emailInput).toBeDisabled();
        expect(passwordInput).toBeDisabled();
        expect(submitButton).toBeDisabled();
      });

      // Resolve the submission
      if (resolveSubmit) {
        resolveSubmit({});
      }
      await submitPromise;

      // Ensure form is enabled again
      await waitFor(() => {
        expect(emailInput).not.toBeDisabled();
        expect(passwordInput).not.toBeDisabled();
        expect(submitButton).not.toBeDisabled();
      });
    });

    it("passes correct submission state to UI", () => {
      // Test dla isLoading=true
      const { rerender } = render(<LoginForm onSubmit={mockOnSubmit} isLoading={true} />);

      const loadingButton = screen.getByRole("button", { name: /signing in/i });
      expect(loadingButton).toBeDisabled();

      // Test dla isLoading=false
      rerender(<LoginForm onSubmit={mockOnSubmit} isLoading={false} />);

      const enabledButton = screen.getByRole("button", { name: /sign in$/i });
      expect(enabledButton).not.toBeDisabled();
    });
  });

  describe("Edge Cases", () => {
    it("handles non-Error exceptions during form submission", async () => {
      mockOnSubmit.mockRejectedValueOnce("Unknown error");

      render(<LoginForm onSubmit={mockOnSubmit} />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole("button", { name: /sign in$/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      // Sprawdzamy dokładną treść komunikatu błędu
      const errorMessage = await screen.findByRole("alert");
      expect(errorMessage).toHaveTextContent(/an unexpected error occurred/i);
    });

    it("prevents submitting multiple times during an ongoing submission", async () => {
      // Create a promise that won't resolve during the test
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      mockOnSubmit.mockImplementationOnce(() => new Promise(() => {}));

      render(<LoginForm onSubmit={mockOnSubmit} />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole("button", { name: /sign in$/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");

      // First click
      await user.click(submitButton);

      // Second click attempt (should be prevented by disabled state)
      await user.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });

    it("sanitizes inputs by trimming whitespace", async () => {
      render(<LoginForm onSubmit={mockOnSubmit} />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole("button", { name: /sign in$/i });

      // Wprowadzamy dane z białymi znakami na początku i końcu
      await user.type(emailInput, " test@example.com ");
      await user.type(passwordInput, " password123 ");
      await user.click(submitButton);

      // Weryfikujemy, że do funkcji onSubmit zostały przekazane dane bez białych znaków
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          email: "test@example.com",
          password: "password123",
        });
      });
    });
  });

  describe("Snapshot Tests", () => {
    it("matches snapshot in default state", () => {
      const { asFragment } = render(<LoginForm onSubmit={mockOnSubmit} />);
      expect(asFragment()).toMatchSnapshot();
    });

    it("matches snapshot in loading state", () => {
      const { asFragment } = render(<LoginForm onSubmit={mockOnSubmit} isLoading={true} />);
      expect(asFragment()).toMatchSnapshot();
    });

    it("matches snapshot with validation errors", async () => {
      const { asFragment } = render(<LoginForm onSubmit={mockOnSubmit} />);

      const submitButton = screen.getByRole("button", { name: /sign in$/i });
      await user.click(submitButton);

      // Wait for validation errors to appear
      await screen.findByText(/email is required/i);

      expect(asFragment()).toMatchSnapshot();
    });
  });
});
