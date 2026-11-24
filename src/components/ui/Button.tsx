import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "muted";
  size?: "md" | "lg";
};

export const buttonStyles = ({
  variant = "primary",
  size = "md",
}: Pick<ButtonProps, "variant" | "size"> = {}) =>
  cn(
    "inline-flex w-full items-center justify-center rounded-xl font-bold transition-colors",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
    "disabled:cursor-not-allowed",
    size === "lg" ? "h-12 text-[15px]" : "h-11 text-sm",
    variant === "primary" && "bg-brand text-white hover:bg-brand/90 disabled:bg-field disabled:text-sub",
    variant === "secondary" && "border border-[#C9CDD8] bg-surface font-medium text-ink-list hover:bg-canvas",
    variant === "muted" && "bg-field text-ink hover:bg-field/80",
  );

export function Button({ variant, size, className, type = "button", ...props }: ButtonProps) {
  return (
    <button type={type} className={cn(buttonStyles({ variant, size }), className)} {...props} />
  );
}
