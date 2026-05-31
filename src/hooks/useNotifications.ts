"use client";

import { useEffect, useCallback } from "react";
import { isToday, differenceInMinutes } from "date-fns";
import type { Task } from "@/types";

export function useReminderNotifications(tasks: Task[]) {
  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) return "denied";
    if (Notification.permission !== "default") return Notification.permission;
    return await Notification.requestPermission();
  }, []);

  useEffect(() => {
    if (!("Notification" in window) || Notification.permission !== "granted") return;

    const now = new Date();
    const timers: ReturnType<typeof setTimeout>[] = [];

    for (const task of tasks) {
      if (task.status === "done" || task.status === "archived") continue;

      const date = task.scheduledDate ?? task.dueDate;
      if (!date) continue;

      const target = new Date(date);
      const diff = differenceInMinutes(target, now);

      // 締め切り30分前に通知
      if (diff > 0 && diff <= 60) {
        const delay = (diff - 30) * 60 * 1000;
        if (delay > 0) {
          timers.push(setTimeout(() => {
            new Notification(`⏰ 締め切り30分前: ${task.title}`, {
              body: `タスクの期限が近づいています`,
              icon: "/icons/icon-192.png",
            });
          }, delay));
        }
      }

      // 今日のタスクの朝8時通知（ページ読み込み時）
      if (isToday(target) && now.getHours() < 8) {
        const morningTime = new Date(now);
        morningTime.setHours(8, 0, 0, 0);
        const delay = morningTime.getTime() - now.getTime();
        timers.push(setTimeout(() => {
          new Notification(`📋 今日のタスク: ${task.title}`, {
            body: "今日の実行タスクがあります",
            icon: "/icons/icon-192.png",
          });
        }, delay));
      }
    }

    return () => timers.forEach(clearTimeout);
  }, [tasks]);

  return { requestPermission };
}
