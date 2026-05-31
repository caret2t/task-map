"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { startOfDay, endOfDay, addDays, addWeeks, addMonths, addYears } from "date-fns";
import type { Task } from "@/types";
import { v4 as uuidv4 } from "uuid";

export function useInboxTasks() {
  return useLiveQuery(
    () => db.tasks.where("status").equals("inbox").sortBy("createdAt"),
    [],
    [] as Task[]
  );
}

export function useTodayTasks() {
  const today = startOfDay(new Date());
  const todayEnd = endOfDay(new Date());
  return useLiveQuery(
    async () => {
      const tasks = await db.tasks
        .where("status")
        .notEqual("done")
        .and((t) => t.status !== "archived")
        .toArray();
      return tasks.filter((t) => {
        const scheduled = t.scheduledDate ? new Date(t.scheduledDate) : null;
        const due = t.dueDate ? new Date(t.dueDate) : null;
        if (scheduled) return scheduled >= today && scheduled <= todayEnd;
        if (due) return due >= today && due <= todayEnd;
        return false;
      });
    },
    [],
    [] as Task[]
  );
}

export function useUpcomingTasks() {
  const today = startOfDay(new Date());
  const weekEnd = endOfDay(addDays(new Date(), 7));
  return useLiveQuery(
    async () => {
      const tasks = await db.tasks
        .where("status")
        .notEqual("done")
        .and((t) => t.status !== "archived")
        .toArray();
      return tasks.filter((t) => {
        const scheduled = t.scheduledDate ? new Date(t.scheduledDate) : null;
        const due = t.dueDate ? new Date(t.dueDate) : null;
        if (scheduled) return scheduled > today && scheduled <= weekEnd;
        if (due) return due > today && due <= weekEnd;
        return false;
      });
    },
    [],
    [] as Task[]
  );
}

export function useProjectTasks(projectId: string | null) {
  return useLiveQuery(
    () =>
      projectId
        ? db.tasks.where("projectId").equals(projectId).toArray()
        : Promise.resolve([] as Task[]),
    [projectId],
    [] as Task[]
  );
}

export function useTask(id: string | null) {
  return useLiveQuery(
    () => (id ? db.tasks.get(id) : Promise.resolve(undefined)),
    [id],
    undefined as Task | undefined
  );
}

export async function createTask(partial: Partial<Task> & { title: string }): Promise<Task> {
  const now = new Date();
  const count = await db.tasks.count();
  const task: Task = {
    id: uuidv4(),
    title: partial.title,
    body: partial.body ?? "",
    dueDate: partial.dueDate ?? null,
    scheduledDate: partial.scheduledDate ?? null,
    completedAt: null,
    projectId: partial.projectId ?? null,
    areaId: partial.areaId ?? null,
    tags: partial.tags ?? [],
    status: partial.status ?? "inbox",
    priority: partial.priority ?? 0,
    parentId: partial.parentId ?? null,
    subtasks: partial.subtasks ?? [],
    workType: partial.workType ?? null,
    estimatedMinutes: partial.estimatedMinutes ?? null,
    recurrence: partial.recurrence ?? null,
    sortOrder: partial.sortOrder ?? count,
    createdAt: now,
    updatedAt: now,
    userId: partial.userId ?? "local",
  };
  await db.tasks.add(task);
  return task;
}

export async function updateTask(id: string, changes: Partial<Task>) {
  await db.tasks.update(id, { ...changes, updatedAt: new Date() });
}

export async function deleteTask(id: string) {
  await db.tasks.delete(id);
}

export async function toggleTaskDone(task: Task) {
  if (task.status === "done") {
    await db.tasks.update(task.id, {
      status: "todo",
      completedAt: null,
      updatedAt: new Date(),
    });
  } else {
    await db.transaction("rw", db.tasks, async () => {
      await db.tasks.update(task.id, {
        status: "done",
        completedAt: new Date(),
        updatedAt: new Date(),
      });
      if (task.recurrence) {
        const next = await computeNextOccurrence(task);
        if (next) await db.tasks.add(next);
      }
    });
  }
}

async function computeNextOccurrence(task: Task): Promise<Task | null> {
  const r = task.recurrence!;
  const base = task.scheduledDate ? new Date(task.scheduledDate) : task.dueDate ? new Date(task.dueDate) : null;
  if (!base) return null;
  let nextDate: Date;
  switch (r.frequency) {
    case "daily":
    case "custom":  nextDate = addDays(base, r.interval); break;
    case "weekly": {
      // 曜日指定がある場合は次の該当曜日を探す
      if (r.daysOfWeek && r.daysOfWeek.length > 0) {
        let candidate = addDays(base, 1);
        for (let i = 0; i < 14; i++) {
          if (r.daysOfWeek.includes(candidate.getDay())) { nextDate = candidate; break; }
          candidate = addDays(candidate, 1);
        }
        nextDate ??= addWeeks(base, r.interval);
      } else {
        nextDate = addWeeks(base, r.interval);
      }
      break;
    }
    case "monthly": nextDate = addMonths(base, r.interval); break;
    case "yearly":  nextDate = addYears(base, r.interval); break;
    default: return null;
  }
  if (r.endDate && nextDate > new Date(r.endDate)) return null;
  const now = new Date();
  const count = await db.tasks.count();
  return {
    ...task,
    id: uuidv4(),
    status: task.status === "inbox" ? "inbox" : "todo",
    completedAt: null,
    sortOrder: count,
    scheduledDate: task.scheduledDate ? nextDate : null,
    dueDate: task.dueDate ? nextDate : null,
    subtasks: task.subtasks.map(s => ({ ...s, completed: false })),
    createdAt: now,
    updatedAt: now,
  };
}

export async function reorderTasks(orderedIds: string[]) {
  await db.transaction("rw", db.tasks, async () => {
    for (let i = 0; i < orderedIds.length; i++) {
      await db.tasks.update(orderedIds[i], { sortOrder: i, updatedAt: new Date() });
    }
  });
}

export function useSubtasks(parentId: string | null) {
  return useLiveQuery(
    () => parentId ? db.tasks.where("parentId").equals(parentId).sortBy("sortOrder") : Promise.resolve([] as Task[]),
    [parentId],
    [] as Task[]
  );
}

export function useAllTasks() {
  return useLiveQuery(() => db.tasks.toArray(), [], [] as Task[]);
}
