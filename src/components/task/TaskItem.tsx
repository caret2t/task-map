"use client";

import { motion } from "framer-motion";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { Task } from "@/types";
import { PriorityBorder } from "./PriorityBadge";
import { toggleTaskDone } from "@/hooks/useTasks";
import { useTaskStore } from "@/store/taskStore";
import { Badge } from "@/components/ui/Badge";

interface TaskItemProps {
  task: Task;
}

export function TaskItem({ task }: TaskItemProps) {
  const { selectedTaskId, setSelectedTask } = useTaskStore();
  const isSelected = selectedTaskId === task.id;
  const isDone = task.status === "done";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      className={cn(
        "relative flex items-start gap-3 px-4 py-2.5 cursor-pointer rounded-lg group transition-colors",
        isSelected
          ? "bg-[var(--sidebar-active)]"
          : "hover:bg-[var(--sidebar-hover)]"
      )}
      onClick={() => setSelectedTask(task)}
    >
      <PriorityBorder priority={task.priority} />

      {/* Checkbox */}
      <button
        className={cn(
          "mt-0.5 w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all flex items-center justify-center",
          isDone
            ? "bg-blue-500 border-blue-500"
            : "border-[var(--muted)] hover:border-blue-500"
        )}
        onClick={(e) => {
          e.stopPropagation();
          toggleTaskDone(task);
        }}
      >
        {isDone && (
          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 12 12">
            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm truncate", isDone && "line-through text-[var(--muted)]")}>
          {task.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          {task.dueDate && (
            <span className="text-xs text-[var(--muted)]">
              📅 {format(new Date(task.dueDate), "M/d", { locale: ja })}
            </span>
          )}
          {task.scheduledDate && (
            <span className="text-xs text-[var(--muted)]">
              ⏰ {format(new Date(task.scheduledDate), "M/d", { locale: ja })}
            </span>
          )}
          {task.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs py-0">
              #{tag}
            </Badge>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
