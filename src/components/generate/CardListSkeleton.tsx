import { Skeleton } from "../ui/skeleton";
import { Card, CardContent, CardHeader } from "../ui/card";

function BatchActionBarSkeleton() {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4 rounded-full" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-9 w-[140px]" />
        <Skeleton className="h-9 w-[180px]" />
      </div>
    </div>
  );
}

function CandidateCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-5 w-16" /> {/* Source badge */}
        <div className="flex items-center gap-0.5">
          <Skeleton className="h-8 w-8 rounded-md" /> {/* Accept button */}
          <Skeleton className="h-8 w-8 rounded-md" /> {/* Edit button */}
          <Skeleton className="h-8 w-8 rounded-md" /> {/* Reject button */}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Skeleton className="h-5 w-full" /> {/* Front text */}
        <div className="relative">
          <div className="absolute inset-x-0 -top-3 h-px bg-border" />
          <Skeleton className="h-10 w-full pt-3" /> {/* Back text */}
        </div>
      </CardContent>
    </Card>
  );
}

export function CardListSkeleton() {
  return (
    <div className="space-y-6">
      <BatchActionBarSkeleton />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <CandidateCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}
