"use client";

import { useEffect, useState } from "react";
import { Command } from "cmdk";
import { useUIStore } from "@/store/uiStore";
import { useAllTasks } from "@/hooks/useTasks";
import { useTaskStore } from "@/store/taskStore";
import type { Task } from "@/types";
import * as DialogPrimitive from "@radix-ui/react-dialog";

export function CommandPalette() {
  const { commandPaletteOpen, setCommandPaletteOpen } = useUIStore();
  const { setSelectedTask } = useTaskStore();
  const allTasks = useAllTasks();
  const [search, setSearch] = useState("");

  // Cmd+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [setCommandPaletteOpen]);

  const filtered = allTasks.filter(
    (t) =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.body && t.body.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSelect = (task: Task) => {
    setSelectedTask(task);
    setCommandPaletteOpen(false);
    setSearch("");
  };

  return (
    <DialogPrimitive.Root open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
        <DialogPrimitive.Content aria-describedby={undefined} className="fixed left-1/2 top-[20%] z-50 -translate-x-1/2 w-full max-w-xl">
          {/* スクリーンリーダー向けタイトル・説明（視覚的には非表示） */}
          <DialogPrimitive.Title className="sr-only">タスク検索</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">タスク名またはメモで検索して選択できます</DialogPrimitive.Description>
          <Command className="rounded-lg border border-[var(--border)] bg-[var(--background)] shadow-2xl overflow-hidden">
            <Command.Input
              value={search}
              onValueChange={setSearch}
              placeholder="タスクを検索..."
              className="w-full px-4 py-3 text-sm outline-none bg-transparent border-b border-[var(--border)] placeholder:text-[var(--muted)]"
            />
            <Command.List className="max-h-72 overflow-y-auto p-2">
              <Command.Empty className="py-8 text-center text-sm text-[var(--muted)]">
                タスクが見つかりません
              </Command.Empty>
              {filtered.slice(0, 20).map((task) => (
                <Command.Item
                  key={task.id}
                  value={task.title}
                  onSelect={() => handleSelect(task)}
                  className="flex items-center gap-2 px-3 py-2 rounded cursor-pointer text-sm hover:bg-[var(--surface)] aria-selected:bg-[var(--surface)]"
                >
                  <span
                    className={`text-sm ${
                      task.status === "done" ? "line-through text-[var(--muted)]" : ""
                    }`}
                  >
                    {task.title}
                  </span>
                  <span className="text-xs text-[var(--muted)] ml-auto">
                    {task.status === "inbox" ? "インボックス" : task.status}
                  </span>
                </Command.Item>
              ))}
            </Command.List>
          </Command>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
