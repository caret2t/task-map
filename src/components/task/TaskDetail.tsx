"use client";

import { useEffect, useState, useCallback } from "react";
import { format } from "date-fns";
import { Trash2, X } from "lucide-react";
import type { Task } from "@/types";
import { updateTask, deleteTask } from "@/hooks/useTasks";
import { useTaskStore } from "@/store/taskStore";
import { TiptapEditor } from "@/components/editor/TiptapEditor";
import { DatePicker } from "./DatePicker";
import { PriorityBadge } from "./PriorityBadge";
import { SubtaskList } from "./SubtaskList";
import { RecurrenceSelector } from "./RecurrenceSelector";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { useUIStore } from "@/store/uiStore";
import { Focus } from "lucide-react";

interface TaskDetailProps {
  task: Task;
}

export function TaskDetail({ task }: TaskDetailProps) {
  const { setSelectedTask } = useTaskStore();
  const { enterFocusMode } = useUIStore();
  const [title, setTitle] = useState(task.title);
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    setTitle(task.title);
  }, [task.id, task.title]);

  const save = useCallback(
    (changes: Partial<Task>) => updateTask(task.id, changes),
    [task.id]
  );

  const handleTitleBlur = () => {
    if (title.trim() && title !== task.title) {
      save({ title: title.trim() });
    }
  };

  const handleBodyChange = useCallback(
    (html: string) => {
      if (html !== task.body) save({ body: html });
    },
    [task.body, save]
  );

  const addTag = (tag: string) => {
    const trimmed = tag.trim().replace(/^#/, "");
    if (trimmed && !task.tags.includes(trimmed)) {
      save({ tags: [...task.tags, trimmed] });
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    save({ tags: task.tags.filter((t) => t !== tag) });
  };

  const handleDelete = async () => {
    await deleteTask(task.id);
    setSelectedTask(null);
  };

  const priorities: Array<{ value: 0 | 1 | 2 | 3; label: string }> = [
    { value: 3, label: "緊急" },
    { value: 2, label: "高" },
    { value: 1, label: "中" },
    { value: 0, label: "なし" },
  ];

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <textarea
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            className="flex-1 text-base font-semibold bg-transparent resize-none outline-none leading-snug"
            rows={2}
          />
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button variant="ghost" size="icon" onClick={() => enterFocusMode(task.id)} title="フォーカスモード">
              <Focus className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setSelectedTask(null)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Properties */}
        <div className="space-y-2 text-sm">
          {/* Priority */}
          <div className="flex items-center gap-2">
            <span className="text-[var(--muted)] w-20 flex-shrink-0">優先度</span>
            <div className="flex gap-1">
              {priorities.map((p) => (
                <button
                  key={p.value}
                  onClick={() => save({ priority: p.value })}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs border transition-colors ${
                    task.priority === p.value
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                      : "border-[var(--border)] hover:border-blue-300"
                  }`}
                >
                  <PriorityBadge priority={p.value} />
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Due date */}
          <div className="flex items-center gap-2">
            <span className="text-[var(--muted)] w-20 flex-shrink-0">締め切り</span>
            <DatePicker
              value={task.dueDate ? new Date(task.dueDate) : null}
              onChange={(d) => save({ dueDate: d })}
              placeholder="設定なし"
            />
          </div>

          {/* Scheduled date */}
          <div className="flex items-center gap-2">
            <span className="text-[var(--muted)] w-20 flex-shrink-0">実行日</span>
            <DatePicker
              value={task.scheduledDate ? new Date(task.scheduledDate) : null}
              onChange={(d) => save({ scheduledDate: d })}
              placeholder="設定なし"
            />
          </div>

          {/* Status */}
          <div className="flex items-center gap-2">
            <span className="text-[var(--muted)] w-20 flex-shrink-0">ステータス</span>
            <select
              value={task.status}
              onChange={(e) => save({ status: e.target.value as Task["status"] })}
              className="text-xs bg-transparent border border-[var(--border)] rounded px-2 py-1 outline-none"
            >
              <option value="inbox">インボックス</option>
              <option value="todo">Todo</option>
              <option value="in_progress">進行中</option>
              <option value="done">完了</option>
              <option value="archived">アーカイブ</option>
            </select>
          </div>

          {/* Tags */}
          <div className="flex items-start gap-2">
            <span className="text-[var(--muted)] w-20 flex-shrink-0 mt-1">タグ</span>
            <div className="flex flex-wrap gap-1 flex-1">
              {task.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1 cursor-pointer" onClick={() => removeTag(tag)}>
                  #{tag} <X className="w-2.5 h-2.5" />
                </Badge>
              ))}
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    addTag(tagInput);
                  }
                }}
                placeholder="#タグを追加"
                className="text-xs bg-transparent outline-none placeholder:text-[var(--muted)] min-w-20"
              />
            </div>
          </div>
          {/* Recurrence — Phase 2 */}
          <div className="flex items-center gap-2">
            <span className="text-[var(--muted)] w-20 flex-shrink-0">繰り返し</span>
            <RecurrenceSelector
              value={task.recurrence ?? null}
              onChange={(r) => save({ recurrence: r })}
            />
          </div>
        </div>

        {/* Subtasks */}
        <div className="border-t border-[var(--border)] pt-3">
          <SubtaskList task={task} />
        </div>

        {/* Divider */}
        <div className="border-t border-[var(--border)]" />

        {/* Editor */}
        <TiptapEditor
          content={task.body}
          onChange={handleBodyChange}
          placeholder="メモを入力... / でコマンド"
        />

        {/* Footer */}
        <div className="flex justify-between items-center pt-2 border-t border-[var(--border)]">
          <span className="text-xs text-[var(--muted)]">
            作成: {format(new Date(task.createdAt), "yyyy/M/d")}
          </span>
          <Button variant="ghost" size="sm" onClick={handleDelete} className="text-red-500 hover:text-red-600 hover:bg-red-50">
            <Trash2 className="w-3.5 h-3.5 mr-1" />
            削除
          </Button>
        </div>
      </div>
    </ScrollArea>
  );
}
