import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2 py-10 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
        <Icon className="size-6" />
      </div>
      <p className="text-sm font-medium">{title}</p>
      {description && (
        <p className="max-w-xs text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
