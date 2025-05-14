import { Skeleton } from "./skeleton";
import { Card, CardContent, CardHeader } from "./card";

interface CardSkeletonProps {
  /** Additional action buttons to show in the header (default: 2) */
  actionButtonCount?: number;
  /** Whether to show the source badge */
  showSourceBadge?: boolean;
  /** Whether to show the divider between front and back text */
  showDivider?: boolean;
}

function CardSkeleton({ actionButtonCount = 2, showSourceBadge = true, showDivider = true }: CardSkeletonProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        {showSourceBadge && <Skeleton className="h-5 w-16" />}
        <div className="flex items-center gap-0.5">
          {Array.from({ length: actionButtonCount }).map((_, index) => (
            <Skeleton key={index} className="h-8 w-8 rounded-md" />
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Skeleton className="h-5 w-full" />
        <div className="relative">
          {showDivider && <div className="absolute inset-x-0 -top-3 h-px bg-border" />}
          <Skeleton className="h-10 w-full pt-3" />
        </div>
      </CardContent>
    </Card>
  );
}

interface CardListSkeletonProps extends CardSkeletonProps {
  /** Number of cards to show (default: 6) */
  count?: number;
  /** Whether to show the batch action bar */
  showBatchActionBar?: boolean;
}

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

export function CardListSkeleton({ count = 6, showBatchActionBar = false, ...cardProps }: CardListSkeletonProps) {
  return (
    <div className="space-y-6">
      {showBatchActionBar && <BatchActionBarSkeleton />}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: count }).map((_, index) => (
          <CardSkeleton key={index} {...cardProps} />
        ))}
      </div>
    </div>
  );
}
