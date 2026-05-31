"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Inbox, CalendarDays, Calendar, Search,
  Folder, Globe, BookOpen, Archive, Settings, Tag,
  ChevronDown, ChevronRight, Sun, Moon, Monitor,
  Plus, MoreHorizontal, Pencil, Trash2, ArchiveIcon,
} from "lucide-react";
import type { ThemeMode } from "@/store/uiStore";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/uiStore";
import { useProjectsByCategory, deleteProject, archiveProject } from "@/hooks/useProjects";
import { useTags } from "@/hooks/useTags";
import { useState, useRef } from "react";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { ProjectDialog } from "@/components/project/ProjectDialog";
import type { Project } from "@/types";

const smartLists = [
  { href: "/inbox",    icon: Inbox,       label: "インボックス" },
  { href: "/today",    icon: CalendarDays, label: "今日" },
  { href: "/upcoming", icon: Calendar,    label: "近日" },
];

// 共通NavItemスタイル（スマートリストもPARAも全て同じ）
const NAV_BASE = "flex items-center gap-2.5 px-3 py-[7px] rounded-lg text-sm transition-all duration-150 relative";
const NAV_ACTIVE = "bg-[var(--sidebar-active-bg)] text-[var(--sidebar-active-text)] font-medium";
const NAV_INACTIVE = "text-[var(--foreground-2)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--foreground)] hover:translate-x-0.5";

function ActiveBar() {
  return <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-[var(--sidebar-active-border)]" />;
}

// 通常ナビアイテム（スマートリスト・タグなど）
function NavItem({ href, icon: Icon, label, active, indent = false }: {
  href: string; icon: React.ElementType; label: string; active?: boolean; indent?: boolean;
}) {
  return (
    <Link href={href} className={cn(NAV_BASE, active ? NAV_ACTIVE : NAV_INACTIVE, indent && "pl-7")}>
      {active && <ActiveBar />}
      <Icon className="w-[15px] h-[15px] flex-shrink-0" />
      <span className="truncate">{label}</span>
    </Link>
  );
}

