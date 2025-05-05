import { useState, useEffect, type FormEvent } from "react";
import { textInputSchema, type GenerateFormData } from "@/lib/validations/generate";

interface UseGenerateFormProps {
  onSubmit: (data: GenerateFormData) => void;
  isSubmitting?: boolean;
}

export function useGenerateForm({ onSubmit, isSubmitting = false }: UseGenerateFormProps) {
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    if (!text) {
      setError(null);
      setIsValid(false);
      return;
    }

    const result = textInputSchema.safeParse({ text });
    if (!result.success) {
      setError(result.error.errors[0]?.message || null);
      setIsValid(false);
    } else {
      setError(null);
      setIsValid(true);
    }
  }, [text]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const result = textInputSchema.safeParse({ text });
    if (!result.success) {
      setError(result.error.errors[0]?.message || null);
      return;
    }

    onSubmit(result.data);
  };

  return {
    text,
    error,
    isValid,
    setText,
    handleSubmit,
    isSubmitting,
  };
}
