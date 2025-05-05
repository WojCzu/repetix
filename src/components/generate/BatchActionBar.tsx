import { Button } from "../ui/button";

interface BatchActionBarProps {
  acceptedCount: number;
  totalCount: number;
  onSaveAll: () => void;
  onSaveAccepted: () => void;
  isSaving: boolean;
}

export function BatchActionBar({
  acceptedCount,
  totalCount,
  onSaveAll,
  onSaveAccepted,
  isSaving,
}: BatchActionBarProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
      <div className="text-sm text-muted-foreground">
        <span className="font-medium">{acceptedCount}</span> of <span className="font-medium">{totalCount}</span>{" "}
        flashcards accepted
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onSaveAll} disabled={isSaving || totalCount === 0}>
          Save All
        </Button>
        <Button onClick={onSaveAccepted} disabled={isSaving || acceptedCount === 0}>
          Save {acceptedCount} Accepted
        </Button>
      </div>
    </div>
  );
}
