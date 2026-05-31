"use client";

import { useState } from "react";
import { useArchivedTasks, restoreTask, deleteAllArchived } from "@/hooks/useTasks";
import { useProjectsByCategory, restoreProject, deleteProject } from "@/hooks/useProjects";
import { Archive, RotateCcw, Trash2, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

export default function ArchivesPage() {
  const archivedTasks = useArchivedTasks();
  const archivedProjects = useProjectsByCategory("archives");
  const [clearConfirm, setClearConfirm] = useState(false);

  const handleClearAll = async () => {
    if (!clearConfirm) { setClearConfirm(true); return; }
    await deleteAllArchived();
    for (const p of archivedProjects) await deleteProject(p.id);
    setClearConfirm(false);
  };

  const totalCount = archivedTasks.length + archivedProjects.length;

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 py-4 border-b border-[var(--border)] flex-shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold tracking-tight">🗄 アーカイブ</h1>
          <p className="text-xs text-[var(--muted)] mt-0.5">{totalCount}件</p>
        </div>
        {totalCount > 0 && (
          <Button
            variant={clearConfirm ? "destructive" : "outline"}
            size="sm"
            onClick={handleClearAll}
            onBlur={() => setClearConfirm(false)}
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            {clearConfirm ? "本当に削除" : "ゴミ箱を空にする"}
          </Button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {totalCount === 0 && (
          <div className="flex flex-col items-center justify-center h-40 text-[var(--muted)]">
            <Archive className="w-8 h-8 mb-2 opacity-30" />
            <p className="text-sm">アーカイブがありません</p>
          </div>
        )}

        {archivedProjects.length > 0 && (
          <div>
            <h2 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <FolderOpen className="w-3.5 h-3.5" />プロジェクト（{archivedProjects.length}）
            </h2>
            <div className="space-y-1">
              {archivedProjects.map(p => (
                <div key={p.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] group">
                  <span className="text-xl">{p.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    {p.description && <p className="text-xs text-[var(--muted)] truncate">{p.description}</p>}
                  </div>
                  <button
                    onClick={() => restoreProject(p.id)}
                    title="再開する"
                    className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-xs text-[var(--primary)] hover:underline px-2 py-1 rounded-md hover:bg-[var(--primary)]/10 transition-all"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />再開
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {archivedTasks.length > 0 && (
          <div>
            <h2 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Archive className="w-3.5 h-3.5" />タスク（{archivedTasks.length}）
            </h2>
            <div className="space-y-1">
              {archivedTasks.map(t => (
                <div key={t.id} className="flex items-start gap-3 px-3 py-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] group">
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p className="text-sm font-medium line-through text-[var(--muted)] truncate">{t.title}</p>
                    <p className="text-xs text-[var(--muted-2)] mt-0.5">
                      {format(new Date(t.updatedAt), "M月d日（E）", { locale: ja })}
                    </p>
                  </div>
                  <button
                    onClick={() => restoreTask(t.id)}
                    title="インボックスに戻す"
                    className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-xs text-[var(--primary)] hover:underline px-2 py-1 rounded-md hover:bg-[var(--primary)]/10 transition-all mt-0.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />戻す
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
