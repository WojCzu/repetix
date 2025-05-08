interface ValidationMessageProps {
  message: string | null;
  id?: string;
  role?: string;
}

export function ValidationMessage({ message, id, role = "alert" }: ValidationMessageProps) {
  if (!message) return null;

  return (
    <p id={id} className="text-sm text-destructive mt-1" role={role} aria-live="polite">
      {message}
    </p>
  );
}
