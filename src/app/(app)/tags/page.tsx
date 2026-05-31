"use client";

import { useState } from "react";
import { useTags, updateTag, deleteTag } from "@/hooks/useTags";
import { useAllTasks } from "@/hooks/useTasks";
import { Tag, Pencil, Trash2, Check, X } from "lucide-react";
import Link from "next/link";

const PRESET_COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#ef4444",
  "#f97316", "#eab308", "#22c55e", "#14b8a6",
  "#3b82f6", "#64748b",
];

export default function TagsPage() {
  const tags = useTags();
  const allTasks = useAllTasks();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const taskCountByTag = (tagName: string) =>
    (allTasks ?? []).filter(t => t.tags.includes(tagName)).length;

  const startEdit = (tag: import("@/types").Tag) => {
    setEditingId(tag.id);
    setEditName(tag.name);
    setEditColor(tag.color);
  };

  const saveEdit = async (tag: import("@/types").Tag) => {
    if (editName.trim() && (editName !== tag.name || editColor !== tag.color)) {
      await updateTag(tag.id, { name: editName.trim(), color: editColor });
    }
    setEditingId(null);
  };

  const handleDelete = async (tag: import("@/types").Tag) => {
    if (deleteConfirmId !== tag.id) { setDeleteConfirmId(tag.id); return; }
    await deleteTag(tag.id, tag.name);
    setDeleteConfirmId(null);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 py-4 border-b border-[var(--border)] flex-shrink-0">
        <h1 className="text-lg font-bold tracking-tight">🏷 タグ管理</h1>
        <p className="text-xs text-[var(--muted)] mt-0.5">{tags.length}個のタグ</p>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {tags.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-[var(--muted)]">
            <Tag className="w-8 h-8 mb-2 opacity-30" />
            <p className="text-sm">タグがありません</p>
            <p className="text-xs mt-1">タスクにタグを追加すると、ここに表示されます</p>
          </div>
        ) : (
          <div className="space-y-1">
            {tags.map(tag => (
              <div key={tag.id} className="group flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[var(--sidebar-hover)] transition-colors">
                {editingId === tag.id ? (
                  <>
                    <div className="flex gap-1">
                      {PRESET_COLORS.map(c => (
                        <button
                          key={c}
                          onClick={() => setEditColor(c)}
                          className={`w-5 h-5 rounded-full transition-all ${editColor === c ? "ring-2 ring-offset-1 ring-[var(--primary)]" : ""}`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                    <input
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      className="flex-1 text-sm bg-[var(--border-2)] border border-[var(--border)] rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50"
                      onKeyDown={e => { if (e.key === "Enter") saveEdit(tag); if (e.key === "Escape") setEditingId(null); }}
                      autoFocus
                    />
                    <button onClick={() => saveEdit(tag)} className="text-green-500 hover:text-green-600">
                      <Check className="w-4 h-4" />
                    </button>
                    <button onClick={() => setEditingId(null)} className="text-[var(--muted)] hover:text-[var(--foreground)]">
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href={`/tags/${encodeURIComponent(tag.name)}`}
                      className="flex items-center gap-2.5 flex-1 min-w-0"
                    >
                      <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: tag.color }} />
                      <span className="text-sm font-medium">#{tag.name}</span>
                      <span className="ml-auto text-xs text-[var(--muted)] bg-[var(--border-2)] px-2 py-0.5 rounded-full">
                        {taskCountByTag(tag.name)}件
                      </span>
                    </Link>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => startEdit(tag)} className="p-1 rounded-md hover:bg-[var(--border-2)] text-[var(--muted)] hover:text-[var(--foreground)]">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(tag)}
                        onBlur={() => setDeleteConfirmId(null)}
                        className={`p-1 rounded-md transition-colors ${deleteConfirmId === tag.id ? "bg-red-500 text-white" : "hover:bg-[var(--border-2)] text-[var(--muted)] hover:text-red-500"}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
