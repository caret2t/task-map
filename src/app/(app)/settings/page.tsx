"use client";

import { useState } from "react";
import { useUIStore } from "@/store/uiStore";
import { db } from "@/lib/db";
import { Sun, Moon, Monitor, Bell, Database, User, Download, Trash2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { ThemeMode } from "@/store/uiStore";

const THEME_OPTIONS: { value: ThemeMode; label: string; icon: React.ElementType }[] = [
  { value: "light", label: "ライト", icon: Sun },
  { value: "system", label: "自動（システム）", icon: Monitor },
  { value: "dark", label: "ダーク", icon: Moon },
];

const DATE_FORMATS = ["YYYY/MM/DD", "MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"];
const WEEK_STARTS = [{ value: 0, label: "日曜日" }, { value: 1, label: "月曜日" }];

function SectionCard({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-[var(--border)]">
        <Icon className="w-4 h-4 text-[var(--primary)]" />
        <h2 className="text-sm font-semibold">{title}</h2>
      </div>
      <div className="divide-y divide-[var(--border)]">{children}</div>
    </div>
  );
}

function SettingRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-medium">{label}</p>
        {description && <p className="text-xs text-[var(--muted)] mt-0.5">{description}</p>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const { theme, setTheme } = useUIStore();
  const [notifStatus, setNotifStatus] = useState<NotificationPermission | "unsupported">(
    typeof Notification !== "undefined" ? Notification.permission : "unsupported"
  );
  const [weekStart, setWeekStart] = useState(1);
  const [dateFormat, setDateFormat] = useState("YYYY/MM/DD");
  const [clearConfirm, setClearConfirm] = useState(false);
  const [exportDone, setExportDone] = useState(false);

  const requestNotification = async () => {
    if (typeof Notification === "undefined") return;
    const result = await Notification.requestPermission();
    setNotifStatus(result);
  };

  const handleExport = async () => {
    const tasks = await db.tasks.toArray();
    const projects = await db.projects.toArray();
    const tags = await db.tags.toArray();
    const data = JSON.stringify({ tasks, projects, tags }, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `taskmap-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExportDone(true);
    setTimeout(() => setExportDone(false), 2000);
  };

  const handleClearAll = async () => {
    if (!clearConfirm) { setClearConfirm(true); return; }
    await db.tasks.clear();
    await db.projects.clear();
    await db.tags.clear();
    setClearConfirm(false);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 py-4 border-b border-[var(--border)] flex-shrink-0">
        <h1 className="text-lg font-bold tracking-tight">⚙️ 設定</h1>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-2xl mx-auto w-full">

        {/* アカウント */}
        <SectionCard title="アカウント" icon={User}>
          <SettingRow label="ユーザー" description="ローカル（未ログイン）">
            <span className="text-xs text-[var(--muted)] bg-[var(--border-2)] px-2 py-0.5 rounded-full">ゲスト</span>
          </SettingRow>
        </SectionCard>

        {/* 外観 */}
        <SectionCard title="外観" icon={Sun}>
          <SettingRow label="テーマ">
            <div className="flex gap-1">
              {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setTheme(value)}
                  title={label}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    theme === value
                      ? "bg-[var(--primary)] text-white"
                      : "bg-[var(--border-2)] text-[var(--foreground-2)] hover:bg-[var(--sidebar-hover)]"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              ))}
            </div>
          </SettingRow>
        </SectionCard>

        {/* 言語・地域 */}
        <SectionCard title="言語・地域" icon={ChevronRight}>
          <SettingRow label="週の始まり">
            <select
              value={weekStart}
              onChange={e => setWeekStart(Number(e.target.value))}
              className="text-sm bg-[var(--border-2)] border border-[var(--border)] rounded-lg px-2 py-1.5 text-[var(--foreground)]"
            >
              {WEEK_STARTS.map(w => (
                <option key={w.value} value={w.value}>{w.label}</option>
              ))}
            </select>
          </SettingRow>
          <SettingRow label="日付フォーマット">
            <select
              value={dateFormat}
              onChange={e => setDateFormat(e.target.value)}
              className="text-sm bg-[var(--border-2)] border border-[var(--border)] rounded-lg px-2 py-1.5 text-[var(--foreground)]"
            >
              {DATE_FORMATS.map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </SettingRow>
        </SectionCard>

        {/* 通知 */}
        <SectionCard title="通知" icon={Bell}>
          <SettingRow
            label="プッシュ通知"
            description={
              notifStatus === "granted" ? "通知が許可されています"
              : notifStatus === "denied" ? "通知がブロックされています（ブラウザ設定から変更）"
              : notifStatus === "unsupported" ? "このブラウザは通知非対応"
              : "通知を許可するとリマインダーが届きます"
            }
          >
            {notifStatus === "granted" ? (
              <span className="text-xs text-green-600 font-medium bg-green-100 dark:bg-green-900/30 px-2.5 py-1 rounded-full">許可済み</span>
            ) : notifStatus === "denied" ? (
              <span className="text-xs text-red-500 font-medium">ブロック</span>
            ) : notifStatus === "unsupported" ? (
              <span className="text-xs text-[var(--muted)]">非対応</span>
            ) : (
              <Button size="sm" onClick={requestNotification}>許可する</Button>
            )}
          </SettingRow>
        </SectionCard>

        {/* データ管理 */}
        <SectionCard title="データ管理" icon={Database}>
          <SettingRow label="データをエクスポート" description="タスク・プロジェクト・タグをJSONファイルで保存">
            <Button size="sm" variant="outline" onClick={handleExport}>
              <Download className="w-3.5 h-3.5 mr-1.5" />
              {exportDone ? "完了！" : "エクスポート"}
            </Button>
          </SettingRow>
          <SettingRow
            label="すべてのデータを削除"
            description={clearConfirm ? "もう一度クリックで完全削除（元に戻せません）" : "ローカルのタスク・プロジェクト・タグを全削除"}
          >
            <Button
              size="sm"
              variant={clearConfirm ? "destructive" : "outline"}
              onClick={handleClearAll}
              onBlur={() => setClearConfirm(false)}
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              {clearConfirm ? "本当に削除" : "全削除"}
            </Button>
          </SettingRow>
        </SectionCard>

        <p className="text-center text-xs text-[var(--muted)] pb-4">TaskMap v0.6.0</p>
      </div>
    </div>
  );
}
