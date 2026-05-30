import { cn } from "@/lib/utils";

const PRIORITY_COLORS = {
  3: "bg-red-500",
  2: "bg-orange-400",
  1: "bg-blue-400",
  0: "bg-gray-300",
};

const PRIORITY_LABELS = {
  3: "緊急",
  2: "高",
  1: "中",
  0: "なし",
};

interface PriorityBadgeProps {
  priority: 0 | 1 | 2 | 3;
  showLabel?: boolean;
  className?: string;
}

export function PriorityBadge({ priority, showLabel = false, className }: PriorityBadgeProps) {
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <span className={cn("inline-block w-2 h-2 rounded-full", PRIORITY_COLORS[priority])} />
      {showLabel && (
        <span className="text-xs text-[var(--muted)]">{PRIORITY_LABELS[priority]}</span>
      )}
    </span>
  );
}

export function PriorityBorder({ priority }: { priority: 0 | 1 | 2 | 3 }) {
  const color = {
    3: "border-l-red-500",
    2: "border-l-orange-400",
    1: "border-l-blue-400",
    0: "border-l-transparent",
  }[priority];
  return <div className={cn("absolute left-0 top-0 bottom-0 w-0.5 rounded-l", color)} />;
}
