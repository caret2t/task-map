"use client";

import { useState, useEffect } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createProject, updateProject } from "@/hooks/useProjects";
import type { Project } from "@/types";

const PRESET_COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#ef4444",
  "#f97316", "#eab308", "#22c55e", "#14b8a6",
  "#3b82f6", "#64748b",
];

const PRESET_ICONS = ["📁", "🗂", "⭐", "🚀", "💡", "🎯", "📝", "🔧", "💼", "🏠", "🌐", "📚"];

interface ProjectDialogProps {
  open: boolean;
  onClose: () => void;
  project?: Project | null;
  defaultCategory?: Project["paraCategory"];
}

export function ProjectDialog({ open, onClose, project, defaultCategory = "projects" }: ProjectDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("📁");
  const [color, setColor] = useState("#6366f1");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description);
      setIcon(project.icon);
      setColor(project.color);
    } else {
      setName("");
      setDescription("");
      setIcon("📁");
      setColor("#6366f1");
    }
  }, [project, open]);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      if (project) {
        await updateProject(project.id, { name: name.trim(), description, icon, color });
      } else {
        await createProject({ name: name.trim(), description, icon, color, paraCategory: defaultCategory });
      }
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{project ? "プロジェクトを編集" : "プロジェクトを作成"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">アイコン</label>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_ICONS.map(ic => (
                <button
                  key={ic}
                  onClick={() => setIcon(ic)}
                  className={`w-9 h-9 rounded-lg text-xl flex items-center justify-center transition-all ${
                    icon === ic ? "ring-2 ring-[var(--primary)] bg-[var(--primary)]/10" : "hover:bg-[var(--sidebar-hover)]"
                  }`}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">カラー</label>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-all ${color === c ? "ring-2 ring-offset-2 ring-[var(--primary)]" : ""}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">名前 *</label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="プロジェクト名"
              autoFocus
              onKeyDown={e => e.key === "Enter" && handleSave()}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-[var(--muted)] block mb-1.5">説明</label>
            <Input
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="説明（任意）"
            />
          </div>

          <div className="flex gap-2 justify-end pt-1">
            <Button variant="ghost" onClick={onClose} disabled={saving}>キャンセル</Button>
            <Button onClick={handleSave} disabled={saving || !name.trim()}>
              {saving ? "保存中..." : project ? "保存" : "作成"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
