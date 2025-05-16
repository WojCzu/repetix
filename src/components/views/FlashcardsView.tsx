import { useState, useEffect } from "react";
import type { FlashcardDto, ListFlashcardsResponseDto, PaginationDto, FlashcardSource } from "@/types";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { PaginatedGrid } from "../flashcards/PaginatedGrid";
import { FlashcardCard } from "../flashcards/FlashcardCard";
import { ConfirmationModal } from "../ui/confirmation-modal";
import { FlashcardFormModal } from "../flashcards/FlashcardFormModal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

const PAGE_SIZE = 15;

export function FlashcardsView() {
  // State
  const [flashcards, setFlashcards] = useState<FlashcardDto[]>([]);
  const [pagination, setPagination] = useState<PaginationDto | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sourceFilter, setSourceFilter] = useState<FlashcardSource | "all">("all");

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingFlashcard, setEditingFlashcard] = useState<FlashcardDto | undefined>();
  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
  const [deletingFlashcardId, setDeletingFlashcardId] = useState<string | undefined>();

  // Fetch flashcards
  useEffect(() => {
    const fetchFlashcards = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const searchParams = new URLSearchParams({
          page: currentPage.toString(),
          pageSize: PAGE_SIZE.toString(),
        });

        if (sourceFilter !== "all") {
          searchParams.append("source", sourceFilter);
        }

        const response = await fetch(`/api/flashcards?${searchParams}`);
        if (!response.ok) {
          throw new Error("Failed to fetch flashcards");
        }
        const data: ListFlashcardsResponseDto = await response.json();
        setFlashcards(data.data);
        setPagination(data.pagination);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unexpected error occurred");
        toast.error("Error", {
          description: "Failed to load flashcards. Please try again later.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchFlashcards();
  }, [currentPage, sourceFilter]);

  // Handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSourceFilterChange = (value: string) => {
    setSourceFilter(value as FlashcardSource | "all");
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleAddClick = () => {
    setIsAddModalOpen(true);
  };

  const handleEditClick = (flashcard: FlashcardDto) => {
    setEditingFlashcard(flashcard);
    setIsEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setEditingFlashcard(undefined);
  };

  const handleDeleteClick = (flashcardId: string) => {
    setDeletingFlashcardId(flashcardId);
    setIsConfirmDeleteModalOpen(true);
  };

  const handleAddSuccess = async (newFlashcard: FlashcardDto) => {
    // Add optimistic flashcard
    const optimisticFlashcard: FlashcardDto = {
      ...newFlashcard,
      isOptimistic: true,
    };

    setFlashcards((prev) => [optimisticFlashcard, ...prev]);
    setPagination((prev) => (prev ? { ...prev, total: prev.total + 1 } : null));
    setIsAddModalOpen(false);

    try {
      const response = await fetch("/api/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cards: [
            {
              front_text: newFlashcard.front_text,
              back_text: newFlashcard.back_text,
              source: "manual",
              generation_id: null,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create flashcard");
      }

      const result = await response.json();

      // Handle both single flashcard and array responses
      const createdFlashcard = result.cards[0];

      if (!createdFlashcard) {
        throw new Error("No flashcard data in response");
      }

      // Update optimistic flashcard with real data
      setFlashcards((prev) =>
        prev.map((f) => (f.id === optimisticFlashcard.id ? { ...createdFlashcard, isOptimistic: false } : f))
      );

      toast.success("Success", {
        description: "Flashcard created successfully",
      });
    } catch (error) {
      // Revert optimistic update on error
      setFlashcards((prev) => prev.filter((f) => f.id !== optimisticFlashcard.id));
      setPagination((prev) => (prev ? { ...prev, total: prev.total - 1 } : null));

      toast.error("Error", {
        description: "Failed to create flashcard. Please try again later.",
      });
    }
  };

  /**
   * Checks if the flashcard content has been modified from its initial state
   */
  const isFlashcardModified = (
    original: FlashcardDto,
    updated: Pick<FlashcardDto, "front_text" | "back_text">
  ): boolean => {
    return original.front_text !== updated.front_text || original.back_text !== updated.back_text;
  };

  const handleEditSuccess = async (updatedFlashcard: FlashcardDto) => {
    // Ensure we have the original flashcard
    if (!editingFlashcard) {
      handleEditModalClose();
      return;
    }

    // Check if the flashcard was actually modified
    if (!isFlashcardModified(editingFlashcard, updatedFlashcard)) {
      handleEditModalClose();
      return;
    }

    // Add optimistic update
    const optimisticFlashcard: FlashcardDto = {
      ...updatedFlashcard,
      isOptimistic: true,
    };

    setFlashcards((prev) => prev.map((f) => (f.id === updatedFlashcard.id ? optimisticFlashcard : f)));
    handleEditModalClose();

    try {
      const response = await fetch(`/api/flashcards/${updatedFlashcard.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          front_text: updatedFlashcard.front_text,
          back_text: updatedFlashcard.back_text,
          source: updatedFlashcard.source,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update flashcard");
      }

      const result = await response.json();

      // Update optimistic flashcard with real data
      setFlashcards((prev) =>
        prev.map((f) => (f.id === optimisticFlashcard.id ? { ...result, isOptimistic: false } : f))
      );

      toast.success("Success", {
        description: "Flashcard updated successfully",
      });
    } catch (error) {
      // Store original flashcard for revert
      const originalFlashcard = editingFlashcard;

      // Revert optimistic update on error
      setFlashcards((prev) =>
        prev.map((f) => (f.id === optimisticFlashcard.id ? { ...originalFlashcard, isOptimistic: false } : f))
      );

      toast.error("Error", {
        description: "Failed to update flashcard. Please try again later.",
      });
    }
  };

  const handleDelete = async (flashcardId: string) => {
    // Optimistic update
    const previousFlashcards = flashcards;
    const previousPagination = pagination;

    // Mark flashcard as being deleted
    setFlashcards((prev) => prev.map((f) => (f.id === flashcardId ? { ...f, isOptimistic: true } : f)));

    try {
      const response = await fetch(`/api/flashcards/${flashcardId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete flashcard");
      }

      // Remove flashcard after successful deletion
      setFlashcards((prev) => prev.filter((f) => f.id !== flashcardId));
      setPagination((prev) => (prev ? { ...prev, total: prev.total - 1 } : null));

      toast.success("Success", {
        description: "Flashcard deleted successfully",
      });
    } catch (err) {
      // Revert optimistic update
      setFlashcards(previousFlashcards);
      setPagination(previousPagination);

      toast.error("Error", {
        description: "Failed to delete flashcard. Please try again later.",
      });
    } finally {
      setIsConfirmDeleteModalOpen(false);
      setDeletingFlashcardId(undefined);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button onClick={handleAddClick} data-testid="add-flashcard-button">
            Add New Flashcard
          </Button>
          <Select value={sourceFilter} onValueChange={handleSourceFilterChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="manual">Manual</SelectItem>
              <SelectItem value="ai-full">AI Generated</SelectItem>
              <SelectItem value="ai-edited">AI Edited</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && (
        <div role="alert" className="p-4 text-destructive bg-destructive/10 rounded-md">
          {error}
        </div>
      )}

      <PaginatedGrid
        items={flashcards}
        pagination={pagination}
        onPageChange={handlePageChange}
        isLoading={isLoading}
        renderItem={(flashcard: FlashcardDto) => (
          <FlashcardCard
            key={flashcard.id}
            flashcard={flashcard}
            onEdit={() => handleEditClick(flashcard)}
            onDelete={() => handleDeleteClick(flashcard.id)}
          />
        )}
      />

      <FlashcardFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        mode="add"
        onSuccess={handleAddSuccess}
      />

      <FlashcardFormModal
        isOpen={isEditModalOpen}
        onClose={handleEditModalClose}
        mode="edit"
        initialData={editingFlashcard}
        onSuccess={handleEditSuccess}
      />

      <ConfirmationModal
        isOpen={isConfirmDeleteModalOpen}
        onClose={() => {
          setIsConfirmDeleteModalOpen(false);
          setDeletingFlashcardId(undefined);
        }}
        onConfirm={() => {
          if (deletingFlashcardId) {
            return handleDelete(deletingFlashcardId);
          }
        }}
        title="Delete Flashcard"
        message="Are you sure you want to delete this flashcard? This action cannot be undone."
      />
    </div>
  );
}