// PARAセクション（プロジェクト/エリア）：NavItemと同スタイル＋chevron＋「+」ボタン
function ParaSection({ label, icon: Icon, open, onToggle, onAdd, children }: {
  label: string; icon: React.ElementType; open: boolean;
  onToggle: () => void; onAdd?: () => void; children?: React.ReactNode;
}) {
  return (
    <div>
      <div className="group/section flex items-center">
        <button
          onClick={onToggle}
          className={cn(NAV_BASE, NAV_INACTIVE, "flex-1")}
        >
          <Icon className="w-[15px] h-[15px] flex-shrink-0" />
          <span className="flex-1 text-left">{label}</span>
          {open
            ? <ChevronDown className="w-3 h-3 flex-shrink-0" />
            : <ChevronRight className="w-3 h-3 flex-shrink-0" />}
        </button>
        {onAdd && (
          <button
            onClick={onAdd}
            className="opacity-0 group-hover/section:opacity-100 p-1 mr-1 rounded-md hover:bg-[var(--sidebar-hover)] text-[var(--muted)] hover:text-[var(--foreground)] transition-all"
            title="追加"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      {open && <div className="space-y-0.5 pb-0.5">{children}</div>}
    </div>
  );
}

// PARAリンク（リソース/アーカイブ）：NavItemと完全同スタイル・chevronなし
function ParaLink({ href, icon: Icon, label, active }: {
  href: string; icon: React.ElementType; label: string; active: boolean;
}) {
  return (
    <Link href={href} className={cn(NAV_BASE, active ? NAV_ACTIVE : NAV_INACTIVE)}>
      {active && <ActiveBar />}
      <Icon className="w-[15px] h-[15px] flex-shrink-0" />
      <span className="truncate">{label}</span>
    </Link>
  );
}

// プロジェクト/エリアのサブアイテム
function ProjectSubItem({ project, active, onEdit, onDelete, onArchive }: {
  project: Project; active: boolean;
  onEdit: () => void; onDelete: () => void; onArchive: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  return (
    <div className="group/item relative">
      <Link
        href={`/project/${project.id}`}
        className={cn(
          "flex items-center gap-2 pl-8 pr-3 py-[6px] rounded-lg text-[13px] transition-all duration-150 relative",
          active
            ? "bg-[var(--sidebar-active-bg)] text-[var(--sidebar-active-text)] font-medium"
            : "text-[var(--foreground-2)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--foreground)] hover:translate-x-0.5"
        )}
      >
        {active && <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full bg-[var(--sidebar-active-border)]" />}
        <span className="text-[13px] leading-none flex-shrink-0">{project.icon}</span>
        <span className="truncate flex-1">{project.name}</span>
      </Link>
      <button
        onClick={e => { e.preventDefault(); setMenuOpen(v => !v); }}
        className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover/item:opacity-100 p-1 rounded-md hover:bg-[var(--border-2)] text-[var(--muted)] hover:text-[var(--foreground)] transition-all"
      >
        <MoreHorizontal className="w-3.5 h-3.5" />
      </button>
      {menuOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
          <div ref={menuRef} className="absolute right-0 top-full mt-0.5 z-50 w-36 bg-[var(--background)] border border-[var(--border)] rounded-lg shadow-lg py-1 text-sm">
            <button onClick={() => { setMenuOpen(false); onEdit(); }} className="flex w-full items-center gap-2 px-3 py-1.5 hover:bg-[var(--sidebar-hover)] text-[var(--foreground)]">
              <Pencil className="w-3.5 h-3.5" /> 編集
            </button>
            <button onClick={() => { setMenuOpen(false); onArchive(); }} className="flex w-full items-center gap-2 px-3 py-1.5 hover:bg-[var(--sidebar-hover)] text-[var(--foreground)]">
              <ArchiveIcon className="w-3.5 h-3.5" /> アーカイブ
            </button>
            <div className="my-1 h-px bg-[var(--border)]" />
            <button onClick={() => { setMenuOpen(false); onDelete(); }} className="flex w-full items-center gap-2 px-3 py-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500">
              <Trash2 className="w-3.5 h-3.5" /> 削除
            </button>
          </div>
        </>
      )}
    </div>
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
      className={cn(NAV_BASE, NAV_INACTIVE)}
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

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { setCommandPaletteOpen } = useUIStore();
  const projects = useProjectsByCategory("projects");
  const areas = useProjectsByCategory("areas");
  const tags = useTags();
  const [showProjects, setShowProjects] = useState(true);
  const [showAreas, setShowAreas] = useState(true);
  const [showTags, setShowTags] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [defaultCategory, setDefaultCategory] = useState<Project["paraCategory"]>("projects");

  const openCreate = (cat: Project["paraCategory"]) => {
    setEditingProject(null);
    setDefaultCategory(cat);
    setDialogOpen(true);
  };

  const openEdit = (p: Project) => {
    setEditingProject(p);
    setDialogOpen(true);
  };

  const handleDelete = async (p: Project) => {
    if (!confirm(`「${p.name}」を削除しますか？\n含まれるタスクはインボックスに移動されます。`)) return;
    await deleteProject(p.id);
    if (pathname === `/project/${p.id}`) router.push("/inbox");
  };

  const handleArchive = async (p: Project) => {
    await archiveProject(p.id);
    if (pathname === `/project/${p.id}`) router.push("/archives");
  };

  return (
    <div className="w-64 flex-shrink-0 bg-[var(--sidebar-bg)] border-r border-[var(--border)] flex flex-col h-full">
      {/* Brand */}
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
        {/* スマートリスト */}
        <div className="px-2 space-y-0.5">
          {smartLists.map(({ href, icon, label }) => (
            <NavItem key={href} href={href} icon={icon} label={label} active={pathname === href} />
          ))}
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className={cn(NAV_BASE, NAV_INACTIVE, "w-full")}
          >
            <Search className="w-[15px] h-[15px] flex-shrink-0" />
            <span>検索</span>
            <kbd className="ml-auto text-[10px] text-[var(--muted-2)] bg-[var(--border-2)] border border-[var(--border)] rounded-md px-1.5 py-0.5 font-mono">⌘K</kbd>
          </button>
        </div>

        {/* PARAライブラリ：全4項目を同一スタイルで統一 */}
        <div className="px-2">
          <SectionLabel label="ライブラリ" />
          <div className="space-y-0.5">
            {/* プロジェクト */}
            <ParaSection
              label="プロジェクト" icon={Folder}
              open={showProjects} onToggle={() => setShowProjects(v => !v)}
              onAdd={() => openCreate("projects")}
            >
              {projects.map(p => (
                <ProjectSubItem
                  key={p.id} project={p}
                  active={pathname === `/project/${p.id}`}
                  onEdit={() => openEdit(p)}
                  onDelete={() => handleDelete(p)}
                  onArchive={() => handleArchive(p)}
                />
              ))}
              {projects.length === 0 && (
                <button
                  onClick={() => openCreate("projects")}
                  className="flex w-full items-center gap-1.5 pl-8 pr-3 py-1.5 text-xs text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                >
                  <Plus className="w-3 h-3" />新規プロジェクト
                </button>
              )}
            </ParaSection>

            {/* エリア */}
            <ParaSection
              label="エリア" icon={Globe}
              open={showAreas} onToggle={() => setShowAreas(v => !v)}
              onAdd={() => openCreate("areas")}
            >
              {areas.map(a => (
                <ProjectSubItem
                  key={a.id} project={a}
                  active={pathname === `/area/${a.id}`}
                  onEdit={() => openEdit(a)}
                  onDelete={() => handleDelete(a)}
                  onArchive={() => handleArchive(a)}
                />
              ))}
              {areas.length === 0 && (
                <button
                  onClick={() => openCreate("areas")}
                  className="flex w-full items-center gap-1.5 pl-8 pr-3 py-1.5 text-xs text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                >
                  <Plus className="w-3 h-3" />新規エリア
                </button>
              )}
            </ParaSection>

            {/* リソース・アーカイブ：NavItemと同スタイルの直接リンク */}
            <ParaLink href="/resources" icon={BookOpen} label="リソース" active={pathname === "/resources"} />
            <ParaLink href="/archives" icon={Archive} label="アーカイブ" active={pathname === "/archives"} />
          </div>
        </div>

        {/* タグ */}
        {tags.length > 0 && (
          <div className="px-2">
            <SectionLabel label="タグ" />
            <div className="space-y-0.5">
              <ParaSection
                label="すべてのタグ" icon={Tag}
                open={showTags} onToggle={() => setShowTags(v => !v)}
              >
                {tags.map(tag => (
                  <Link
                    key={tag.id}
                    href={`/tags/${encodeURIComponent(tag.name)}`}
                    className={cn(
                      "flex w-full items-center gap-2 pl-8 pr-3 py-[6px] rounded-lg text-[13px] transition-all duration-150 hover:translate-x-0.5",
                      pathname === `/tags/${encodeURIComponent(tag.name)}`
                        ? "bg-[var(--sidebar-active-bg)] text-[var(--sidebar-active-text)] font-medium"
                        : "text-[var(--foreground-2)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--foreground)]"
                    )}
                  >
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: tag.color }} />
                    <span className="truncate">#{tag.name}</span>
                  </Link>
                ))}
                <Link
                  href="/tags"
                  className="flex w-full items-center gap-1.5 pl-8 pr-3 py-1.5 text-xs text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                >
                  <Tag className="w-3 h-3" />タグを管理...
                </Link>
              </ParaSection>
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

      <ProjectDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        project={editingProject}
        defaultCategory={defaultCategory}
      />
    </div>
  );
}
