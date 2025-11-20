import type { PropsWithChildren } from "react";

interface CardProps extends PropsWithChildren {
  title?: string;
  className?: string;
}

export function Card({ title, className = "", children }: CardProps) {
  return (
    <section
      className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ${className}`.trim()}
    >
      {title && (
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      )}
      <div className={title ? "mt-4" : ""}>{children}</div>
    </section>
  );
}
