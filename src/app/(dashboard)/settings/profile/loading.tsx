import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileSettingsLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-56" />
      </div>

      <div className="max-w-lg rounded-2xl border border-border p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="size-16 rounded-full" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="mt-5 flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-11" />
          ))}
          <Skeleton className="h-11 w-28" />
        </div>
      </div>
    </div>
  );
}
