"use client";

import { useEffect, useState, useCallback } from "react";
import { format } from "date-fns";
import { Trash2, X, Focus } from "lucide-react";
import type { Task } from "@/types";
import { updateTask, deleteTask } from "@/hooks/useTasks";
import { useTaskStore } from "@/store/taskStore";
import { TiptapEditor } from "@/components/editor/TiptapEditor";
import { DatePicker } from "./DatePicker";
import { SubtaskList } from "./SubtaskList";
import { RecurrenceSelector } from "./RecurrenceSelector";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { useUIStore } from "@/store/uiStore";
import { cn } from "@/lib/utils";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";

interface TaskDetailProps { task: Task; }

const PRIORITIES: { value: 0 | 1 | 2 | 3; label: string; color: string; bg: string }[] = [
  { value: 3, label: "緊急", color: "text-red-500",    bg: "bg-red-500/10 border-red-400" },
  { value: 2, label: "高",   color: "text-orange-500", bg: "bg-orange-500/10 border-orange-400" },
  { value: 1, label: "中",   color: "text-blue-500",   bg: "bg-blue-500/10 border-blue-400" },
  { value: 0, label: "なし", color: "text-[var(--muted)]", bg: "bg-[var(--border-2)] border-[var(--border)]" },
];

const STATUSES: { value: Task["status"]; label: string; color: string }[] = [
  { value: "inbox",       label: "インボックス", color: "bg-purple-500/15 text-purple-500 border-purple-400/40" },
  { value: "todo",        label: "Todo",         color: "bg-blue-500/15 text-blue-500 border-blue-400/40" },
  { value: "in_progress", label: "進行中",       color: "bg-amber-500/15 text-amber-600 border-amber-400/40" },
  { value: "done",        label: "完了",         color: "bg-emerald-500/15 text-emerald-600 border-emerald-400/40" },
  { value: "archived",    label: "アーカイブ",   color: "bg-gray-500/15 text-gray-500 border-gray-400/40" },
];

function PropRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <span className="text-xs font-medium text-[var(--muted)] w-16 flex-shrink-0 pt-0.5">{label}</span>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

