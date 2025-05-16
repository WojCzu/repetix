import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TextareaWithCounter } from "@/components/ui/TextareaWithCounter";
import { ValidationMessage } from "@/components/ui/ValidationMessage";
import { useFlashcardForm } from "@/lib/hooks/useFlashcardForm";
import type { FlashcardDto } from "@/types";
import { useEffect } from "react";

interface FlashcardFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "add" | "edit";
  initialData?: FlashcardDto;
  onSuccess: (flashcard: FlashcardDto) => void;
}

export function FlashcardFormModal({ isOpen, onClose, mode, initialData, onSuccess }: FlashcardFormModalProps) {
  const {
    formData,
    errors,
    isValid,
    handleChange,
    handleSubmit: handleFormSubmit,
    resetForm,
  } = useFlashcardForm({
    initialData: initialData && {
      front_text: initialData.front_text,
      back_text: initialData.back_text,
    },
    onSubmit: (data) => {
      const flashcard: FlashcardDto = {
        id: initialData?.id || crypto.randomUUID(),
        front_text: data.front_text,
        back_text: data.back_text,
        source:
          mode === "add" ? "manual" : initialData?.source === "ai-full" ? "ai-edited" : initialData?.source || "manual",
        created_at: initialData?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
        generation_id: initialData?.generation_id || null,
      };

      onSuccess(flashcard);
    },
  });

  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen, resetForm]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent
        className="sm:max-w-[425px]"
        onOpenAutoFocus={(e) => e.preventDefault()}
        data-testid="flashcard-form-modal"
      >
        <DialogHeader>
          <DialogTitle data-testid="flashcard-form-title">
            {mode === "add" ? "Add New Flashcard" : "Edit Flashcard"}
          </DialogTitle>
          <DialogDescription>
            {mode === "add"
              ? "Create a new flashcard by entering front and back text. Front text is limited to 200 characters, back text to 500 characters."
              : "Edit the front and back text of your flashcard. Front text is limited to 200 characters, back text to 500 characters."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleFormSubmit} className="space-y-4" data-testid="flashcard-form">
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="front-text" className="text-sm font-medium">
                Front Text
              </label>
              <TextareaWithCounter
                id="front-text"
                value={formData.front_text}
                onChange={handleChange("front_text")}
                maxLength={200}
                placeholder="Enter front text"
                aria-describedby="front-error"
                data-testid="front-text-input"
              />
              {errors.front_text && <ValidationMessage id="front-error" message={errors.front_text} />}
            </div>

            <div className="grid gap-2">
              <label htmlFor="back-text" className="text-sm font-medium">
                Back Text
              </label>
              <TextareaWithCounter
                id="back-text"
                value={formData.back_text}
                onChange={handleChange("back_text")}
                maxLength={500}
                placeholder="Enter back text"
                aria-describedby="back-error"
                data-testid="back-text-input"
              />
              {errors.back_text && <ValidationMessage id="back-error" message={errors.back_text} />}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} data-testid="cancel-button">
              Cancel
            </Button>
            <Button type="submit" disabled={!isValid} data-testid="submit-button">
              {mode === "add" ? "Add Flashcard" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
