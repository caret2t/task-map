"use client";

import { useState } from "react";
import { useProjectsByCategory } from "@/hooks/useProjects";
import { useProjectTasks, createTask } from "@/hooks/useTasks";
import { BookOpen, Plus, ExternalLink, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

function ResourceTaskItem({ task }: { task: import("@/types").Task }) {
  const hasUrl = task.body && task.body.startsWith("http");
  return (
    <div className="flex items-start gap-3 px-4 py-3 hover:bg-[var(--sidebar-hover)] rounded-lg transition-colors group">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{task.title}</p>
        {task.body && !hasUrl && (
          <p className="text-xs text-[var(--muted)] mt-0.5 truncate">{task.body}</p>
        )}
        {hasUrl && (
          <a
            href={task.body}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[var(--primary)] hover:underline flex items-center gap-1 mt-0.5"
            onClick={e => e.stopPropagation()}
          >
            <ExternalLink className="w-3 h-3" />
            {task.body}
          </a>
        )}
        {task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {task.tags.map(t => (
              <span key={t} className="text-[10px] bg-[var(--border-2)] px-1.5 py-0.5 rounded-full text-[var(--muted)]">#{t}</span>
            ))}
          </div>
        )}
      </div>
      {hasUrl && (
        <a href={task.body} target="_blank" rel="noopener noreferrer" className="opacity-0 group-hover:opacity-100 text-[var(--muted)] hover:text-[var(--primary)]">
          <ExternalLink className="w-4 h-4" />
        </a>
      )}
    </div>
  );
}

function ResourceSection({ project }: { project: import("@/types").Project }) {
  const tasks = useProjectTasks(project.id);
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");

  const handleAdd = async () => {
    if (!title.trim()) return;
    await createTask({
      title: title.trim(),
      body: url.trim(),
      projectId: project.id,
      status: "todo",
      tags: [],
    });
    setTitle("");
    setUrl("");
    setAdding(false);
  };

  return (
    <div className="border border-[var(--border)] rounded-xl overflow-hidden mb-3">
      <div className="flex items-center gap-2.5 px-4 py-2.5 bg-[var(--surface)] border-b border-[var(--border)]">
        <span className="text-lg">{project.icon}</span>
        <Link href={`/project/${project.id}`} className="text-sm font-semibold hover:text-[var(--primary)] flex-1">{project.name}</Link>
        <span className="text-xs text-[var(--muted)]">{tasks.length}件</span>
        <button onClick={() => setAdding(v => !v)} className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
          {adding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </button>
      </div>
      {adding && (
        <div className="px-4 py-3 bg-[var(--border-2)]/50 border-b border-[var(--border)] space-y-2">
          <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="タイトル" autoFocus onKeyDown={e => e.key === "Enter" && handleAdd()} />
          <Input value={url} onChange={e => setUrl(e.target.value)} placeholder="URL（任意）" onKeyDown={e => e.key === "Enter" && handleAdd()} />
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" size="sm" onClick={() => setAdding(false)}>キャンセル</Button>
            <Button size="sm" onClick={handleAdd} disabled={!title.trim()}>追加</Button>
          </div>
        </div>
      )}
      {tasks.length === 0 ? (
        <div className="px-4 py-4 text-center text-xs text-[var(--muted)]">リソースがありません</div>
      ) : (
        <div className="py-1">
          {tasks.map(t => <ResourceTaskItem key={t.id} task={t} />)}
        </div>
      )}
    </div>
  );
}

export default function ResourcesPage() {
  const resources = useProjectsByCategory("resources");

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 py-4 border-b border-[var(--border)] flex-shrink-0">
        <h1 className="text-lg font-bold tracking-tight">📚 リソース</h1>
        <p className="text-xs text-[var(--muted)] mt-0.5">参考資料・URLコレクション</p>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {resources.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-[var(--muted)]">
            <BookOpen className="w-8 h-8 mb-2 opacity-30" />
            <p className="text-sm">リソースプロジェクトがありません</p>
            <p className="text-xs mt-1">サイドバーからプロジェクトを追加し、カテゴリを「リソース」に設定してください</p>
          </div>
        ) : (
          <div>
            {resources.map(r => <ResourceSection key={r.id} project={r} />)}
          </div>
        )}
      </div>
    </div>
  );
}
