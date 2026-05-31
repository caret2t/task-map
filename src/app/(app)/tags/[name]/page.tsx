"use client";

import { use } from "react";
import { useAllTasks } from "@/hooks/useTasks";
import { useTags } from "@/hooks/useTags";
import { TaskItem } from "@/components/task/TaskItem";
import { Tag } from "lucide-react";
import Link from "next/link";

export default function TagFilterPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = use(params);
  const tagName = decodeURIComponent(name);
  const allTasks = useAllTasks();
  const tags = useTags();
  const tag = tags.find(t => t.name === tagName);
  const tasks = (allTasks ?? []).filter(t => t.tags.includes(tagName) && t.status !== "archived");

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 py-4 border-b border-[var(--border)] flex-shrink-0">
        <div className="flex items-center gap-2.5">
          {tag && <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: tag.color }} />}
          <h1 className="text-lg font-bold tracking-tight">#{tagName}</h1>
        </div>
        <p className="text-xs text-[var(--muted)] mt-0.5">{tasks.length}件のタスク</p>
      </div>
      <div className="flex-1 overflow-y-auto py-2">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-[var(--muted)]">
            <Tag className="w-8 h-8 mb-2 opacity-30" />
            <p className="text-sm">#{tagName} のタスクはありません</p>
            <Link href="/tags" className="text-xs text-[var(--primary)] mt-2 hover:underline">タグ管理へ</Link>
          </div>
        ) : (
          tasks.map(task => <TaskItem key={task.id} task={task} />)
        )}
      </div>
    </div>
  );
}
