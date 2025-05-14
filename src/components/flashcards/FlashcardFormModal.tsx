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
import type { FlashcardDto, FlashcardSource, FlashcardUpdateSource } from "@/types";
import { toast } from "sonner";
import { useState, useCallback, useMemo } from "react";

interface FlashcardFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "add" | "edit";
  initialData?: FlashcardDto;
  onSuccess: (flashcard: FlashcardDto) => void;
}

/**
 * Checks if the flashcard content has been modified from its initial state
 */
const isFlashcardModified = (
  original: FlashcardDto | undefined,
  updated: { front_text: string; back_text: string }
): boolean => {
  if (!original) return true; // If no original data, treat as modified (add mode)
  return original.front_text !== updated.front_text || original.back_text !== updated.back_text;
};

export function FlashcardFormModal({ isOpen, onClose, mode, initialData, onSuccess }: FlashcardFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(
    async (data: { front_text: string; back_text: string }) => {
      if (isSubmitting) return;
      setIsSubmitting(true);

      try {
        const isAdd = mode === "add";
        const source = isAdd
          ? ("manual" as FlashcardSource)
          : ((initialData?.source === "ai-full" ? "ai-edited" : initialData?.source) as FlashcardUpdateSource);

        // Prepare optimistic response
        const optimisticFlashcard: FlashcardDto = {
          id: initialData?.id || crypto.randomUUID(),
          front_text: data.front_text,
          back_text: data.back_text,
          source,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          generation_id: initialData?.generation_id || null,
        };

        onSuccess(optimisticFlashcard);

        const response = await fetch(isAdd ? "/api/flashcards" : `/api/flashcards/${initialData?.id}`, {
          method: isAdd ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(isAdd ? { cards: [{ ...data, source, generation_id: null }] } : { ...data, source }),
        });

        if (!response.ok) {
          throw new Error(`Failed to ${mode} flashcard`);
        }

        await response.json();

        toast.success("Success", {
          description: `Flashcard ${mode === "add" ? "created" : "updated"} successfully`,
        });

        onClose();
      } catch (error) {
        toast.error("Error", {
          description: `Failed to ${mode} flashcard. Please try again later.`,
        });
        throw error;
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSubmitting, mode, initialData, onSuccess, onClose]
  );

  const {
    formData,
    errors,
    isValid,
    handleChange,
    handleSubmit: handleFormSubmit,
  } = useFlashcardForm({
    initialData: initialData && {
      front_text: initialData.front_text,
      back_text: initialData.back_text,
    },
    onSubmit: handleSubmit,
  });

  const isModified = useMemo(() => {
    return mode === "add" || isFlashcardModified(initialData, formData);
  }, [mode, initialData, formData]);

  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      onClose();
    }
  }, [isSubmitting, onClose]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isSubmitting) {
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-[425px]" onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "Add New Flashcard" : "Edit Flashcard"}</DialogTitle>
          <DialogDescription>
            Edit the front and back text of your flashcard. Front text is limited to 200 characters, back text to 500
            characters.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleFormSubmit} className="space-y-4">
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
                disabled={isSubmitting}
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
                disabled={isSubmitting}
              />
              {errors.back_text && <ValidationMessage id="back-error" message={errors.back_text} />}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={!isValid || isSubmitting || !isModified}>
              {isSubmitting ? (
                <>
                  <span className="loading loading-spinner loading-sm mr-2" />
                  {mode === "add" ? "Adding..." : "Saving..."}
                </>
              ) : mode === "add" ? (
                "Add Flashcard"
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
