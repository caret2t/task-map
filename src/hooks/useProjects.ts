"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import type { Project } from "@/types";
import { v4 as uuidv4 } from "uuid";

export function useProjects() {
  return useLiveQuery(() => db.projects.toArray(), [], [] as Project[]);
}

export function useProject(id: string | null) {
  return useLiveQuery(
    () => (id ? db.projects.get(id) : Promise.resolve(undefined)),
    [id],
    undefined as Project | undefined
  );
}

export function useProjectsByCategory(category: Project["paraCategory"]) {
  return useLiveQuery(
    () => db.projects.where("paraCategory").equals(category).toArray(),
    [category],
    [] as Project[]
  );
}

export async function createProject(partial: Partial<Project> & { name: string }): Promise<Project> {
  const now = new Date();
  const project: Project = {
    id: uuidv4(),
    name: partial.name,
    description: partial.description ?? "",
    color: partial.color ?? "#6366f1",
    icon: partial.icon ?? "📁",
    paraCategory: partial.paraCategory ?? "projects",
    dueDate: partial.dueDate ?? null,
    status: partial.status ?? "active",
    defaultView: partial.defaultView ?? "list",
    sortOrder: partial.sortOrder ?? "manual",
    createdAt: now,
    updatedAt: now,
    userId: partial.userId ?? "local",
  };
  await db.projects.add(project);
  return project;
}
