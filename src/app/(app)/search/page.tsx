"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useAllTasks, updateTask } from "@/hooks/useTasks";
import { useProjects } from "@/hooks/useProjects";
import { useTags } from "@/hooks/useTags";
import { TaskItem } from "@/components/task/TaskItem";
import { Search, X, Clock, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Task } from "@/types";

const HISTORY_KEY = "taskmap-search-history";
const MAX_HISTORY = 5;

function getHistory(): string[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "[]"); } catch { return []; }
}
function saveHistory(q: string) {
  const h = [q, ...getHistory().filter(x => x !== q)].slice(0, MAX_HISTORY);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(h));
}

function highlight(text: string, query: string) {
  if (!query) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  return parts.map((p, i) =>
    p.toLowerCase() === query.toLowerCase()
      ? <mark key={i} className="bg-yellow-200 dark:bg-yellow-800/60 rounded-sm px-0.5">{p}</mark>
      : p
  );
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [filterPriority, setFilterPriority] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<Task["status"] | null>(null);
  const [filterProjectId, setFilterProjectId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const allTasks = useAllTasks();
  const projects = useProjects();
  const tags = useTags();

  useEffect(() => {
    setHistory(getHistory());
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  const results = useMemo(() => {
    if (!debouncedQuery && filterPriority === null && filterStatus === null && filterProjectId === null) return null;
    return (allTasks ?? []).filter(t => {
      if (filterPriority !== null && t.priority !== filterPriority) return false;
      if (filterStatus !== null && t.status !== filterStatus) return false;
      if (filterProjectId !== null && t.projectId !== filterProjectId) return false;
      if (!debouncedQuery) return true;
      const q = debouncedQuery.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.body.toLowerCase().includes(q) ||
        t.tags.some(tag => tag.toLowerCase().includes(q)) ||
        (projects ?? []).find(p => p.id === t.projectId)?.name.toLowerCase().includes(q)
      );
    });
  }, [debouncedQuery, allTasks, projects, filterPriority, filterStatus, filterProjectId]);

  const handleSearch = (q: string) => {
    if (q.trim()) saveHistory(q.trim());
    setHistory(getHistory());
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-2 border-b border-[var(--border)] flex-shrink-0 space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch(query)}
            placeholder="タスク・メモ・タグを検索..."
            className="w-full bg-[var(--border-2)] border border-[var(--border)] rounded-xl pl-9 pr-9 py-2.5 text-sm placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 focus:border-[var(--primary)]"
          />
          {query && (
            <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--foreground)]">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(v => !v)}
            className={cn(
              "flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border transition-all",
              showFilters ? "bg-[var(--primary)] text-white border-[var(--primary)]" : "border-[var(--border)] text-[var(--foreground-2)] hover:bg-[var(--sidebar-hover)]"
            )}
          >
            <Filter className="w-3 h-3" />フィルター
          </button>
          {(filterPriority !== null || filterStatus !== null || filterProjectId !== null) && (
            <button
              onClick={() => { setFilterPriority(null); setFilterStatus(null); setFilterProjectId(null); }}
              className="text-xs text-[var(--muted)] hover:text-[var(--foreground)] flex items-center gap-1"
            >
              <X className="w-3 h-3" />クリア
            </button>
          )}
        </div>
        {showFilters && (
          <div className="flex flex-wrap gap-2 pb-1">
            <select
              value={filterPriority ?? ""}
              onChange={e => setFilterPriority(e.target.value === "" ? null : Number(e.target.value))}
              className="text-xs bg-[var(--border-2)] border border-[var(--border)] rounded-lg px-2 py-1 text-[var(--foreground)]"
            >
              <option value="">優先度（全て）</option>
              <option value="3">🔴 緊急</option>
              <option value="2">🟠 高</option>
              <option value="1">🔵 中</option>
              <option value="0">⚪ なし</option>
            </select>
            <select
              value={filterStatus ?? ""}
              onChange={e => setFilterStatus((e.target.value || null) as Task["status"] | null)}
              className="text-xs bg-[var(--border-2)] border border-[var(--border)] rounded-lg px-2 py-1 text-[var(--foreground)]"
            >
              <option value="">ステータス（全て）</option>
              <option value="inbox">インボックス</option>
              <option value="todo">ToDo</option>
              <option value="in_progress">進行中</option>
              <option value="done">完了</option>
            </select>
            <select
              value={filterProjectId ?? ""}
              onChange={e => setFilterProjectId(e.target.value || null)}
              className="text-xs bg-[var(--border-2)] border border-[var(--border)] rounded-lg px-2 py-1 text-[var(--foreground)]"
            >
              <option value="">プロジェクト（全て）</option>
              {(projects ?? []).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {results === null ? (
          <div className="px-4 py-6">
            {history.length > 0 && (
              <div>
                <p className="text-xs font-medium text-[var(--muted)] mb-2 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />最近の検索
                </p>
                <div className="space-y-0.5">
                  {history.map(h => (
                    <button
                      key={h}
                      onClick={() => setQuery(h)}
                      className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-[var(--foreground-2)] hover:bg-[var(--sidebar-hover)] transition-colors"
                    >
                      <Clock className="w-3.5 h-3.5 text-[var(--muted)]" />
                      {h}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {history.length === 0 && (
              <div className="flex flex-col items-center justify-center h-40 text-[var(--muted)]">
                <Search className="w-8 h-8 mb-2 opacity-30" />
                <p className="text-sm">タスクを検索しましょう</p>
              </div>
            )}
          </div>
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-[var(--muted)]">
            <Search className="w-8 h-8 mb-2 opacity-30" />
            <p className="text-sm">「{debouncedQuery}」の結果はありません</p>
          </div>
        ) : (
          <div>
            <p className="px-4 py-1.5 text-xs text-[var(--muted)]">{results.length}件</p>
            {results.map(task => <TaskItem key={task.id} task={task} />)}
          </div>
        )}
      </div>
    </div>
  );
}
