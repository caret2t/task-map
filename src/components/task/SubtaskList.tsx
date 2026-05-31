"use client";

import { useState } from "react";
import { Plus, X, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Task, Subtask } from "@/types";
import { updateTask } from "@/hooks/useTasks";
import { v4 as uuidv4 } from "uuid";
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
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function SortableSubtask({
  subtask,
  onToggle,
  onRemove,
  onTitleChange,
}: {
  subtask: Subtask;
  onToggle: () => void;
  onRemove: () => void;
  onTitleChange: (title: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: subtask.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "flex items-center gap-2 py-1 group",
        isDragging && "opacity-50"
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="text-[var(--muted)] opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={onToggle}
        className={cn(
          "w-4 h-4 rounded border-2 flex-shrink-0 transition-all flex items-center justify-center",
          subtask.completed
            ? "bg-blue-500 border-blue-500"
            : "border-[var(--muted)] hover:border-blue-500"
        )}
      >
        {subtask.completed && (
          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 12 12">
            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
      <input
        value={subtask.title}
        onChange={(e) => onTitleChange(e.target.value)}
        className={cn(
          "flex-1 text-sm bg-transparent outline-none",
          subtask.completed && "line-through text-[var(--muted)]"
        )}
      />
      <button
        onClick={onRemove}
        className="opacity-0 group-hover:opacity-100 text-[var(--muted)] hover:text-red-500 transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export function SubtaskList({ task }: { task: Task }) {
  const [newTitle, setNewTitle] = useState("");
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const save = (subtasks: Subtask[]) => updateTask(task.id, { subtasks });

  const addSubtask = () => {
    const trimmed = newTitle.trim();
    if (!trimmed) return;
    const subtask: Subtask = { id: uuidv4(), title: trimmed, completed: false, order: task.subtasks.length };
    save([...task.subtasks, subtask]);
    setNewTitle("");
  };

  const toggleSubtask = (id: string) => {
    save(task.subtasks.map(s => s.id === id ? { ...s, completed: !s.completed } : s));
  };

  const removeSubtask = (id: string) => {
    save(task.subtasks.filter(s => s.id !== id));
  };

  const updateTitle = (id: string, title: string) => {
    save(task.subtasks.map(s => s.id === id ? { ...s, title } : s));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = task.subtasks.findIndex(s => s.id === active.id);
    const newIdx = task.subtasks.findIndex(s => s.id === over.id);
    const reordered = arrayMove(task.subtasks, oldIdx, newIdx).map((s, i) => ({ ...s, order: i }));
    save(reordered);
  };

  const done = task.subtasks.filter(s => s.completed).length;
  const total = task.subtasks.length;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[var(--muted)]">
          サブタスク {total > 0 && `${done}/${total}`}
        </span>
        {total > 0 && (
          <div className="flex-1 mx-3 h-1 bg-[var(--surface-2)] rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${Math.round((done / total) * 100)}%` }}
            />
          </div>
        )}
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={task.subtasks.map(s => s.id)} strategy={verticalListSortingStrategy}>
          {task.subtasks.map(subtask => (
            <SortableSubtask
              key={subtask.id}
              subtask={subtask}
              onToggle={() => toggleSubtask(subtask.id)}
              onRemove={() => removeSubtask(subtask.id)}
              onTitleChange={(t) => updateTitle(subtask.id, t)}
            />
          ))}
        </SortableContext>
      </DndContext>

      <div className="flex items-center gap-2">
        <Plus className="w-3.5 h-3.5 text-[var(--muted)] flex-shrink-0" />
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") { e.preventDefault(); addSubtask(); }
          }}
          placeholder="サブタスクを追加..."
          className="flex-1 text-sm bg-transparent outline-none placeholder:text-[var(--muted)]"
        />
      </div>
    </div>
  );
}
