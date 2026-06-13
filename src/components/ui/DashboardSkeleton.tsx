import { cn } from "@/lib/utils";

function Shimmer({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse rounded-lg bg-muted", className)} />
  );
}

function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
      <Shimmer className="h-4 w-24" />
      <Shimmer className="h-8 w-16" />
      <Shimmer className="h-3 w-32" />
    </div>
  );
}

function TableRowSkeleton() {
  return (
    <div className="flex items-center gap-4 px-4 py-3 border-b border-border/50">
      <Shimmer className="h-4 w-32" />
      <Shimmer className="h-4 w-24 ml-auto" />
      <Shimmer className="h-4 w-20" />
      <Shimmer className="h-6 w-16 rounded-full" />
    </div>
  );
}

function CardSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="p-5 border-b border-border">
        <Shimmer className="h-5 w-48" />
      </div>
      <div>
        {Array.from({ length: rows }).map((_, i) => (
          <TableRowSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function DashboardSkeleton({ variant = "default" }: { variant?: "default" | "admin" | "table" | "form" }) {
  if (variant === "admin") {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* En-tête */}
        <div className="space-y-2">
          <Shimmer className="h-8 w-64" />
          <Shimmer className="h-4 w-48" />
        </div>
        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
        {/* Tableau */}
        <CardSkeleton rows={6} />
      </div>
    );
  }

  if (variant === "table") {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="space-y-2">
          <Shimmer className="h-8 w-56" />
          <Shimmer className="h-4 w-40" />
        </div>
        <CardSkeleton rows={8} />
      </div>
    );
  }

  if (variant === "form") {
    return (
      <div className="space-y-6 max-w-2xl animate-in fade-in duration-300">
        <div className="space-y-2">
          <Shimmer className="h-8 w-56" />
          <Shimmer className="h-4 w-72" />
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Shimmer className="h-4 w-28" />
              <Shimmer className="h-10 w-full" />
            </div>
          ))}
          <Shimmer className="h-12 w-full rounded-full mt-4" />
        </div>
      </div>
    );
  }

  // default
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="space-y-2">
        <Shimmer className="h-8 w-56" />
        <Shimmer className="h-4 w-40" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => <StatCardSkeleton key={i} />)}
      </div>
      <CardSkeleton rows={5} />
    </div>
  );
}
