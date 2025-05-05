import { useState } from "react";
import type {
  CreateGenerationCommand,
  CreateGenerationResponseDto,
  ViewModelCandidate,
  CreateFlashcardsCommandDto,
} from "../../types";
import TextInputSection from "../generate/TextInputSection";
import { CandidateListSection } from "../generate/CandidateListSection";
import { EditFlashcardModal } from "../generate/EditFlashcardModal";
import { toast } from "sonner";
import type { FlashcardFormData } from "@/lib/validations/flashcard";
import type { GenerateFormData } from "@/lib/validations/generate";

type Status = "idle" | "loading" | "success" | "error";

/**
 * Checks if the flashcard content has been modified
 */
const isFlashcardModified = (original: ViewModelCandidate, updated: FlashcardFormData): boolean => {
  const fieldsToCompare = {
    front_text: original.front_text !== updated.front_text,
    back_text: original.back_text !== updated.back_text,
  };

  return Object.values(fieldsToCompare).some(Boolean);
};

/**
 * Updates flashcard with new content and sets isEdited flag if modified
 */
const updateFlashcardContent = (candidate: ViewModelCandidate, newContent: FlashcardFormData): ViewModelCandidate => {
  const wasModified = isFlashcardModified(candidate, newContent);

  return {
    ...candidate,
    front_text: newContent.front_text,
    back_text: newContent.back_text,
    isEdited: wasModified || candidate.isEdited, // Preserve isEdited if it was true before
  };
};

export default function GenerateView() {
  // Core state
  const [generationStatus, setGenerationStatus] = useState<Status>("idle");
  const [saveStatus, setSaveStatus] = useState<Status>("idle");
  const [candidates, setCandidates] = useState<ViewModelCandidate[]>([]);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [editingCandidate, setEditingCandidate] = useState<ViewModelCandidate | null>(null);
  const [generationId, setGenerationId] = useState<string | null>(null);

  const handleGenerateSubmit = async (data: GenerateFormData) => {
    setGenerationStatus("loading");
    setGenerationError(null);

    try {
      const response = await fetch("/api/generations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: data.text } as CreateGenerationCommand),
      });

      if (!response.ok) {
        throw new Error(`Generation failed: ${response.statusText}`);
      }

      const responseData = (await response.json()) as CreateGenerationResponseDto;
      setGenerationId(responseData.id);

      // Transform candidates to ViewModelCandidates
      const viewModelCandidates: ViewModelCandidate[] = responseData.candidates.map((candidate) => ({
        id: crypto.randomUUID(),
        front_text: candidate.front_text,
        back_text: candidate.back_text,
        isAccepted: false,
        isEdited: false,
      }));

      setCandidates(viewModelCandidates);
      setGenerationStatus("success");
      toast.success("Flashcards generated", {
        description: `Generated ${viewModelCandidates.length} flashcard candidates.`,
      });
    } catch (error) {
      setGenerationError(error instanceof Error ? error.message : "An unexpected error occurred");
      setGenerationStatus("error");
    }
  };

  const handleAcceptToggle = (id: string) => {
    setCandidates((prev) =>
      prev.map((candidate) => (candidate.id === id ? { ...candidate, isAccepted: true } : candidate))
    );
  };

  const handleEdit = (id: string) => {
    const candidate = candidates.find((c) => c.id === id);
    if (candidate) {
      setEditingCandidate(candidate);
    }
  };

  const handleSaveEdit = (id: string, data: FlashcardFormData) => {
    setCandidates((prev) =>
      prev.map((candidate) => (candidate.id === id ? updateFlashcardContent(candidate, data) : candidate))
    );
    setEditingCandidate(null);
  };

  const handleReject = (id: string) => {
    setCandidates((prev) =>
      prev.map((candidate) => (candidate.id === id ? { ...candidate, isAccepted: false } : candidate))
    );
  };

  const createSaveCommand = (cardsToSave: ViewModelCandidate[]): CreateFlashcardsCommandDto => ({
    cards: cardsToSave.map((candidate) => ({
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      generation_id: generationId!,
      front_text: candidate.front_text,
      back_text: candidate.back_text,
      source: candidate.isEdited ? "ai-edited" : "ai-full",
    })),
  });

  const handleSaveAll = async () => {
    if (!generationId || candidates.length === 0) return;

    setSaveStatus("loading");
    setSaveError(null);

    try {
      const response = await fetch("/api/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createSaveCommand(candidates)),
      });

      if (!response.ok) {
        throw new Error("Failed to save flashcards");
      }

      toast.success("Flashcards saved", {
        description: `Successfully saved ${candidates.length} flashcards`,
      });

      setCandidates([]);
      setGenerationId(null);
      setSaveStatus("success");
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "An unexpected error occurred");
      setSaveStatus("error");
    }
  };

  const handleSaveAccepted = async () => {
    if (!generationId) return;
    const acceptedCandidates = candidates.filter((c) => c.isAccepted);
    if (acceptedCandidates.length === 0) return;

    setSaveStatus("loading");
    setSaveError(null);

    try {
      const response = await fetch("/api/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createSaveCommand(acceptedCandidates)),
      });

      if (!response.ok) {
        throw new Error("Failed to save flashcards");
      }

      toast.success("Flashcards saved", {
        description: `Successfully saved ${acceptedCandidates.length} flashcards`,
      });

      setCandidates([]);
      setGenerationId(null);
      setSaveStatus("success");
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "An unexpected error occurred");
      setSaveStatus("error");
    }
  };

  return (
    <div className="space-y-8">
      <TextInputSection onSubmit={handleGenerateSubmit} isSubmitting={generationStatus === "loading"} />

      {generationError && (
        <div role="alert" className="p-4 text-destructive bg-destructive/10 rounded-md">
          {generationError}
        </div>
      )}

      <CandidateListSection
        candidates={candidates}
        isLoading={generationStatus === "loading"}
        isSaving={saveStatus === "loading"}
        onEdit={handleEdit}
        onAcceptToggle={handleAcceptToggle}
        onReject={handleReject}
        onSaveAll={handleSaveAll}
        onSaveAccepted={handleSaveAccepted}
      />

      {saveError && (
        <div role="alert" className="p-4 text-destructive bg-destructive/10 rounded-md">
          {saveError}
        </div>
      )}

      <EditFlashcardModal
        isOpen={editingCandidate !== null}
        candidate={editingCandidate}
        onSave={handleSaveEdit}
        onCancel={() => setEditingCandidate(null)}
        isSaving={false}
      />
    </div>
  );
}
