import { type ChangeEvent } from "react";
import { Button } from "../ui/button";
import { TextareaWithCounter } from "../ui/TextareaWithCounter";
import { ValidationMessage } from "../ui/ValidationMessage";
import { useGenerateForm } from "@/lib/hooks/useGenerateForm";
import type { GenerateFormData } from "@/lib/validations/generate";

interface TextInputSectionProps {
  onSubmit: (data: GenerateFormData) => void;
  isSubmitting?: boolean;
}

export default function TextInputSection({ onSubmit, isSubmitting }: TextInputSectionProps) {
  const { text, error, isValid, setText, handleSubmit } = useGenerateForm({
    onSubmit,
    isSubmitting,
  });

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <TextareaWithCounter
          value={text}
          onChange={handleChange}
          maxLength={10000}
          className="min-h-[200px]"
          placeholder="Enter your text to generate flashcards from"
          aria-describedby="input-validation"
        />
      </div>

      <ValidationMessage id="input-validation" message={error} />

      <Button type="submit" disabled={!isValid || isSubmitting} className="w-full sm:w-auto">
        {isSubmitting ? (
          <>
            <span className="loading loading-spinner loading-sm mr-2" />
            Generating...
          </>
        ) : (
          "Generate Flashcards"
        )}
      </Button>
    </form>
  );
}
