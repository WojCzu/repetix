import { createContext, useContext, useCallback, useState, useEffect, type ReactNode, type FormEvent } from "react";
import type { CreateGenerationCommand, CreateGenerationResponseDto, ViewModelCandidate } from "@/types";
import { toast } from "sonner";
import type { FlashcardFormData } from "../schemas/flashcard.schema";
import { textInputSchema } from "../schemas/generation.schema";
type Status = "idle" | "loading" | "success" | "error";

interface GenerateFormState {
  text: string;
  error: string | null;
  isValid: boolean;
  generationStatus: Status;
  generationError: string | null;
  candidates: ViewModelCandidate[];
  generationId: string | null;
  editingCandidate: ViewModelCandidate | null;
}

interface GenerateFormContextType extends GenerateFormState {
  setText: (text: string) => void;
  handleSubmit: (e: FormEvent) => void;
  clearForm: () => void;
  clearGeneration: () => void;
  acceptCandidate: (id: string) => void;
  rejectCandidate: (id: string) => void;
  editCandidate: (id: string, data: FlashcardFormData) => void;
  startEditing: (id: string) => void;
  cancelEditing: () => void;
}

const initialState: GenerateFormState = {
  text: "",
  error: null,
  isValid: false,
  generationStatus: "idle",
  generationError: null,
  candidates: [],
  generationId: null,
  editingCandidate: null,
};

const GenerateFormContext = createContext<GenerateFormContextType | null>(null);

interface GenerateFormProviderProps {
  children: ReactNode;
}

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

export function GenerateFormProvider({ children }: GenerateFormProviderProps) {
  const [state, setState] = useState<GenerateFormState>(initialState);

  useEffect(() => {
    if (!state.text) {
      setState((prev) => ({ ...prev, error: null, isValid: false }));
      return;
    }

    const result = textInputSchema.safeParse({ text: state.text });
    if (!result.success) {
      setState((prev) => ({
        ...prev,
        error: result.error.errors[0]?.message || null,
        isValid: false,
      }));
    } else {
      setState((prev) => ({
        ...prev,
        error: null,
        isValid: true,
      }));
    }
  }, [state.text]);

  const setText = useCallback((text: string) => {
    setState((prev) => ({ ...prev, text }));
  }, []);

  const clearForm = useCallback(() => {
    setState((prev) => ({ ...prev, text: "", error: null, isValid: false }));
  }, []);

  const clearGeneration = useCallback(() => {
    clearForm();
    setState((prev) => ({
      ...prev,
      generationStatus: "idle",
      generationError: null,
      candidates: [],
      generationId: null,
      editingCandidate: null,
    }));
  }, [clearForm]);

  const acceptCandidate = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      candidates: prev.candidates.map((candidate) =>
        candidate.id === id ? { ...candidate, isAccepted: true } : candidate
      ),
    }));
  }, []);

  const rejectCandidate = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      candidates: prev.candidates.map((candidate) =>
        candidate.id === id ? { ...candidate, isAccepted: false } : candidate
      ),
    }));
  }, []);

  const startEditing = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      editingCandidate: prev.candidates.find((c) => c.id === id) || null,
    }));
  }, []);

  const cancelEditing = useCallback(() => {
    setState((prev) => ({ ...prev, editingCandidate: null }));
  }, []);

  const editCandidate = useCallback((id: string, data: FlashcardFormData) => {
    setState((prev) => ({
      ...prev,
      candidates: prev.candidates.map((candidate) =>
        candidate.id === id ? updateFlashcardContent(candidate, data) : candidate
      ),
      editingCandidate: null,
    }));
  }, []);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (state.generationStatus === "loading") return;

      const result = textInputSchema.safeParse({ text: state.text });
      if (!result.success) {
        setState((prev) => ({
          ...prev,
          error: result.error.errors[0]?.message || null,
          isValid: false,
        }));
        return;
      }

      setState((prev) => ({ ...prev, generationStatus: "loading", generationError: null }));

      try {
        const response = await fetch("/api/generations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: state.text } as CreateGenerationCommand),
        });

        if (!response.ok) {
          throw new Error(`Generation failed: ${response.statusText}`);
        }

        const responseData = (await response.json()) as CreateGenerationResponseDto;

        // Transform candidates to ViewModelCandidates
        const viewModelCandidates: ViewModelCandidate[] = responseData.candidates.map((candidate) => ({
          id: crypto.randomUUID(),
          front_text: candidate.front_text,
          back_text: candidate.back_text,
          isAccepted: false,
          isEdited: false,
        }));

        setState((prev) => ({
          ...prev,
          generationStatus: "success",
          generationId: responseData.id,
          candidates: viewModelCandidates,
        }));

        toast.success("Flashcards generated", {
          description: `Generated ${viewModelCandidates.length} flashcard ${
            viewModelCandidates.length === 1 ? "candidate" : "candidates"
          }.`,
        });
      } catch (error) {
        setState((prev) => ({
          ...prev,
          generationStatus: "error",
          generationError: error instanceof Error ? error.message : "An unexpected error occurred",
        }));
      }
    },
    [state.text, state.generationStatus]
  );

  const value = {
    ...state,
    setText,
    handleSubmit,
    clearForm,
    clearGeneration,
    acceptCandidate,
    rejectCandidate,
    editCandidate,
    startEditing,
    cancelEditing,
  };

  return <GenerateFormContext.Provider value={value}>{children}</GenerateFormContext.Provider>;
}

export function useGenerateFormContext() {
  const context = useContext(GenerateFormContext);
  if (!context) {
    throw new Error("useGenerateFormContext must be used within a GenerateFormProvider");
  }
  return context;
}
