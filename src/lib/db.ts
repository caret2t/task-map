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
    this.version(3).stores({
      tasks:
        "id, status, projectId, areaId, dueDate, scheduledDate, priority, workType, parentId, sortOrder, createdAt, updatedAt, userId",
      projects: "id, paraCategory, status, createdAt, userId",
      tags: "id, name, userId, createdAt",
    }).upgrade(async (tx) => {
      // Sort existing tasks by createdAt and assign distinct sortOrder values
      const allTasks = await tx.table("tasks").orderBy("createdAt").toArray();
      for (let i = 0; i < allTasks.length; i++) {
        if (allTasks[i].recurrence === undefined) allTasks[i].recurrence = null;
        if (allTasks[i].sortOrder === undefined) allTasks[i].sortOrder = i;
        await tx.table("tasks").update(allTasks[i].id, {
          recurrence: allTasks[i].recurrence,
          sortOrder: i,
        });
      }
    });
  }
}

export const db = new TaskMapDB();
