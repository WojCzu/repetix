import type { ReactNode } from "react";
import type { PaginationDto } from "@/types";
import { Button } from "@/components/ui/button";
import { CardListSkeleton } from "@/components/ui/card-skeleton";

interface PaginatedGridProps<T> {
  items: T[];
  pagination: PaginationDto | null;
  onPageChange: (page: number) => void;
  renderItem: (item: T) => ReactNode;
  isLoading: boolean;
}

export function PaginatedGrid<T>({ items, pagination, onPageChange, renderItem, isLoading }: PaginatedGridProps<T>) {
  if (isLoading) {
    return <CardListSkeleton />;
  }

  if (!pagination) {
    return null;
  }

  const totalPages = Math.ceil(pagination.total / pagination.pageSize);
  const currentPage = pagination.page;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="flashcards-list">
        {items.map((item) => renderItem(item))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <Button variant="outline" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
            Previous
          </Button>

          {Array.from({ length: totalPages }).map((_, index) => {
            const pageNumber = index + 1;
            return (
              <Button
                key={pageNumber}
                variant={pageNumber === currentPage ? "default" : "outline"}
                onClick={() => onPageChange(pageNumber)}
                className="w-10 h-10 p-0"
              >
                {pageNumber}
              </Button>
            );
          })}

          <Button variant="outline" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
