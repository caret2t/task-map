"use client";

import { useTaskStore } from "@/store/taskStore";
import { useTask } from "@/hooks/useTasks";
import { TaskDetail } from "./TaskDetail";
import { cn } from "@/lib/utils";

export function TaskDetailPane() {
  const { selectedTaskId } = useTaskStore();
  const task = useTask(selectedTaskId) as import("@/types").Task | undefined;

  return (
    <div
      className={cn(
        "w-96 border-l border-[var(--border)] flex-shrink-0 h-full overflow-hidden transition-all duration-200",
        "hidden lg:flex flex-col",
        !selectedTaskId && "hidden"
      )}
    >
      {task ? (
        <TaskDetail task={task} />
      ) : (
        <div className="flex items-center justify-center h-full text-[var(--muted)] text-sm">
          タスクを選択してください
        </div>
      )}
    </div>
  );
}
