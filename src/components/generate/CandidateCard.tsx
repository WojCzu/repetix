import { Button } from "../ui/button";
import { Card, CardContent, CardHeader } from "../ui/card";
import { SourceBadge } from "../ui/source-badge";
import type { ViewModelCandidate } from "../../types";
import { cn } from "@/lib/utils";
import { CheckIcon, PencilIcon, XIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider, TooltipPortal } from "../ui/tooltip";

interface CandidateCardProps {
  candidate: ViewModelCandidate;
  onAcceptToggle: (id: string) => void;
  onEdit: (id: string) => void;
  onReject: (id: string) => void;
}

export function CandidateCard({ candidate, onAcceptToggle, onEdit, onReject }: CandidateCardProps) {
  const { id, front_text, back_text, isAccepted, isEdited } = candidate;

  return (
    <Card className={cn(isAccepted && "border-primary")}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <SourceBadge source={isEdited ? "ai-edited" : "ai-full"} />
        <TooltipProvider delayDuration={200}>
          <div className="flex items-center gap-0.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  className="h-8 w-8"
                  variant={isAccepted ? "default" : "ghost"}
                  onClick={() => onAcceptToggle(id)}
                  aria-pressed={isAccepted}
                  aria-label={isAccepted ? "Flashcard accepted" : "Accept flashcard"}
                >
                  <CheckIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipPortal>
                <TooltipContent side="bottom" align="end">
                  {isAccepted ? "Flashcard accepted" : "Accept flashcard"}
                </TooltipContent>
              </TooltipPortal>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  className="h-8 w-8"
                  variant="ghost"
                  onClick={() => onEdit(id)}
                  aria-label="Edit flashcard"
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
                  onClick={() => onReject(id)}
                  aria-label={isAccepted ? "Reject flashcard" : "Flashcard rejected"}
                >
                  <XIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipPortal>
                <TooltipContent side="bottom" align="end">
                  {isAccepted ? "Reject flashcard" : "Flashcard rejected"}
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