export function TaskDetail({ task }: TaskDetailProps) {
  const { setSelectedTask } = useTaskStore();
  const { enterFocusMode } = useUIStore();
  const [title, setTitle] = useState(task.title);
  const [tagInput, setTagInput] = useState("");

  const project = useLiveQuery<import("@/types").Project | undefined>(
    () => task.projectId ? db.projects.get(task.projectId) : Promise.resolve(undefined),
    [task.projectId]
  );

  useEffect(() => { setTitle(task.title); }, [task.id, task.title]);

  const save = useCallback((changes: Partial<Task>) => updateTask(task.id, changes), [task.id]);

  const handleTitleBlur = () => {
    if (title.trim() && title !== task.title) save({ title: title.trim() });
  };

  const handleBodyChange = useCallback(
    (html: string) => { if (html !== task.body) save({ body: html }); },
    [task.body, save]
  );

  const addTag = (tag: string) => {
    const trimmed = tag.trim().replace(/^#/, "");
    if (trimmed && !task.tags.includes(trimmed)) save({ tags: [...task.tags, trimmed] });
    setTagInput("");
  };

  const removeTag = (tag: string) => save({ tags: task.tags.filter(t => t !== tag) });

  const handleDelete = async () => {
    await deleteTask(task.id);
    setSelectedTask(null);
  };

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border)] flex-shrink-0">
          <div className="flex items-center gap-1.5 min-w-0">
            {project && (
              <span
                className="text-[11px] px-1.5 py-0.5 rounded-md font-medium flex-shrink-0"
                style={{ background: (project.color ?? "#888") + "22", color: project.color ?? "#888" }}
              >
                {project.icon} {project.name}
              </span>
            )}
            <span className="text-xs text-[var(--muted)] truncate">タスク詳細</span>
          </div>
          <div className="flex items-center gap-0.5 flex-shrink-0">
            <Button variant="ghost" size="icon" onClick={() => enterFocusMode(task.id)} title="フォーカスモード"
              className="w-8 h-8 text-[var(--muted)] hover:text-[var(--foreground)]">
              <Focus className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setSelectedTask(null)}
              className="w-8 h-8 text-[var(--muted)] hover:text-[var(--foreground)]">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="px-5 py-4 space-y-1">
          {/* Title */}
          <textarea
            value={title}
            onChange={e => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            className="w-full text-xl font-bold bg-transparent resize-none outline-none leading-snug placeholder:text-[var(--muted-2)]"
            rows={2}
            placeholder="タスクタイトル"
          />

          {/* Properties group: Priority + Status */}
          <div className="rounded-xl bg-[var(--surface)] border border-[var(--border)] divide-y divide-[var(--border)] overflow-hidden">
            {/* Priority */}
            <PropRow label="優先度">
              <div className="flex gap-1.5 flex-wrap">
                {PRIORITIES.map(p => (
                  <button
                    key={p.value}
                    onClick={() => save({ priority: p.value })}
                    className={cn(
                      "text-xs px-2.5 py-1 rounded-lg border font-medium transition-all duration-150",
                      task.priority === p.value
                        ? cn(p.bg, p.color)
                        : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--muted-2)] hover:text-[var(--foreground-2)]"
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </PropRow>

            {/* Status */}
            <PropRow label="ステータス">
              <div className="flex gap-1.5 flex-wrap">
                {STATUSES.map(s => (
                  <button
                    key={s.value}
                    onClick={() => save({ status: s.value })}
                    className={cn(
                      "text-xs px-2.5 py-1 rounded-lg border font-medium transition-all duration-150",
                      task.status === s.value
                        ? s.color
                        : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--muted-2)] hover:text-[var(--foreground-2)]"
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </PropRow>
          </div>

          {/* Properties group: Dates */}
          <div className="rounded-xl bg-[var(--surface)] border border-[var(--border)] divide-y divide-[var(--border)] overflow-hidden">
            <PropRow label="締め切り">
              <DatePicker
                value={task.dueDate ? new Date(task.dueDate) : null}
                onChange={d => save({ dueDate: d })}
                placeholder="設定なし"
              />
            </PropRow>
            <PropRow label="実行日">
              <DatePicker
                value={task.scheduledDate ? new Date(task.scheduledDate) : null}
                onChange={d => save({ scheduledDate: d })}
                placeholder="設定なし"
              />
            </PropRow>
            <PropRow label="繰り返し">
              <RecurrenceSelector value={task.recurrence ?? null} onChange={r => save({ recurrence: r })} />
            </PropRow>
          </div>

          {/* Properties group: Tags */}
          <div className="rounded-xl bg-[var(--surface)] border border-[var(--border)] overflow-hidden">
            <PropRow label="タグ">
              <div className="flex flex-wrap gap-1">
                {task.tags.map(tag => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="gap-1 cursor-pointer text-[11px] h-5"
                    onClick={() => removeTag(tag)}
                  >
                    #{tag} <X className="w-2.5 h-2.5" />
                  </Badge>
                ))}
                <input
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); addTag(tagInput); }
                  }}
                  placeholder="#タグを追加"
                  className="text-xs bg-transparent outline-none placeholder:text-[var(--muted)] min-w-[80px] py-0.5"
                />
              </div>
            </PropRow>
          </div>

          {/* Subtasks */}
          <div className="rounded-xl bg-[var(--surface)] border border-[var(--border)] px-4 py-3">
            <SubtaskList task={task} />
          </div>

          {/* Editor */}
          <div className="rounded-xl bg-[var(--surface)] border border-[var(--border)] px-4 py-3 min-h-[120px]">
            <TiptapEditor
              content={task.body}
              onChange={handleBodyChange}
              placeholder="メモを入力... / でコマンド"
            />
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center pt-2 pb-4">
            <span className="text-[11px] text-[var(--muted)]">
              作成: {format(new Date(task.createdAt), "yyyy/M/d")}
            </span>
            <Button
              variant="ghost" size="sm"
              onClick={handleDelete}
              className="text-[11px] text-red-400 hover:text-red-500 hover:bg-red-500/10 gap-1 h-7"
            >
              <Trash2 className="w-3 h-3" />
              削除
            </Button>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
