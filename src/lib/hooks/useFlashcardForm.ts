import { useState, useEffect, type FormEvent } from "react";
import { flashcardTextSchema, type FlashcardFormData } from "@/lib/schemas/flashcard.schema";
import type { ViewModelCandidate } from "@/types";

interface UseFlashcardFormProps {
  initialData?: ViewModelCandidate | null;
  onSubmit: (data: FlashcardFormData) => void;
}

export function useFlashcardForm({ initialData, onSubmit }: UseFlashcardFormProps) {
  const [formData, setFormData] = useState<FlashcardFormData>({
    front_text: "",
    back_text: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FlashcardFormData, string>>>({});
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        front_text: initialData.front_text,
        back_text: initialData.back_text,
      });
    }
  }, [initialData]);

  useEffect(() => {
    const result = flashcardTextSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        front_text: fieldErrors.front_text?.[0] || undefined,
        back_text: fieldErrors.back_text?.[0] || undefined,
      });
      setIsValid(false);
    } else {
      setErrors({});
      setIsValid(true);
    }
  }, [formData]);

  const handleChange = (field: keyof FlashcardFormData) => (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const result = flashcardTextSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        front_text: fieldErrors.front_text?.[0] || undefined,
        back_text: fieldErrors.back_text?.[0] || undefined,
      });
      return;
    }

    onSubmit(result.data);
  };

  return {
    formData,
    errors,
    isValid,
    handleChange,
    handleSubmit,
  };
}
