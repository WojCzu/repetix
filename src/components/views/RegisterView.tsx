import { useState } from "react";
import { RegistrationForm } from "../auth/RegistrationForm";
import type { RegistrationFormData } from "@/lib/schemas/auth.schema";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export function RegisterView() {
  const [isLoading, setIsLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  const handleRegister = async (data: Pick<RegistrationFormData, "email" | "password">) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error);
      }

      setVerificationSent(true);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (verificationSent) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Check your email</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground">
            We have sent you an email with a verification link. Please check your inbox and click the link to verify
            your account.
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            After verification, you will be redirected to the login page.
          </p>
        </CardContent>
      </Card>
    );
  }

  return <RegistrationForm onSubmit={handleRegister} isLoading={isLoading} />;
}
