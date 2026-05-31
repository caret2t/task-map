"use client";

import { useMemo, useState } from "react";
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isToday,
  addMonths, subMonths, format,
} from "date-fns";
import { ja } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Task } from "@/types";
import { useTaskStore } from "@/store/taskStore";

const DOW = ["日", "月", "火", "水", "木", "金", "土"];

const PRIORITY_COLORS: Record<number, string> = {
  3: "bg-red-500",
  2: "bg-orange-400",
  1: "bg-yellow-400",
  0: "bg-blue-400",
};

interface CalendarViewProps {
  tasks: Task[];
  title: string;
}

export function CalendarView({ tasks, title }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { setSelectedTask } = useTaskStore();

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const tasksByDate = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const task of tasks) {
      const date = task.scheduledDate ?? task.dueDate;
      if (!date) continue;
      const key = format(new Date(date), "yyyy-MM-dd");
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(task);
    }
    return map;
  }, [tasks]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[var(--border)] flex-shrink-0">
        <div className="flex items-center justify-between">
          <h1 className="text-base font-semibold">{title}</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentMonth(m => subMonths(m, 1))}
              className="p-1.5 rounded hover:bg-[var(--surface)] text-[var(--muted)] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium min-w-24 text-center">
              {format(currentMonth, "yyyy年M月", { locale: ja })}
            </span>
            <button
              onClick={() => setCurrentMonth(m => addMonths(m, 1))}
              className="p-1.5 rounded hover:bg-[var(--surface)] text-[var(--muted)] transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="flex-1 overflow-y-auto p-2">
        {/* Day of week header */}
        <div className="grid grid-cols-7 mb-1">
          {DOW.map((d, i) => (
            <div
              key={d}
              className={cn(
                "text-xs font-medium text-center py-1",
                i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-[var(--muted)]"
              )}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Calendar cells */}
        <div className="grid grid-cols-7 gap-px bg-[var(--border)]">
          {days.map(day => {
            const key = format(day, "yyyy-MM-dd");
            const dayTasks = tasksByDate.get(key) ?? [];
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const dayOfWeek = day.getDay();

            return (
              <div
                key={key}
                className={cn(
                  "bg-[var(--background)] min-h-20 p-1 flex flex-col gap-0.5",
                  !isCurrentMonth && "opacity-40"
                )}
              >
                <span
                  className={cn(
                    "text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full mx-auto mb-0.5",
                    isToday(day) && "bg-blue-500 text-white",
                    !isToday(day) && dayOfWeek === 0 && "text-red-400",
                    !isToday(day) && dayOfWeek === 6 && "text-blue-400",
                    !isToday(day) && dayOfWeek > 0 && dayOfWeek < 6 && "text-[var(--foreground)]"
                  )}
                >
                  {format(day, "d")}
                </span>

                {dayTasks.slice(0, 3).map(task => (
                  <button
                    key={task.id}
                    onClick={() => setSelectedTask(task)}
                    className={cn(
                      "w-full text-left text-xs px-1 py-0.5 rounded truncate",
                      task.status === "done"
                        ? "line-through text-[var(--muted)] bg-[var(--surface)]"
                        : cn("text-white", PRIORITY_COLORS[task.priority])
                    )}
                  >
                    {task.title}
                  </button>
                ))}
                {dayTasks.length > 3 && (
                  <span className="text-xs text-[var(--muted)] px-1">+{dayTasks.length - 3}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
