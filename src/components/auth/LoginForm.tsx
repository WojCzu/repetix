import { useState, type ChangeEvent, type FormEvent } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { ValidationMessage } from "../ui/ValidationMessage";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Link } from "../ui/link";
import { loginSchema, type LoginFormData } from "@/lib/schemas/auth.schema";

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => Promise<void>;
  isLoading?: boolean;
}

export function LoginForm({ onSubmit, isLoading = false }: LoginFormProps) {
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: keyof LoginFormData) => (e: ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    // Clear field-specific error when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const { [field]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const validateForm = () => {
    try {
      loginSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof Error) {
        const zodError = error as { errors?: { path: string[]; message: string }[] };
        if (zodError.errors) {
          const validationErrors: Record<string, string> = {};
          zodError.errors.forEach((err) => {
            const field = err.path[0];
            if (field && typeof field === "string") {
              validationErrors[field] = err.message;
            }
          });
          setErrors(validationErrors);
        }
      }
      return false;
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Sanitize input data by trimming whitespace
    const sanitizedData = {
      email: formData.email.trim(),
      password: formData.password.trim(),
    };

    setIsSubmitting(true);
    try {
      await onSubmit(sanitizedData);
    } catch (error) {
      if (error instanceof Error) {
        // Map common Supabase errors to user-friendly messages
        const errorMessage = error.message.toLowerCase();
        if (errorMessage.includes("invalid login credentials")) {
          setErrors({ submit: "Invalid email or password" });
        } else if (errorMessage.includes("network")) {
          setErrors({ submit: "Network error. Please check your connection and try again." });
        } else {
          setErrors({ submit: error.message });
        }
      } else {
        setErrors({ submit: "An unexpected error occurred" });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormDisabled = isLoading || isSubmitting;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign in to your account</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit} noValidate>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={handleChange("email")}
              placeholder="name@example.com"
              required
              disabled={isFormDisabled}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
            />
            {errors.email && <ValidationMessage id="email-error" message={errors.email} />}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={handleChange("password")}
              required
              disabled={isFormDisabled}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "password-error" : undefined}
            />
            {errors.password && <ValidationMessage id="password-error" message={errors.password} />}
          </div>

          {errors.submit && <ValidationMessage id="submit-error" message={errors.submit} role="alert" />}
        </CardContent>

        <CardFooter className="flex flex-col space-y-4 pt-6">
          <Button type="submit" className="w-full" disabled={isFormDisabled}>
            {isFormDisabled ? "Signing in..." : "Sign in"}
          </Button>
          <div className="flex flex-col space-y-2 text-center text-sm text-muted-foreground">
            <p>
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-primary hover:underline">
                Create an account
              </Link>
            </p>
            <p>
              <Link href="/reset-password" className="text-primary hover:underline">
                Forgot your password?
              </Link>
            </p>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
