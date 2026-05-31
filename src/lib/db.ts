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
    this.version(2).stores({
      tasks:
        "id, status, projectId, areaId, dueDate, scheduledDate, priority, workType, createdAt, updatedAt, userId",
      projects: "id, paraCategory, status, createdAt, userId",
      tags: "id, name, userId, createdAt",
    }).upgrade((tx) => {
      return tx.table("tasks").toCollection().modify((task) => {
        if (task.workType === undefined) task.workType = null;
        if (task.estimatedMinutes === undefined) task.estimatedMinutes = null;
      });
    });
  }
}

export const db = new TaskMapDB();
