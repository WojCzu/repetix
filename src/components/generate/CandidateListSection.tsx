import { CandidateCard } from "./CandidateCard";
import { BatchActionBar } from "./BatchActionBar";
import { CardListSkeleton } from "./CardListSkeleton";
import type { ViewModelCandidate } from "../../types";

interface CandidateListSectionProps {
  candidates: ViewModelCandidate[];
  isLoading: boolean;
  isSaving: boolean;
  onEdit: (id: string) => void;
  onAcceptToggle: (id: string) => void;
  onReject: (id: string) => void;
  onSaveAll: () => void;
  onSaveAccepted: () => void;
}

export function CandidateListSection({
  candidates,
  isLoading,
  isSaving,
  onEdit,
  onAcceptToggle,
  onReject,
  onSaveAll,
  onSaveAccepted,
}: CandidateListSectionProps) {
  if (isLoading) {
    return <CardListSkeleton />;
  }

  if (candidates.length === 0) {
    return null;
  }

  const acceptedCount = candidates.filter((c) => c.isAccepted).length;

  return (
    <div className="space-y-6">
      <BatchActionBar
        acceptedCount={acceptedCount}
        totalCount={candidates.length}
        onSaveAll={onSaveAll}
        onSaveAccepted={onSaveAccepted}
        isSaving={isSaving}
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {candidates.map((candidate) => (
          <CandidateCard
            key={candidate.id}
            candidate={candidate}
            onAcceptToggle={onAcceptToggle}
            onEdit={onEdit}
            onReject={onReject}
          />
        ))}
      </div>
    </div>
  );
}
