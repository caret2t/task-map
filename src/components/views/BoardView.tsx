"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import type { Task } from "@/types";
import { updateTask } from "@/hooks/useTasks";
import { useTaskStore } from "@/store/taskStore";
import { PriorityBorder } from "@/components/task/PriorityBadge";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import {
  DndContext,
  DragOverlay,
  rectIntersection,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";

const COLUMNS: { status: Task["status"]; label: string; color: string }[] = [
  { status: "inbox",      label: "インボックス", color: "bg-gray-100 dark:bg-gray-800" },
  { status: "todo",       label: "Todo",         color: "bg-blue-50 dark:bg-blue-950" },
  { status: "in_progress",label: "進行中",        color: "bg-amber-50 dark:bg-amber-950" },
  { status: "done",       label: "完了",          color: "bg-emerald-50 dark:bg-emerald-950" },
];

function BoardCard({ task }: { task: Task }) {
  const { selectedTaskId, setSelectedTask } = useTaskStore();
  const isSelected = selectedTaskId === task.id;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
      onClick={() => setSelectedTask(task)}
      className={cn(
        "relative bg-[var(--background)] border rounded-lg p-3 cursor-pointer shadow-sm hover:shadow-md transition-shadow",
        isSelected ? "border-blue-400" : "border-[var(--border)]",
        isDragging && "opacity-40"
      )}
    >
      <PriorityBorder priority={task.priority} />
      <p className={cn("text-sm font-medium", task.status === "done" && "line-through text-[var(--muted)]")}>
        {task.title}
      </p>
      <div className="flex flex-wrap items-center gap-1 mt-1.5">
        {task.dueDate && (
          <span className="text-xs text-[var(--muted)]">
            📅 {format(new Date(task.dueDate), "M/d", { locale: ja })}
          </span>
        )}
        {task.tags.slice(0, 2).map(tag => (
          <span key={tag} className="text-xs bg-[var(--surface-2)] px-1.5 py-0.5 rounded-full">#{tag}</span>
        ))}
        {task.subtasks.length > 0 && (
          <span className="text-xs text-[var(--muted)]">
            ☑ {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length}
          </span>
        )}
      </div>
    </div>
  );
}

interface BoardViewProps {
  tasks: Task[];
  title: string;
}

function DroppableColumn({ col, colTasks }: { col: typeof COLUMNS[0]; colTasks: Task[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: col.status });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "w-72 flex flex-col rounded-xl p-3 gap-2 transition-opacity",
        col.color,
        isOver && "ring-2 ring-blue-400"
      )}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-semibold">{col.label}</span>
        <span className="text-xs text-[var(--muted)] bg-[var(--background)] px-2 py-0.5 rounded-full">
          {colTasks.length}
        </span>
      </div>
      <SortableContext items={colTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2 flex-1 min-h-16">
          {colTasks.map(task => (
            <BoardCard key={task.id} task={task} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

export function BoardView({ tasks, title }: BoardViewProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const columnTasks = useMemo(() =>
    Object.fromEntries(COLUMNS.map(col => [col.status, tasks.filter(t => t.status === col.status)])),
    [tasks]
  );

  const activeTask = useMemo(() => tasks.find(t => t.id === activeId) ?? null, [tasks, activeId]);

  const handleDragStart = (e: DragStartEvent) => setActiveId(e.active.id as string);

  const handleDragEnd = (e: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = e;
    if (!over) return;
    // over.id can be a column status or a task id
    const overTask = tasks.find(t => t.id === over.id);
    const overCol = COLUMNS.find(c => c.status === over.id);
    const newStatus = overTask?.status ?? overCol?.status;
    if (newStatus && active.id !== over.id) {
      updateTask(active.id as string, { status: newStatus });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-[var(--border)] flex-shrink-0">
        <h1 className="text-base font-semibold">{title}</h1>
        <p className="text-xs text-[var(--muted)] mt-0.5">{tasks.length}件</p>
      </div>
      <div className="flex-1 overflow-x-auto p-4">
        <DndContext
          sensors={sensors}
          collisionDetection={rectIntersection}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 h-full min-w-max">
            {COLUMNS.map(col => {
              const colTasks = columnTasks[col.status] ?? [];
              return (
                <DroppableColumn key={col.status} col={col} colTasks={colTasks} />
              );
            })}
          </div>
          <DragOverlay>
            {activeTask && (
              <div className="bg-[var(--background)] border border-blue-400 rounded-lg p-3 shadow-xl w-72 opacity-90">
                <p className="text-sm font-medium">{activeTask.title}</p>
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
