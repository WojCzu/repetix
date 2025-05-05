import { CandidateCard } from "./CandidateCard";
import { BatchActionBar } from "./BatchActionBar";
import { CardListSkeleton } from "./CardListSkeleton";
import { useGenerateFormContext } from "@/lib/contexts/GenerateFormContext";
import type { CreateFlashcardsCommandDto, ViewModelCandidate } from "@/types";
import { useState } from "react";
import { toast } from "sonner";

type Status = "idle" | "loading" | "success" | "error";
export function CandidateListSection() {
  const {
    candidates,
    generationStatus,
    generationId,
    startEditing,
    acceptCandidate,
    rejectCandidate,
    clearGeneration,
  } = useGenerateFormContext();
  const [saveStatus, setSaveStatus] = useState<Status>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);

  const isLoading = generationStatus === "loading";
  const isSaving = saveStatus === "loading";

  const createSaveCommand = (cardsToSave: ViewModelCandidate[]): CreateFlashcardsCommandDto => ({
    cards: cardsToSave.map((candidate) => ({
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      generation_id: generationId!,
      front_text: candidate.front_text,
      back_text: candidate.back_text,
      source: candidate.isEdited ? "ai-edited" : "ai-full",
    })),
  });

  const saveFlashcards = async (cardsToSave: ViewModelCandidate[], description: string) => {
    if (!generationId || cardsToSave.length === 0) return;

    setSaveStatus("loading");
    setSaveError(null);

    try {
      const response = await fetch("/api/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createSaveCommand(cardsToSave)),
      });

      if (!response.ok) {
        throw new Error("Failed to save flashcards");
      }

      toast.success("Flashcards saved", {
        description,
      });

      clearGeneration();
      setSaveStatus("success");
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "An unexpected error occurred");
      setSaveStatus("error");
    }
  };

  const handleSaveAll = () => {
    const description = `Successfully saved ${candidates.length} ${
      candidates.length === 1 ? "flashcard" : "flashcards"
    }.`;
    saveFlashcards(candidates, description);
  };

  const handleSaveAccepted = () => {
    const acceptedCandidates = candidates.filter((c) => c.isAccepted);
    const description = `Successfully saved ${acceptedCandidates.length} accepted ${
      acceptedCandidates.length === 1 ? "flashcard" : "flashcards"
    }.`;
    saveFlashcards(acceptedCandidates, description);
  };

  if (isLoading) {
    return <CardListSkeleton />;
  }

  if (candidates.length === 0) {
    return null;
  }

  const acceptedCount = candidates.filter((c) => c.isAccepted).length;

  return (
    <div className="space-y-6">
      {saveError && (
        <div role="alert" className="p-4 text-destructive bg-destructive/10 rounded-md">
          {saveError}
        </div>
      )}

      <BatchActionBar
        acceptedCount={acceptedCount}
        totalCount={candidates.length}
        onSaveAll={handleSaveAll}
        onSaveAccepted={handleSaveAccepted}
        isSaving={isSaving}
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {candidates.map((candidate) => (
          <CandidateCard
            key={candidate.id}
            candidate={candidate}
            onAcceptToggle={acceptCandidate}
            onEdit={startEditing}
            onReject={rejectCandidate}
          />
        ))}
      </div>
    </div>
  );
}
