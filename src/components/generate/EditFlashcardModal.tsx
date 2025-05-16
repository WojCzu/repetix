import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { TextareaWithCounter } from "../ui/TextareaWithCounter";
import { ValidationMessage } from "@/components/ui/ValidationMessage";
import { useFlashcardForm } from "@/lib/hooks/useFlashcardForm";
import type { ViewModelCandidate } from "@/types";
import type { FlashcardFormData } from "@/lib/schemas/flashcard.schema";
import { useEffect } from "react";

interface EditFlashcardModalProps {
  isOpen: boolean;
  candidate: ViewModelCandidate | null;
  onSave: (id: string, data: FlashcardFormData) => void;
  onCancel: () => void;
}

export function EditFlashcardModal({ isOpen, candidate, onSave, onCancel }: EditFlashcardModalProps) {
  const { formData, errors, isValid, handleChange, handleSubmit, resetForm } = useFlashcardForm({
    initialData: candidate,
    onSubmit: (data) => candidate && onSave(candidate.id, data),
  });

  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen, resetForm]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Flashcard</DialogTitle>
          <DialogDescription>
            Edit the front and back text of your flashcard. Front text is limited to 200 characters, back text to 500
            characters.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              />
              {errors.back_text && <ValidationMessage id="back-error" message={errors.back_text} />}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={!isValid}>
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
