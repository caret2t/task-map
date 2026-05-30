"use client";

import { TaskList } from "@/components/task/TaskList";
import { useTodayTasks } from "@/hooks/useTasks";

export default function TodayPage() {
  const tasks = useTodayTasks();
  return <TaskList tasks={tasks ?? []} title="📅 今日" defaultStatus="todo" />;
}
