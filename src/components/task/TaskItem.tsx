"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Task } from "@/types";
import { toggleTaskDone } from "@/hooks/useTasks";
import { useTaskStore } from "@/store/taskStore";
import { Badge } from "@/components/ui/Badge";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const WORK_TYPE_LABELS: Record<string, string> = {
  focus:   "🎯 集中",
  shallow: "✏️ 軽作業",
  meeting: "🗣️ MTG",
  admin:   "📋 管理",
  review:  "🔍 レビュー",
};

const PRIORITY_CLASS: Record<number, string> = {
  3: "task-priority-3",
  2: "task-priority-2",
  1: "task-priority-1",
  0: "task-priority-0",
};

const PRIORITY_CHECK_COLOR: Record<number, string> = {
  3: "border-red-400 group-hover:border-red-500",
  2: "border-orange-400 group-hover:border-orange-500",
  1: "border-blue-400 group-hover:border-blue-500",
  0: "border-[var(--border)] group-hover:border-[var(--muted)]",
};

const PRIORITY_CHECK_BG: Record<number, string> = {
  3: "bg-red-500",
  2: "bg-orange-500",
  1: "bg-blue-500",
  0: "bg-[var(--primary)]",
};

interface TaskItemProps { task: Task; }

export function TaskItem({ task }: TaskItemProps) {
  const { selectedTaskId, setSelectedTask } = useTaskStore();
  const isSelected = selectedTaskId === task.id;
  const isDone = task.status === "done";
  const [popAnim, setPopAnim] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id });

  const project = useLiveQuery<import("@/types").Project | undefined>(
    () => task.projectId ? db.projects.get(task.projectId) : Promise.resolve(undefined),
    [task.projectId]
  );

  const doneSubtasks = task.subtasks.filter(s => s.completed).length;
  const totalSubtasks = task.subtasks.length;

  const handleCheck = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isDone) setPopAnim(true);
    toggleTaskDone(task);
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: isDragging ? 0.4 : 1, y: 0 }}
      exit={{ opacity: 0, y: -4, transition: { duration: 0.18 } }}
      className={cn(
        "group relative flex items-start gap-3 px-4 py-3 cursor-pointer transition-all duration-150 rounded-lg mx-2",
        PRIORITY_CLASS[task.priority],
        isSelected
          ? "bg-[var(--sidebar-active-bg)] border-l-[var(--sidebar-active-border)]"
          : "hover:bg-[var(--sidebar-hover)] hover:translate-x-0.5",
        isDragging && "shadow-xl z-50",
        !isSelected && task.priority === 0 && "hover:bg-[var(--sidebar-hover)]"
      )}
      onClick={() => setSelectedTask(task)}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        onClick={e => e.stopPropagation()}
        className="absolute left-0.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-40 hover:!opacity-80 text-[var(--muted)] cursor-grab active:cursor-grabbing transition-opacity"
      >
        <GripVertical className="w-3 h-3" />
      </button>

      {/* Checkbox */}
      <button
        onClick={handleCheck}
        className={cn(
          "mt-0.5 w-[18px] h-[18px] rounded-full border-2 flex-shrink-0 transition-all duration-200 flex items-center justify-center",
          isDone
            ? cn(PRIORITY_CHECK_BG[task.priority], "border-transparent")
            : PRIORITY_CHECK_COLOR[task.priority],
          popAnim && "checkbox-pop"
        )}
        onAnimationEnd={() => setPopAnim(false)}
      >
        {isDone && (
          <svg className="w-[9px] h-[9px] text-white" fill="none" viewBox="0 0 12 12">
            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          "text-sm leading-snug font-medium transition-all duration-200",
          isDone ? "task-strikethrough text-[var(--muted)] font-normal" : "text-[var(--foreground)]"
        )}>
          {task.title}
        </p>
        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
          {project && (
            <span
              className="text-[11px] px-1.5 py-0.5 rounded-md font-medium"
              style={{ background: (project.color ?? "#888") + "22", color: project.color ?? "#888" }}
            >
              {project.icon} {project.name}
            </span>
          )}
          {task.workType && (
            <span className="text-[11px] text-[var(--muted)] bg-[var(--border-2)] px-1.5 py-0.5 rounded-md">
              {WORK_TYPE_LABELS[task.workType] ?? task.workType}
            </span>
          )}
          {task.dueDate && (
            <span className="text-[11px] text-[var(--muted)]">
              📅 {format(new Date(task.dueDate), "M/d", { locale: ja })}
            </span>
          )}
          {task.scheduledDate && (
            <span className="text-[11px] text-[var(--muted)]">
              ⏰ {format(new Date(task.scheduledDate), "M/d", { locale: ja })}
            </span>
          )}
          {task.estimatedMinutes && (
            <span className="text-[11px] text-[var(--muted)]">
              ⏱ {task.estimatedMinutes < 60 ? `${task.estimatedMinutes}m` : `${Math.floor(task.estimatedMinutes / 60)}h`}
            </span>
          )}
          {totalSubtasks > 0 && (
            <span className="text-[11px] text-[var(--muted)]">
              ☑ {doneSubtasks}/{totalSubtasks}
            </span>
          )}
          {task.tags.slice(0, 2).map(tag => (
            <Badge key={tag} variant="secondary" className="text-[10px] py-0 px-1.5 h-4">
              #{tag}
            </Badge>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
