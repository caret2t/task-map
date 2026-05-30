"use client";

import { TaskList } from "@/components/task/TaskList";
import { useUpcomingTasks } from "@/hooks/useTasks";

export default function UpcomingPage() {
  const tasks = useUpcomingTasks();
  return <TaskList tasks={tasks ?? []} title="📆 近日" defaultStatus="todo" />;
}
