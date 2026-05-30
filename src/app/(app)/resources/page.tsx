"use client";

import { useProjectsByCategory } from "@/hooks/useProjects";
import { BookOpen } from "lucide-react";
import Link from "next/link";

export default function ResourcesPage() {
  const resources = useProjectsByCategory("resources");

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-[var(--border)]">
        <h1 className="text-base font-semibold">📚 リソース</h1>
        <p className="text-xs text-[var(--muted)] mt-0.5">{resources.length}件</p>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {resources.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-[var(--muted)]">
            <BookOpen className="w-8 h-8 mb-2 opacity-30" />
            <p className="text-sm">リソースがありません</p>
          </div>
        ) : (
          <div className="space-y-1">
            {resources.map((r) => (
              <Link
                key={r.id}
                href={`/project/${r.id}`}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[var(--sidebar-hover)] transition-colors"
              >
                <span className="text-xl">{r.icon}</span>
                <span className="text-sm">{r.name}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
