import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SourceBadge } from "@/components/ui/source-badge";
import type { FlashcardDto, FlashcardSource } from "@/types";
import { PencilIcon, TrashIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider, TooltipPortal } from "@/components/ui/tooltip";

interface FlashcardCardProps {
  flashcard: FlashcardDto;
  onEdit: () => void;
  onDelete: () => void;
}

export function FlashcardCard({ flashcard, onEdit, onDelete }: FlashcardCardProps) {
  const { front_text, back_text, source, isOptimistic } = flashcard;

  return (
    <Card data-testid="flashcard-item">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <SourceBadge source={source as FlashcardSource} />
        <TooltipProvider delayDuration={200}>
          <div className="flex items-center gap-0.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  className="h-8 w-8"
                  variant="ghost"
                  onClick={onEdit}
                  aria-label="Edit flashcard"
                  data-testid="edit-button"
                  disabled={isOptimistic}
                >
                  <PencilIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipPortal>
                <TooltipContent side="bottom" align="end">
                  Edit flashcard
                </TooltipContent>
              </TooltipPortal>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  className="h-8 w-8"
                  variant="ghost"
                  onClick={onDelete}
                  aria-label="Delete flashcard"
                  data-testid="delete-button"
                  disabled={isOptimistic}
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipPortal>
                <TooltipContent side="bottom" align="end">
                  Delete flashcard
                </TooltipContent>
              </TooltipPortal>
            </Tooltip>
          </div>
        </TooltipProvider>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-base font-medium" aria-label="Front side of the flashcard">
          {front_text}
        </p>

        <div className="relative">
          <div className="absolute inset-x-0 -top-3 h-px bg-border" />
          <p className="text-base pt-3" aria-label="Back side of the flashcard">
            {back_text}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
