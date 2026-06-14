import { RIDE_STATUS_LABELS, type RideStatus } from "@/types";
import { STATUS_COLORS, cn } from "@/lib/utils";

export function StatusBadge({ status, className }: { status: RideStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
        STATUS_COLORS[status],
        className
      )}
    >
      <span className="relative flex h-1.5 w-1.5">
        {!["completed", "cancelled"].includes(status) && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-60" />
        )}
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
      </span>
      {RIDE_STATUS_LABELS[status]}
    </span>
  );
}
