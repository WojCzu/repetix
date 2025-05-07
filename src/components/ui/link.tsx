import { cn } from "@/lib/utils";
import { buttonVariants } from "./button";
import type { ComponentProps } from "react";

interface LinkProps extends ComponentProps<"a"> {
  href: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

export function Link({ className, variant = "link", children, ...props }: LinkProps) {
  return (
    <a className={cn(buttonVariants({ variant, className }))} {...props}>
      {children}
    </a>
  );
}
