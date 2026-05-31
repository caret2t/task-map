"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import type { Tag } from "@/types";
import { v4 as uuidv4 } from "uuid";

export function useTags() {
  return useLiveQuery(() => db.tags.toArray(), [], [] as Tag[]);
}

export async function createTag(partial: Partial<Tag> & { name: string }): Promise<Tag> {
  const now = new Date();
  const tag: Tag = {
    id: uuidv4(),
    name: partial.name,
    color: partial.color ?? "#6366f1",
    userId: partial.userId ?? "local",
    createdAt: now,
  };
  await db.tags.add(tag);
  return tag;
}

export async function updateTag(id: string, changes: Partial<Tag>) {
  await db.tags.update(id, changes);
}

export async function deleteTag(id: string, tagName: string) {
  await db.transaction("rw", db.tags, db.tasks, async () => {
    await db.tasks.toCollection().modify(task => {
      task.tags = task.tags.filter((t: string) => t !== tagName);
    });
    await db.tags.delete(id);
  });
}
