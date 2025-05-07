import { cn } from "@/lib/utils";

interface PasswordStrengthMeterProps {
  password: string;
  className?: string;
}

export function PasswordStrengthMeter({ password, className }: PasswordStrengthMeterProps) {
  const calculateStrength = (password: string): number => {
    if (!password) return 0;

    let strength = 0;

    // Length check
    if (password.length >= 8) strength += 1;

    // Character variety checks
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;

    return Math.min(strength, 5);
  };

  const strength = calculateStrength(password);
  const strengthText = ["Very Weak", "Weak", "Fair", "Good", "Strong"][strength - 1] || "No Password";
  const strengthColor = {
    0: "bg-muted",
    1: "bg-destructive",
    2: "bg-orange-500",
    3: "bg-yellow-500",
    4: "bg-green-500",
    5: "bg-green-600",
  }[strength];

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex h-2 w-full gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={cn("h-full w-full rounded-full transition-colors", i < strength ? strengthColor : "bg-muted")}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">{strengthText}</p>
    </div>
  );
}
