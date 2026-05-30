"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Inbox,
  CalendarDays,
  Calendar,
  Search,
  Folder,
  Globe,
  BookOpen,
  Archive,
  Settings,
  Tag,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/uiStore";
import { useProjectsByCategory } from "@/hooks/useProjects";
import { useTags } from "@/hooks/useTags";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/ScrollArea";

const smartLists = [
  { href: "/inbox", icon: Inbox, label: "インボックス" },
  { href: "/today", icon: CalendarDays, label: "今日" },
  { href: "/upcoming", icon: Calendar, label: "近日" },
];

function NavItem({
  href,
  icon: Icon,
  label,
  active,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors",
        active
          ? "bg-[var(--sidebar-active)] text-[var(--sidebar-active-text)] font-medium"
          : "text-[var(--foreground)] hover:bg-[var(--sidebar-hover)]"
      )}
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      {label}
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { setCommandPaletteOpen } = useUIStore();
  const projects = useProjectsByCategory("projects");
  const areas = useProjectsByCategory("areas");
  const tags = useTags();
  const [showProjects, setShowProjects] = useState(true);
  const [showAreas, setShowAreas] = useState(true);
  const [showTags, setShowTags] = useState(true);

  return (
    <div className="w-64 flex-shrink-0 bg-[var(--sidebar-bg)] border-r border-[var(--border)] flex flex-col h-full">
      <div className="p-3 border-b border-[var(--border)] flex-shrink-0">
        <div className="flex items-center gap-2 px-2 py-1.5">
          <div className="w-6 h-6 rounded-md bg-blue-500 flex items-center justify-center">
            <span className="text-white text-xs font-bold">T</span>
          </div>
          <span className="font-semibold text-sm">TaskMap</span>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-0.5">
          {/* Smart lists */}
          {smartLists.map(({ href, icon, label }) => (
            <NavItem key={href} href={href} icon={icon} label={label} active={pathname === href} />
          ))}

          {/* Search */}
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="flex w-full items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-[var(--sidebar-hover)]"
          >
            <Search className="w-4 h-4 flex-shrink-0" />
            検索
            <kbd className="ml-auto text-xs text-[var(--muted)] border border-[var(--border)] rounded px-1">⌘K</kbd>
          </button>
        </div>

        {/* PARA */}
        <div className="px-2 pt-3 space-y-0.5">
          <p className="px-3 py-1 text-xs font-medium text-[var(--muted)] uppercase tracking-wider">PARA</p>

          {/* Projects */}
          <button
            onClick={() => setShowProjects((v) => !v)}
            className="flex w-full items-center gap-2 px-3 py-1.5 rounded text-xs text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
          >
            {showProjects ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            <Folder className="w-3.5 h-3.5" />
            プロジェクト
          </button>
          {showProjects && (
            <div className="pl-2 space-y-0.5">
              {projects.map((p) => (
                <NavItem
                  key={p.id}
                  href={`/project/${p.id}`}
                  icon={() => <span className="text-base leading-none">{p.icon}</span>}
                  label={p.name}
                  active={pathname === `/project/${p.id}`}
                />
              ))}
            </div>
          )}

          {/* Areas */}
          <button
            onClick={() => setShowAreas((v) => !v)}
            className="flex w-full items-center gap-2 px-3 py-1.5 rounded text-xs text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
          >
            {showAreas ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            <Globe className="w-3.5 h-3.5" />
            エリア
          </button>
          {showAreas && (
            <div className="pl-2 space-y-0.5">
              {areas.map((a) => (
                <NavItem
                  key={a.id}
                  href={`/area/${a.id}`}
                  icon={() => <span className="text-base leading-none">{a.icon}</span>}
                  label={a.name}
                  active={pathname === `/area/${a.id}`}
                />
              ))}
            </div>
          )}

          <NavItem href="/resources" icon={BookOpen} label="リソース" active={pathname === "/resources"} />
          <NavItem href="/archives" icon={Archive} label="アーカイブ" active={pathname === "/archives"} />
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="px-2 pt-3 space-y-0.5">
            <button
              onClick={() => setShowTags((v) => !v)}
              className="flex w-full items-center gap-2 px-3 py-1.5 rounded text-xs text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
            >
              {showTags ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              <Tag className="w-3.5 h-3.5" />
              タグ
            </button>
            {showTags && (
              <div className="pl-4 space-y-0.5">
                {tags.map((tag) => (
                  <div key={tag.id} className="flex items-center gap-2 px-3 py-1.5 text-sm rounded hover:bg-[var(--sidebar-hover)] cursor-pointer">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: tag.color }}
                    />
                    #{tag.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Settings */}
      <div className="p-2 border-t border-[var(--border)] flex-shrink-0">
        <NavItem href="/settings" icon={Settings} label="設定" active={pathname === "/settings"} />
      </div>
    </div>
  );
}
