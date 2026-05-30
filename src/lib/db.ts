import Dexie, { type EntityTable } from "dexie";
import type { Task, Project, Tag } from "@/types";

class TaskMapDB extends Dexie {
  tasks!: EntityTable<Task, "id">;
  projects!: EntityTable<Project, "id">;
  tags!: EntityTable<Tag, "id">;

  constructor() {
    super("TaskMapDB");
    this.version(1).stores({
      tasks:
        "id, status, projectId, areaId, dueDate, scheduledDate, priority, createdAt, updatedAt, userId",
      projects: "id, paraCategory, status, createdAt, userId",
      tags: "id, name, userId, createdAt",
    });
  }
}

export const db = new TaskMapDB();
