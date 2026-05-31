"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, ChevronUp, Repeat } from "lucide-react";
import { cn } from "@/lib/utils";
import { createTask } from "@/hooks/useTasks";
import { useProjectsByCategory } from "@/hooks/useProjects";
import { useUIStore } from "@/store/uiStore";
import type { Task, WorkType } from "@/types";

const PRIORITY_OPTIONS: { value: Task["priority"]; label: string }[] = [
  { value: 0, label: "なし" },
  { value: 1, label: "中" },
  { value: 2, label: "高" },
  { value: 3, label: "緊急" },
];

const WORK_TYPES: { value: WorkType; label: string }[] = [
  { value: null, label: "なし" },
  { value: "focus", label: "🎯 集中作業" },
  { value: "shallow", label: "✏️ 軽作業" },
  { value: "meeting", label: "🗣️ ミーティング" },
  { value: "admin", label: "📋 管理・事務" },
  { value: "review", label: "🔍 レビュー" },
];

const EST_OPTIONS: { value: number; label: string }[] = [
  { value: 15, label: "15分" },
  { value: 30, label: "30分" },
  { value: 60, label: "1時間" },
  { value: 90, label: "1.5時間" },
  { value: 120, label: "2時間" },
  { value: 180, label: "3時間" },
];

interface Props {
  defaultStatus?: Task["status"];
  defaultProjectId?: string | null;
}

export function InlineAddTask({ defaultStatus = "inbox", defaultProjectId = null }: Props) {
  const { inlineAddOpen, setInlineAddOpen } = useUIStore();
  const [expanded, setExpanded] = useState(false);
  const [title, setTitle] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [dueChecked, setDueChecked] = useState(false);
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<Task["priority"]>(0);
  const [projectId, setProjectId] = useState<string | null>(defaultProjectId);
  const [workType, setWorkType] = useState<WorkType>(null);
  const [estimatedMinutes, setEstimatedMinutes] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const projects = useProjectsByCategory("projects");
  const areas = useProjectsByCategory("areas");
  const allProjects = [...(projects ?? []), ...(areas ?? [])];

  useEffect(() => {
    if (inlineAddOpen) {
      setInlineAddOpen(false);
      inputRef.current?.focus();
    }
  }, [inlineAddOpen, setInlineAddOpen]);

  const reset = () => {
    setTitle("");
    setScheduledDate("");
    setDueChecked(false);
    setDueDate("");
    setPriority(0);
    setProjectId(defaultProjectId);
    setWorkType(null);
    setEstimatedMinutes(null);
    setExpanded(false);
    inputRef.current?.blur();
  };

  const handleAdd = async () => {
    if (!title.trim()) { reset(); return; }
    await createTask({
      title: title.trim(),
      status: defaultStatus,
      projectId,
      priority,
      scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
      dueDate: dueChecked && dueDate ? new Date(dueDate) : null,
      workType,
      estimatedMinutes,
    });
    setTitle("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAdd(); }
    if (e.key === "Escape") reset();
  };

  const selectClass = "w-full text-xs px-2 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]";
  const dateClass = "w-full text-xs px-2 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]";

  return (
    <div className="px-4 pt-3 pb-2 flex-shrink-0">
      {/* Rounded card container */}
      <div className={cn(
        "rounded-xl bg-[var(--surface)] transition-all duration-200",
        expanded ? "shadow-lg" : "shadow-sm hover:shadow-md"
      )}>

        {/* Input row — always visible */}
        <div className="flex items-center gap-2 px-3 py-2.5">
          <Plus className="w-4 h-4 text-[var(--muted)] flex-shrink-0" />
          <input
            ref={inputRef}
            value={title}
            onChange={e => setTitle(e.target.value)}
            onFocus={() => setExpanded(true)}
            onKeyDown={handleKeyDown}
            placeholder="タスクを入力..."
            className="flex-1 text-sm bg-transparent outline-none placeholder:text-[var(--muted)] min-w-0"
          />
          <button
            onClick={handleAdd}
            className={cn(
              "flex-shrink-0 text-xs px-3 py-1 rounded-lg font-medium transition-all",
              title.trim()
                ? "bg-[var(--foreground)] text-[var(--background)] hover:opacity-80"
                : "bg-[var(--surface-2)] text-[var(--muted)] cursor-default"
            )}
          >
            追加
          </button>
        </div>

        {/* Expanded form */}
        {expanded && (
          <div className="px-3 pb-3 space-y-2.5 pt-2.5">
            {/* Date row */}
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label className="text-xs text-[var(--muted)] mb-1 block">予定日</label>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={e => setScheduledDate(e.target.value)}
                  className={dateClass}
                />
              </div>
              <label className="flex items-center gap-1 text-xs text-[var(--muted)] cursor-pointer select-none pb-2 whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={dueChecked}
                  onChange={e => setDueChecked(e.target.checked)}
                  className="rounded border-[var(--border)] accent-[var(--primary)] w-3.5 h-3.5"
                />
                〆
              </label>
              <div className={cn("flex-1 transition-opacity", dueChecked ? "opacity-100" : "opacity-40 pointer-events-none")}>
                <label className="text-xs text-[var(--muted)] mb-1 block">期限日</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  disabled={!dueChecked}
                  className={dateClass}
                />
              </div>
            </div>

            {/* Row: 重要度 + プロジェクト */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-[var(--muted)] mb-1 block">重要度</label>
                <select value={priority} onChange={e => setPriority(Number(e.target.value) as Task["priority"])} className={selectClass}>
                  {PRIORITY_OPTIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-[var(--muted)] mb-1 block">プロジェクト</label>
                <select value={projectId ?? ""} onChange={e => setProjectId(e.target.value || null)} className={selectClass}>
                  <option value="">なし</option>
                  {allProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            </div>

            {/* Row: 作業種別 + 予定時間 */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-[var(--muted)] mb-1 block">作業種別</label>
                <select value={workType ?? ""} onChange={e => setWorkType((e.target.value || null) as WorkType)} className={selectClass}>
                  {WORK_TYPES.map(w => <option key={String(w.value)} value={w.value ?? ""}>{w.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-[var(--muted)] mb-1 block">予定時間</label>
                <select value={estimatedMinutes ?? ""} onChange={e => setEstimatedMinutes(e.target.value ? Number(e.target.value) : null)} className={selectClass}>
                  <option value="">なし</option>
                  {EST_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>

            {/* Action row */}
            <div className="flex items-center justify-between pt-0.5">
              <button
                onClick={reset}
                className="flex items-center gap-1 text-xs text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
              >
                <ChevronUp className="w-3 h-3" />
                閉じる
              </button>
              <button className="flex items-center gap-1 text-xs text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
                <Repeat className="w-3 h-3" />
                繰り返しタスクにする →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
