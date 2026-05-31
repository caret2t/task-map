"use client";

import { useEffect, useState } from "react";
import { Bell, X } from "lucide-react";
import { useAllTasks } from "@/hooks/useTasks";
import { useReminderNotifications } from "@/hooks/useNotifications";

export function NotificationSetup() {
  const [dismissed, setDismissed] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const tasks = useAllTasks();
  const { requestPermission } = useReminderNotifications(tasks);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission);
    }
    const stored = sessionStorage.getItem("notif-dismissed");
    if (stored) setDismissed(true);
  }, []);

  const handleRequest = async () => {
    const result = await requestPermission();
    setPermission(result as NotificationPermission);
    if (result === "granted") setDismissed(true);
  };

  const dismiss = () => {
    setDismissed(true);
    sessionStorage.setItem("notif-dismissed", "1");
  };

  if (dismissed || permission !== "default") return null;

  return (
    <div className="fixed bottom-20 lg:bottom-4 left-1/2 -translate-x-1/2 z-50 bg-[var(--background)] border border-[var(--border)] rounded-xl shadow-lg px-4 py-3 flex items-center gap-3 max-w-sm w-[calc(100vw-2rem)]">
      <Bell className="w-5 h-5 text-blue-500 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">リマインダー通知を有効化</p>
        <p className="text-xs text-[var(--muted)]">締め切り前に通知を受け取れます</p>
      </div>
      <button
        onClick={handleRequest}
        className="text-xs px-3 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors flex-shrink-0"
      >
        有効化
      </button>
      <button onClick={dismiss} className="text-[var(--muted)] hover:text-[var(--foreground)] flex-shrink-0">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
