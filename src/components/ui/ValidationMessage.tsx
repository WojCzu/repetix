interface ValidationMessageProps {
  message: string | null;
  id?: string;
}

export function ValidationMessage({ message, id }: ValidationMessageProps) {
  if (!message) return null;

  return (
    <p id={id} className="text-sm text-destructive mt-1" role="alert" aria-live="polite">
      {message}
    </p>
  );
}
