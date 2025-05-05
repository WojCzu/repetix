import TextInputSection from "../generate/TextInputSection";
import { CandidateListSection } from "../generate/CandidateListSection";
import { EditFlashcardModal } from "../generate/EditFlashcardModal";
import { GenerateFormProvider, useGenerateFormContext } from "@/lib/contexts/GenerateFormContext";

function GenerateViewContent() {
  const { generationError, editCandidate, editingCandidate, cancelEditing } = useGenerateFormContext();

  return (
    <div className="space-y-8">
      <TextInputSection />

      {generationError && (
        <div role="alert" className="p-4 text-destructive bg-destructive/10 rounded-md">
          {generationError}
        </div>
      )}

      <CandidateListSection />

      <EditFlashcardModal
        isOpen={editingCandidate !== null}
        candidate={editingCandidate}
        onSave={editCandidate}
        onCancel={cancelEditing}
      />
    </div>
  );
}

export default function GenerateView() {
  return (
    <GenerateFormProvider>
      <GenerateViewContent />
    </GenerateFormProvider>
  );
}
