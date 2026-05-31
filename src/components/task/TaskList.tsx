"use client";

import { useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import { format, isToday, isTomorrow, isThisWeek } from "date-fns";
import { ja } from "date-fns/locale";
import type { Task } from "@/types";
import { TaskItem } from "./TaskItem";
import { InlineAddTask } from "./InlineAddTask";

interface TaskListProps {
  tasks: Task[];
  title: string;
  showDateGroups?: boolean;
  defaultStatus?: Task["status"];
  defaultProjectId?: string | null;
}

function getDateGroupLabel(date: Date): string {
  if (isToday(date)) return "今日";
  if (isTomorrow(date)) return "明日";
  if (isThisWeek(date)) return format(date, "EEEE", { locale: ja });
  return format(date, "M月d日（E）", { locale: ja });
}

function groupTasksByDate(tasks: Task[]): { label: string; tasks: Task[] }[] {
  const grouped = new Map<string, Task[]>();
  const noDate: Task[] = [];

  for (const task of tasks) {
    const d = task.scheduledDate ?? task.dueDate;
    if (!d) { noDate.push(task); continue; }
    const label = getDateGroupLabel(new Date(d));
    if (!grouped.has(label)) grouped.set(label, []);
    grouped.get(label)!.push(task);
  }

  const result: { label: string; tasks: Task[] }[] = [];
  grouped.forEach((tasks, label) => result.push({ label, tasks }));
  if (noDate.length > 0) result.push({ label: "日付なし", tasks: noDate });
  return result;
}

export function TaskList({
  tasks,
  title,
  showDateGroups = false,
  defaultStatus = "inbox",
  defaultProjectId = null,
}: TaskListProps) {
  const totalMinutes = useMemo(
    () => tasks.reduce((sum, t) => sum + (t.estimatedMinutes ?? 0), 0),
    [tasks]
  );
  const doneCount = useMemo(() => tasks.filter(t => t.status === "done").length, [tasks]);
  const progressPct = tasks.length > 0 ? Math.round((doneCount / tasks.length) * 100) : 0;

  const groups = useMemo(
    () => showDateGroups ? groupTasksByDate(tasks) : null,
    [tasks, showDateGroups]
  );

  const formatMinutes = (min: number) => {
    if (min < 60) return `${min}分`;
    const h = Math.floor(min / 60);
    const m = min % 60;
    return m > 0 ? `${h}h${m}m` : `${h}h`;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[var(--border)] flex-shrink-0">
        <div className="flex items-center justify-between">
          <h1 className="text-base font-semibold">{title}</h1>
          <span className="text-xs text-[var(--muted)]">{tasks.length}件</span>
        </div>
        {tasks.length > 0 && (
          <div className="mt-2 space-y-1">
            <div className="flex items-center justify-between text-xs text-[var(--muted)]">
              <span>完了 {doneCount}/{tasks.length}件・{progressPct}%</span>
              {totalMinutes > 0 && <span>⏱ {formatMinutes(totalMinutes)}</span>}
            </div>
            <div className="h-1 bg-[var(--surface-2)] rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--primary)] rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Inline add task — always visible at top */}
      <InlineAddTask defaultStatus={defaultStatus} defaultProjectId={defaultProjectId} />

      {/* Task list */}
      <div className="flex-1 overflow-y-auto py-2">
        {groups ? (
          groups.map(({ label, tasks: groupTasks }) => (
            <div key={label}>
              <div className="px-4 py-1.5 flex items-center gap-2">
                <span className="text-xs font-medium text-[var(--muted)]">{label}</span>
                <span className="text-xs text-[var(--muted)]">({groupTasks.length})</span>
                <div className="flex-1 h-px bg-[var(--border)]" />
              </div>
              <AnimatePresence initial={false}>
                {groupTasks.map(task => <TaskItem key={task.id} task={task} />)}
              </AnimatePresence>
            </div>
          ))
        ) : (
          <AnimatePresence initial={false}>
            {tasks.map(task => <TaskItem key={task.id} task={task} />)}
          </AnimatePresence>
        )}

        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center h-40 text-[var(--muted)]">
            <p className="text-sm">タスクがありません</p>
            <p className="text-xs mt-1">上の入力欄からタスクを追加できます</p>
          </div>
        )}
      </div>
    </div>
  );
}
