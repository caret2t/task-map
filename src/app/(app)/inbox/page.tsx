"use client";

import { TaskList } from "@/components/task/TaskList";
import { useInboxTasks } from "@/hooks/useTasks";

export default function InboxPage() {
  const tasks = useInboxTasks();
  return <TaskList tasks={tasks ?? []} title="📥 インボックス" />;
}
