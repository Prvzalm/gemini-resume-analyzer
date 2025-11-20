import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost";
}

export function Button({
  children,
  className = "",
  variant = "primary",
  ...props
}: PropsWithChildren<ButtonProps>) {
  const base =
    "rounded-md px-4 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:ring";
  const variants: Record<typeof variant, string> = {
    primary:
      "bg-purple-600 text-white hover:bg-purple-500 focus-visible:ring-purple-300",
    ghost:
      "bg-transparent text-purple-700 hover:bg-purple-50 focus-visible:ring-purple-200",
  } as const;

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
