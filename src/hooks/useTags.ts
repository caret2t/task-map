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
