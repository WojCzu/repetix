import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PasswordStrengthMeter } from "../PasswordStrengthMeter";

describe("PasswordStrengthMeter", () => {
  // Tests for strength calculation
  describe("calculateStrength function", () => {
    const testCases = [
      { password: "", expected: 0, description: "empty password" },
      { password: "short", expected: 1, description: "short password" },
      { password: "password12345", expected: 3, description: "long password with lowercase and numbers" },
      { password: "Password12345", expected: 4, description: "password with uppercase, lowercase, and numbers" },
      {
        password: "Password!2345",
        expected: 5,
        description: "password with uppercase, lowercase, numbers, and special chars",
      },
      { password: "P@ssw0rd!", expected: 5, description: "strong password with all criteria" },
      { password: "P@ss1", expected: 4, description: "short password with all character types" },
    ];

    testCases.forEach(({ password, expected, description }) => {
      it(`should return strength ${expected} for ${description}`, () => {
        const { container } = render(<PasswordStrengthMeter password={password} />);

        // Count filled indicators
        const filledIndicators = container.querySelectorAll('[class*="bg-"]:not([class*="bg-muted"])').length;

        expect(filledIndicators).toBe(expected);
      });
    });
  });

  // Tests for visual representation
  describe("visual representation", () => {
    it("should display correct text based on password strength", () => {
      const strengthTexts = [
        { password: "", expected: "No Password" },
        { password: "pass", expected: "Very Weak" },
        { password: "password12345", expected: "Fair" },
        { password: "Password12345", expected: "Good" },
        { password: "Password!2345", expected: "Strong" },
        { password: "P@ssw0rd!", expected: "Strong" },
      ];

      strengthTexts.forEach(({ password, expected }) => {
        const { unmount } = render(<PasswordStrengthMeter password={password} />);
        expect(screen.getByText(expected)).toBeInTheDocument();
        unmount();
      });
    });

    it("should apply correct colors based on strength", () => {
      const strengthColors = [
        { password: "a", strengthClass: "bg-destructive" },
        { password: "Password1", strengthClass: "bg-green-500" },
        { password: "Password1!", strengthClass: "bg-green-600" },
        { password: "P@ssw0rd!", strengthClass: "bg-green-600" },
      ];

      strengthColors.forEach(({ password, strengthClass }) => {
        const { container, unmount } = render(<PasswordStrengthMeter password={password} />);

        // At least one indicator should have the expected color
        const hasColorClass = Array.from(container.querySelectorAll(".h-full.w-full")).some((element) =>
          element.className.includes(strengthClass)
        );
        expect(hasColorClass).toBe(true);

        unmount();
      });
    });

    it("should use bg-muted for unfilled indicators", () => {
      const { container } = render(<PasswordStrengthMeter password="a" />);

      // For strength 1, 4 indicators should be muted
      const mutedIndicators = container.querySelectorAll(".bg-muted").length;
      expect(mutedIndicators).toBeGreaterThan(0);
    });
  });

  // Test component props
  it("should apply custom className", () => {
    const customClass = "custom-test-class";
    const { container } = render(<PasswordStrengthMeter password="test" className={customClass} />);

    expect(container.firstChild).toHaveClass(customClass);
  });

  // Test the correct number of indicators
  it("should render 5 strength indicators", () => {
    const { container } = render(<PasswordStrengthMeter password="test" />);

    // Select only the strength meter indicators
    const indicators = container.querySelectorAll(".flex.h-2.w-full.gap-1 > div");
    expect(indicators.length).toBe(5);
  });

  // Snapshot test
  it("should match snapshot for different strength levels", () => {
    ["", "a", "password", "Password1", "P@ssw0rd!"].forEach((password) => {
      const { container, unmount } = render(<PasswordStrengthMeter password={password} />);
      expect(container.firstChild).toMatchSnapshot();
      unmount();
    });
  });
});
