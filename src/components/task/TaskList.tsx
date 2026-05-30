"use client";

import { useState, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import type { Task } from "@/types";
import { TaskItem } from "./TaskItem";
import { createTask } from "@/hooks/useTasks";

interface TaskListProps {
  tasks: Task[];
  title: string;
  defaultStatus?: Task["status"];
  defaultProjectId?: string | null;
}

export function TaskList({ tasks, title, defaultStatus = "inbox", defaultProjectId = null }: TaskListProps) {
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAdd = async () => {
    const trimmed = newTitle.trim();
    if (!trimmed) {
      setAdding(false);
      return;
    }
    await createTask({ title: trimmed, status: defaultStatus, projectId: defaultProjectId });
    setNewTitle("");
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[var(--border)] flex-shrink-0">
        <h1 className="text-base font-semibold">{title}</h1>
        <p className="text-xs text-[var(--muted)] mt-0.5">{tasks.length}件のタスク</p>
      </div>

      {/* Task list */}
      <div className="flex-1 overflow-y-auto py-2">
        <AnimatePresence initial={false}>
          {tasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
        </AnimatePresence>

        {tasks.length === 0 && !adding && (
          <div className="flex flex-col items-center justify-center h-40 text-[var(--muted)]">
            <p className="text-sm">タスクがありません</p>
            <p className="text-xs mt-1">「＋ タスクを追加」で作成</p>
          </div>
        )}
      </div>

      {/* Add task */}
      <div className="border-t border-[var(--border)] px-4 py-2 flex-shrink-0">
        {adding ? (
          <input
            ref={inputRef}
            autoFocus
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdd();
              if (e.key === "Escape") {
                setAdding(false);
                setNewTitle("");
              }
            }}
            onBlur={handleAdd}
            placeholder="タスクのタイトルを入力..."
            className="w-full text-sm bg-transparent outline-none placeholder:text-[var(--muted)]"
          />
        ) : (
          <button
            className="flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
            onClick={() => setAdding(true)}
          >
            <Plus className="w-4 h-4" />
            タスクを追加
          </button>
        )}
      </div>
    </div>
  );
}
