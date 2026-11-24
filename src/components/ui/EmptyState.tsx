import Link from "next/link";
import type { ReactNode } from "react";
import { buttonStyles } from "./Button";

type EmptyStateProps = {
  icon: ReactNode;
  title: string;
  description: string;
  action?: { href: string; label: string };
};

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 pb-24 text-center">
      <div className="text-brand/70">{icon}</div>
      <h2 className="mt-4 text-xl font-bold tracking-title text-ink">{title}</h2>
      <p className="mt-2 text-[13px] text-sub">{description}</p>
      {action ? (
        <Link href={action.href} className={buttonStyles({ size: "lg" }) + " mt-6"}>
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}
