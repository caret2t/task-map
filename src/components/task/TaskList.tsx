"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { format, isToday, isTomorrow, isThisWeek } from "date-fns";
import { ja } from "date-fns/locale";
import type { Task } from "@/types";
import { TaskItem } from "./TaskItem";
import { InlineAddTask } from "./InlineAddTask";
import { reorderTasks } from "@/hooks/useTasks";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";

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
  const [localOrder, setLocalOrder] = useState<string[] | null>(null);
  // タスクセットが別のリスト（プロジェクト切り替えなど）に変わったらローカル順序をリセット
  const prevTaskSetRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    const newIds = new Set(tasks.map(t => t.id));
    const prev = prevTaskSetRef.current;
    const isNewSet = tasks.length > 0 && ![...newIds].some(id => prev.has(id));
    if (isNewSet) setLocalOrder(null);
    prevTaskSetRef.current = newIds;
  }, [tasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const displayTasks = useMemo(() => {
    if (!localOrder) return tasks;
    return [...tasks].sort((a, b) => {
      const ai = localOrder.indexOf(a.id);
      const bi = localOrder.indexOf(b.id);
      if (ai === -1 && bi === -1) return 0;
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });
  }, [tasks, localOrder]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ids = displayTasks.map(t => t.id);
    const oldIdx = ids.indexOf(active.id as string);
    const newIdx = ids.indexOf(over.id as string);
    const newOrder = arrayMove(ids, oldIdx, newIdx);
    setLocalOrder(newOrder);
    reorderTasks(newOrder);
  };

  const totalMinutes = useMemo(
    () => displayTasks.reduce((sum, t) => sum + (t.estimatedMinutes ?? 0), 0),
    [displayTasks]
  );
  const doneCount = useMemo(() => displayTasks.filter(t => t.status === "done").length, [displayTasks]);
  const progressPct = displayTasks.length > 0 ? Math.round((doneCount / displayTasks.length) * 100) : 0;

  const groups = useMemo(
    () => showDateGroups ? groupTasksByDate(displayTasks) : null,
    [displayTasks, showDateGroups]
  );

  const formatMinutes = (min: number) => {
    if (min < 60) return `${min}分`;
    const h = Math.floor(min / 60);
    const m = min % 60;
    return m > 0 ? `${h}h${m}m` : `${h}h`;
  };

  // 進捗リング用 SVG 計算
  const RING_R = 16;
  const RING_CIRC = 2 * Math.PI * RING_R;
  const ringOffset = displayTasks.length > 0 ? RING_CIRC * (1 - progressPct / 100) : RING_CIRC;

  return (
    <div className="flex flex-col h-full page-enter">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[var(--border)] flex-shrink-0">
        <div className="flex items-center gap-3">
          {displayTasks.length > 0 && (
            <div className="relative w-10 h-10 flex-shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 40 40">
                <circle cx="20" cy="20" r={RING_R} fill="none" stroke="var(--border)" strokeWidth="3" />
                <circle
                  cx="20" cy="20" r={RING_R}
                  fill="none"
                  stroke="var(--primary)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={RING_CIRC}
                  strokeDashoffset={ringOffset}
                  className="transition-all duration-700"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-[var(--foreground-2)]">
                {progressPct}%
              </span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold tracking-tight truncate">{title}</h1>
            {displayTasks.length > 0 && (
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--primary)] rounded-full transition-all duration-700"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <span className="text-[11px] text-[var(--muted)] whitespace-nowrap">
                  {doneCount}/{displayTasks.length} 完了
                  {totalMinutes > 0 && ` · ⏱ ${formatMinutes(totalMinutes)}`}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Inline add task — always visible at top */}
      <InlineAddTask defaultStatus={defaultStatus} defaultProjectId={defaultProjectId} />

      {/* Task list */}
      <div className="flex-1 overflow-y-auto py-2">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          {groups ? (
            groups.map(({ label, tasks: groupTasks }) => (
              <div key={label}>
                <div className="px-4 py-1.5 flex items-center gap-2">
                  <span className="text-xs font-medium text-[var(--muted)]">{label}</span>
                  <span className="text-xs text-[var(--muted)]">({groupTasks.length})</span>
                  <div className="flex-1 h-px bg-[var(--border)]" />
                </div>
                <SortableContext items={groupTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                  <AnimatePresence initial={false}>
                    {groupTasks.map(task => <TaskItem key={task.id} task={task} />)}
                  </AnimatePresence>
                </SortableContext>
              </div>
            ))
          ) : (
            <SortableContext items={displayTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
              <AnimatePresence initial={false}>
                {displayTasks.map(task => <TaskItem key={task.id} task={task} />)}
              </AnimatePresence>
            </SortableContext>
          )}
        </DndContext>

        {displayTasks.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 gap-3 px-6">
            <div className="w-16 h-16 rounded-2xl bg-[var(--border-2)] flex items-center justify-center">
              <svg className="w-8 h-8 text-[var(--muted-2)]" fill="none" viewBox="0 0 32 32">
                <path d="M8 10h16M8 16h10M8 22h7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                <circle cx="24" cy="24" r="6" fill="var(--background)" stroke="var(--primary)" strokeWidth="1.8"/>
                <path d="M22 24l1.5 1.5L26 22" stroke="var(--primary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-[var(--foreground-2)]">タスクがありません</p>
              <p className="text-xs text-[var(--muted)] mt-1">上の入力欄からタスクを追加しましょう</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
