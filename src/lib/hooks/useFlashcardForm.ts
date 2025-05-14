import { useState, useEffect, type FormEvent } from "react";
import { flashcardTextSchema, type FlashcardFormData } from "@/lib/schemas/flashcard.schema";
import type { ViewModelCandidate } from "@/types";

interface UseFlashcardFormProps {
  initialData?: (ViewModelCandidate | FlashcardFormData) | null;
  onSubmit: (data: FlashcardFormData) => void;
}

export function useFlashcardForm({ initialData, onSubmit }: UseFlashcardFormProps) {
  const [formData, setFormData] = useState<FlashcardFormData>(() => ({
    front_text: initialData?.front_text ?? "",
    back_text: initialData?.back_text ?? "",
  }));

  const [touched, setTouched] = useState<Record<keyof FlashcardFormData, boolean>>({
    front_text: false,
    back_text: false,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FlashcardFormData, string>>>({});
  const [isValid, setIsValid] = useState(false);

  // Reset form when initialData changes
  useEffect(() => {
    setFormData({
      front_text: initialData?.front_text ?? "",
      back_text: initialData?.back_text ?? "",
    });
    setTouched({
      front_text: false,
      back_text: false,
    });
    setErrors({});
  }, [initialData?.front_text, initialData?.back_text]);

  // Validate only touched fields or all fields if form was submitted
  useEffect(() => {
    const result = flashcardTextSchema.safeParse(formData);
    const newErrors: Partial<Record<keyof FlashcardFormData, string>> = {};

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;

      Object.keys(formData).forEach((field) => {
        const key = field as keyof FlashcardFormData;
        if (touched[key] && fieldErrors[key]?.[0]) {
          newErrors[key] = fieldErrors[key]?.[0];
        }
      });
    }

    setErrors(newErrors);
    setIsValid(result.success);
  }, [formData, touched]);

  const handleChange = (field: keyof FlashcardFormData) => (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTouched((prev) => ({
      ...prev,
      [field]: true,
    }));
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched on submit
    setTouched({
      front_text: true,
      back_text: true,
    });

    const result = flashcardTextSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        front_text: fieldErrors.front_text?.[0],
        back_text: fieldErrors.back_text?.[0],
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
