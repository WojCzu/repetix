import { describe, it, expect } from "vitest";
import {
  emailSchema,
  passwordSchema,
  loginSchema,
  registrationSchema,
  requestResetSchema,
  resetPasswordSchema,
  changePasswordSchema,
  type LoginFormData,
  type RegistrationFormData,
  type RequestResetFormData,
  type ResetPasswordFormData,
  type ChangePasswordFormData,
} from "../auth.schema";

describe("Auth Schemas", () => {
  describe("emailSchema", () => {
    it("validates valid email addresses", () => {
      const validEmails = [
        "test@example.com",
        "user.name@domain.com",
        "user+tag@example.com",
        "user-name@domain.co.uk",
        "first.last@subdomain.example.com",
      ];

      validEmails.forEach((email) => {
        const result = emailSchema.safeParse(email);
        expect(result.success).toBe(true);
      });
    });

    it("rejects invalid email addresses", () => {
      const invalidEmails = [
        "",
        "invalid",
        "user@",
        "@domain.com",
        "user@.com",
        "user@domain..com",
        "user name@domain.com",
        ".user@domain.com",
        "user@-domain.com",
      ];

      invalidEmails.forEach((email) => {
        const result = emailSchema.safeParse(email);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain("Invalid email format");
        }
      });
    });
  });

  describe("passwordSchema", () => {
    it("validates password with minimum length", () => {
      const validPasswords = ["password123", "securePassword!", "12345678", "abcdefghijklmnopqrstuvwxyz"];

      validPasswords.forEach((password) => {
        const result = passwordSchema.safeParse(password);
        expect(result.success).toBe(true);
      });
    });

    it("rejects passwords that are too short", () => {
      const invalidPasswords = ["", "pass", "1234", "short"];

      invalidPasswords.forEach((password) => {
        const result = passwordSchema.safeParse(password);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain("Password must be at least 8 characters long");
        }
      });
    });
  });

  describe("loginSchema", () => {
    it("validates valid login data", () => {
      const validData: LoginFormData = {
        email: "test@example.com",
        password: "password123",
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("rejects login data with invalid email", () => {
      const invalidData = {
        email: "invalid-email",
        password: "password123",
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("email");
        expect(result.error.issues[0].message).toContain("Invalid email format");
      }
    });

    it("rejects login data with empty password", () => {
      const invalidData = {
        email: "test@example.com",
        password: "",
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("password");
        expect(result.error.issues[0].message).toContain("Password is required");
      }
    });

    it("rejects login data with missing fields", () => {
      const invalidData1 = { email: "test@example.com" };
      const invalidData2 = { password: "password123" };
      const invalidData3 = {};

      [invalidData1, invalidData2, invalidData3].forEach((data) => {
        const result = loginSchema.safeParse(data);
        expect(result.success).toBe(false);
      });
    });
  });

  describe("registrationSchema", () => {
    it("validates valid registration data", () => {
      const validData: RegistrationFormData = {
        email: "test@example.com",
        password: "password123",
        confirmPassword: "password123",
      };

      const result = registrationSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("rejects registration data with invalid email", () => {
      const invalidData = {
        email: "invalid-email",
        password: "password123",
        confirmPassword: "password123",
      };

      const result = registrationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("email");
      }
    });

    it("rejects registration data with short password", () => {
      const invalidData = {
        email: "test@example.com",
        password: "short",
        confirmPassword: "short",
      };

      const result = registrationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("password");
        expect(result.error.issues[0].message).toContain("Password must be at least 8 characters long");
      }
    });

    it("rejects registration data with mismatched passwords", () => {
      const invalidData = {
        email: "test@example.com",
        password: "password123",
        confirmPassword: "differentPassword",
      };

      const result = registrationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("confirmPassword");
        expect(result.error.issues[0].message).toContain("Passwords do not match");
      }
    });

    it("rejects registration data with missing fields", () => {
      const testCases = [
        { email: "test@example.com", password: "password123" },
        { email: "test@example.com", confirmPassword: "password123" },
        { password: "password123", confirmPassword: "password123" },
        {},
      ];

      testCases.forEach((data) => {
        const result = registrationSchema.safeParse(data);
        expect(result.success).toBe(false);
      });
    });
  });

  describe("requestResetSchema", () => {
    it("validates valid reset request data", () => {
      const validData: RequestResetFormData = {
        email: "test@example.com",
      };

      const result = requestResetSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("rejects reset request with invalid email", () => {
      const invalidData = {
        email: "invalid-email",
      };

      const result = requestResetSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("email");
        expect(result.error.issues[0].message).toContain("Invalid email format");
      }
    });

    it("rejects reset request with missing email", () => {
      const invalidData = {};

      const result = requestResetSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("resetPasswordSchema", () => {
    it("validates valid password reset data", () => {
      const validData: ResetPasswordFormData = {
        token: "valid-token",
        newPassword: "newPassword123",
        confirmPassword: "newPassword123",
      };

      const result = resetPasswordSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("rejects reset with empty token", () => {
      const invalidData = {
        token: "",
        newPassword: "newPassword123",
        confirmPassword: "newPassword123",
      };

      const result = resetPasswordSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("token");
        expect(result.error.issues[0].message).toContain("Token is required");
      }
    });

    it("rejects reset with short new password", () => {
      const invalidData = {
        token: "valid-token",
        newPassword: "short",
        confirmPassword: "short",
      };

      const result = resetPasswordSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("newPassword");
        expect(result.error.issues[0].message).toContain("Password must be at least 8 characters long");
      }
    });

    it("rejects reset with mismatched passwords", () => {
      const invalidData = {
        token: "valid-token",
        newPassword: "newPassword123",
        confirmPassword: "differentPassword",
      };

      const result = resetPasswordSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("confirmPassword");
        expect(result.error.issues[0].message).toContain("Passwords do not match");
      }
    });

    it("rejects reset with missing fields", () => {
      const testCases = [
        { token: "valid-token", newPassword: "newPassword123" },
        { token: "valid-token", confirmPassword: "newPassword123" },
        { newPassword: "newPassword123", confirmPassword: "newPassword123" },
        {},
      ];

      testCases.forEach((data) => {
        const result = resetPasswordSchema.safeParse(data);
        expect(result.success).toBe(false);
      });
    });
  });

  describe("changePasswordSchema", () => {
    it("validates valid password change data", () => {
      const validData: ChangePasswordFormData = {
        currentPassword: "currentPass123",
        newPassword: "newPassword123",
        confirmPassword: "newPassword123",
      };

      const result = changePasswordSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("rejects change with empty current password", () => {
      const invalidData = {
        currentPassword: "",
        newPassword: "newPassword123",
        confirmPassword: "newPassword123",
      };

      const result = changePasswordSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("currentPassword");
        expect(result.error.issues[0].message).toContain("Current password is required");
      }
    });

    it("rejects change with short new password", () => {
      const invalidData = {
        currentPassword: "currentPass123",
        newPassword: "short",
        confirmPassword: "short",
      };

      const result = changePasswordSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("newPassword");
        expect(result.error.issues[0].message).toContain("Password must be at least 8 characters long");
      }
    });

    it("rejects change with mismatched passwords", () => {
      const invalidData = {
        currentPassword: "currentPass123",
        newPassword: "newPassword123",
        confirmPassword: "differentPassword",
      };

      const result = changePasswordSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("confirmPassword");
        expect(result.error.issues[0].message).toContain("Passwords do not match");
      }
    });

    it("rejects change with missing fields", () => {
      const testCases = [
        { currentPassword: "currentPass123", newPassword: "newPassword123" },
        { currentPassword: "currentPass123", confirmPassword: "newPassword123" },
        { newPassword: "newPassword123", confirmPassword: "newPassword123" },
        {},
      ];

      testCases.forEach((data) => {
        const result = changePasswordSchema.safeParse(data);
        expect(result.success).toBe(false);
      });
    });
  });

  describe("Type inference", () => {
    it("correctly infers types from schemas", () => {
      // Typescript will catch type errors at compile time, but we can do simple runtime checks

      // Create objects of each type and verify they pass schema validation
      const loginData: LoginFormData = { email: "user@example.com", password: "password123" };
      expect(loginSchema.safeParse(loginData).success).toBe(true);

      const registrationData: RegistrationFormData = {
        email: "user@example.com",
        password: "password123",
        confirmPassword: "password123",
      };
      expect(registrationSchema.safeParse(registrationData).success).toBe(true);

      const requestResetData: RequestResetFormData = { email: "user@example.com" };
      expect(requestResetSchema.safeParse(requestResetData).success).toBe(true);

      const resetPasswordData: ResetPasswordFormData = {
        token: "token123",
        newPassword: "newPassword123",
        confirmPassword: "newPassword123",
      };
      expect(resetPasswordSchema.safeParse(resetPasswordData).success).toBe(true);

      const changePasswordData: ChangePasswordFormData = {
        currentPassword: "currentPass123",
        newPassword: "newPassword123",
        confirmPassword: "newPassword123",
      };
      expect(changePasswordSchema.safeParse(changePasswordData).success).toBe(true);
    });
  });

  describe("Edge cases", () => {
    it("handles whitespace in emails", () => {
      // Emails with whitespace should be invalid
      expect(emailSchema.safeParse("user @example.com").success).toBe(false);
      expect(emailSchema.safeParse(" user@example.com").success).toBe(false);
      expect(emailSchema.safeParse("user@example.com ").success).toBe(false);
    });

    it("handles extremely long input values", () => {
      // Create very long strings
      const longEmail = `${"a".repeat(100)}@${"b".repeat(100)}.com`;
      const longPassword = "a".repeat(100);

      // These should still be valid (Zod doesn't impose maximum length by default)
      expect(emailSchema.safeParse(longEmail).success).toBe(true);
      expect(passwordSchema.safeParse(longPassword).success).toBe(true);
    });

    it("handles non-string inputs", () => {
      // Non-string inputs should be invalid
      const testValues = [null, undefined, 123, true, {}, []];

      testValues.forEach((value) => {
        expect(emailSchema.safeParse(value).success).toBe(false);
        expect(passwordSchema.safeParse(value).success).toBe(false);
      });
    });
  });
});
