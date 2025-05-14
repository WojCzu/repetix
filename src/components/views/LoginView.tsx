import { useState } from "react";
import { LoginForm } from "../auth/LoginForm";
import type { LoginFormData } from "@/lib/schemas/auth.schema";

interface LoginViewProps {
  redirectTo: string;
}

export function LoginView({ redirectTo }: LoginViewProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "An unexpected error occurred");
      }

      // Reload the page to trigger server-side redirect
      window.location.href = redirectTo;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return <LoginForm onSubmit={handleLogin} isLoading={isLoading} />;
}
