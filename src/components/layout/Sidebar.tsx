"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Inbox, CalendarDays, Calendar, Search,
  Folder, Globe, BookOpen, Archive, Settings, Tag,
  ChevronRight, ChevronDown, Sun, Moon, Monitor,
} from "lucide-react";
import type { ThemeMode } from "@/store/uiStore";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/uiStore";
import { useProjectsByCategory } from "@/hooks/useProjects";
import { useTags } from "@/hooks/useTags";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/ScrollArea";

const smartLists = [
  { href: "/inbox",    icon: Inbox,       label: "インボックス" },
  { href: "/today",    icon: CalendarDays, label: "今日" },
  { href: "/upcoming", icon: Calendar,    label: "近日" },
];

function NavItem({ href, icon: Icon, label, active, indent = false }: {
  href: string; icon: React.ElementType; label: string; active?: boolean; indent?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-2.5 px-3 py-[7px] rounded-lg text-sm transition-all duration-150 relative",
        indent && "pl-6",
        active
          ? "bg-[var(--sidebar-active-bg)] text-[var(--sidebar-active-text)] font-medium"
          : "text-[var(--foreground-2)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--foreground)] hover:translate-x-0.5"
      )}
    >
      {active && (
        <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-[var(--sidebar-active-border)]" />
      )}
      <Icon className="w-[15px] h-[15px] flex-shrink-0" />
      <span className="truncate">{label}</span>
    </Link>
  );
}

const THEME_CYCLE: ThemeMode[] = ["light", "system", "dark"];
const THEME_ICONS: Record<ThemeMode, React.ElementType> = { light: Sun, system: Monitor, dark: Moon };
const THEME_LABELS: Record<ThemeMode, string> = { light: "ライト", system: "自動", dark: "ダーク" };

function SidebarThemeToggle() {
  const { theme, setTheme } = useUIStore();
  const next = () => {
    const idx = THEME_CYCLE.indexOf(theme);
    setTheme(THEME_CYCLE[(idx + 1) % THEME_CYCLE.length]);
  };
  const Icon = THEME_ICONS[theme];
  return (
    <button
      onClick={next}
      className="flex w-full items-center gap-2.5 px-3 py-[7px] rounded-lg text-sm transition-all duration-150 text-[var(--foreground-2)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--foreground)]"
      title={`外観: ${THEME_LABELS[theme]}`}
    >
      <Icon className="w-[15px] h-[15px] flex-shrink-0" />
      <span>外観</span>
      <span className="ml-auto text-xs text-[var(--muted)] font-medium">{THEME_LABELS[theme]}</span>
    </button>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 px-3 pt-4 pb-1">
      <span className="text-[10px] font-semibold tracking-wider text-[var(--muted-2)] uppercase">{label}</span>
      <div className="flex-1 h-px bg-[var(--border-2)]" />
    </div>
  );
}

function CollapseButton({ label, icon: Icon, open, onToggle }: {
  label: string; icon: React.ElementType; open: boolean; onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="group flex w-full items-center gap-2.5 px-3 py-[7px] rounded-lg text-sm transition-all duration-150 text-[var(--muted)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--foreground)]"
    >
      <Icon className="w-[15px] h-[15px] flex-shrink-0" />
      <span className="flex-1 text-left">{label}</span>
      {open
        ? <ChevronDown className="w-3 h-3 transition-transform" />
        : <ChevronRight className="w-3 h-3 transition-transform" />}
    </button>
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
  const [showTags, setShowTags] = useState(false);

  return (
    <div className="w-64 flex-shrink-0 bg-[var(--sidebar-bg)] border-r border-[var(--border)] flex flex-col h-full">
      {/* Brand header */}
      <div className="px-4 py-4 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm flex-shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 16 16">
              <path d="M3 4h10M3 8h7M3 12h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="font-bold text-[15px] tracking-tight">TaskMap</span>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="px-2 space-y-0.5">
          {/* Smart lists */}
          {smartLists.map(({ href, icon, label }) => (
            <NavItem key={href} href={href} icon={icon} label={label} active={pathname === href} />
          ))}

          {/* Search */}
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="group flex w-full items-center gap-2.5 px-3 py-[7px] rounded-lg text-sm transition-all duration-150 text-[var(--foreground-2)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--foreground)] hover:translate-x-0.5"
          >
            <Search className="w-[15px] h-[15px] flex-shrink-0" />
            <span>検索</span>
            <kbd className="ml-auto text-[10px] text-[var(--muted-2)] bg-[var(--border-2)] border border-[var(--border)] rounded-md px-1.5 py-0.5 font-mono">⌘K</kbd>
          </button>
        </div>

        {/* PARA section */}
        <div className="px-2">
          <SectionLabel label="ライブラリ" />
          <div className="space-y-0.5">
            <CollapseButton label="プロジェクト" icon={Folder} open={showProjects} onToggle={() => setShowProjects(v => !v)} />
            {showProjects && (
              <div className="space-y-0.5 pb-1">
                {projects.map(p => (
                  <NavItem
                    key={p.id}
                    href={`/project/${p.id}`}
                    icon={() => <span className="text-[15px] leading-none">{p.icon}</span>}
                    label={p.name}
                    active={pathname === `/project/${p.id}`}
                    indent
                  />
                ))}
              </div>
            )}

            <CollapseButton label="エリア" icon={Globe} open={showAreas} onToggle={() => setShowAreas(v => !v)} />
            {showAreas && (
              <div className="space-y-0.5 pb-1">
                {areas.map(a => (
                  <NavItem
                    key={a.id}
                    href={`/area/${a.id}`}
                    icon={() => <span className="text-[15px] leading-none">{a.icon}</span>}
                    label={a.name}
                    active={pathname === `/area/${a.id}`}
                    indent
                  />
                ))}
              </div>
            )}

            <NavItem href="/resources" icon={BookOpen} label="リソース" active={pathname === "/resources"} />
            <NavItem href="/archives" icon={Archive}  label="アーカイブ" active={pathname === "/archives"} />
          </div>
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="px-2">
            <SectionLabel label="タグ" />
            <div className="space-y-0.5">
              <CollapseButton label="すべてのタグ" icon={Tag} open={showTags} onToggle={() => setShowTags(v => !v)} />
              {showTags && (
                <div className="space-y-0.5 pb-1">
                  {tags.map(tag => (
                    <button
                      key={tag.id}
                      className="flex w-full items-center gap-2.5 px-3 pl-6 py-[7px] rounded-lg text-sm text-[var(--foreground-2)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--foreground)] transition-all duration-150 hover:translate-x-0.5"
                    >
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: tag.color }} />
                      <span className="truncate">#{tag.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="h-4" />
      </ScrollArea>

      {/* Footer */}
      <div className="px-2 py-2 border-t border-[var(--border)] flex-shrink-0 space-y-0.5">
        <NavItem href="/settings" icon={Settings} label="設定" active={pathname === "/settings"} />
        <SidebarThemeToggle />
      </div>
    </div>
  );
}
