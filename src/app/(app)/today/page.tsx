"use client";
// v2
import { useState, useMemo } from "react";
import { useTodayTasks, useOverdueTasks } from "@/hooks/useTasks";
import { TaskItem } from "@/components/task/TaskItem";
import { InlineAddTask } from "@/components/task/InlineAddTask";
import { ChevronDown, ChevronRight, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

export default function TodayPage() {
  const tasks = useTodayTasks();
  const overdueTasks = useOverdueTasks();
  const [showDone, setShowDone] = useState(false);
  const [showOverdue, setShowOverdue] = useState(true);

  const today = new Date();
  const dateLabel = format(today, "yyyy年M月d日（E）", { locale: ja });

  const activeTasks = useMemo(() => (tasks ?? []).filter(t => t.status !== "done"), [tasks]);
  const doneTasks = useMemo(() => (tasks ?? []).filter(t => t.status === "done"), [tasks]);

  return (
    <div className="flex flex-col h-full page-enter">
      <div className="px-5 py-4 border-b border-[var(--border)] flex-shrink-0">
        <h1 className="text-lg font-bold tracking-tight">📅 今日</h1>
        <p className="text-xs text-[var(--muted)] mt-0.5">{dateLabel}</p>
      </div>

      <InlineAddTask defaultStatus="todo" />

      <div className="flex-1 overflow-y-auto py-2">
        {/* 期限切れ */}
        {(overdueTasks ?? []).length > 0 && (
          <div className="mb-2">
            <button
              onClick={() => setShowOverdue(v => !v)}
              className="flex items-center gap-2 px-4 py-1.5 w-full text-left"
            >
              <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
              <span className="text-xs font-medium text-red-500">期限切れ（{(overdueTasks ?? []).length}）</span>
              <div className="flex-1 h-px bg-red-200 dark:bg-red-900/30 mx-1" />
              {showOverdue
                ? <ChevronDown className="w-3.5 h-3.5 text-red-400" />
                : <ChevronRight className="w-3.5 h-3.5 text-red-400" />}
            </button>
            {showOverdue && (overdueTasks ?? []).map(t => <TaskItem key={t.id} task={t} />)}
          </div>
        )}

        {/* 今日のアクティブタスク */}
        {activeTasks.map(t => <TaskItem key={t.id} task={t} />)}

        {/* 完了済み折り畳み */}
        {doneTasks.length > 0 && (
          <div className="mt-2">
            <button
              onClick={() => setShowDone(v => !v)}
              className="flex items-center gap-2 px-4 py-1.5 w-full text-left"
            >
              <span className="text-xs font-medium text-[var(--muted)]">完了済み（{doneTasks.length}件）</span>
              <div className="flex-1 h-px bg-[var(--border)] mx-1" />
              {showDone
                ? <ChevronDown className="w-3.5 h-3.5 text-[var(--muted)]" />
                : <ChevronRight className="w-3.5 h-3.5 text-[var(--muted)]" />}
            </button>
            {showDone && doneTasks.map(t => <TaskItem key={t.id} task={t} />)}
          </div>
        )}

        {activeTasks.length === 0 && doneTasks.length === 0 && (overdueTasks ?? []).length === 0 && (
          <div className="flex flex-col items-center justify-center h-48 gap-3 px-6">
            <div className="w-16 h-16 rounded-2xl bg-[var(--border-2)] flex items-center justify-center">
              <span className="text-3xl">🎉</span>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-[var(--foreground-2)]">今日のタスクはありません</p>
              <p className="text-xs text-[var(--muted)] mt-1">上の入力欄からタスクを追加しましょう</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
