"use client";

import { use } from "react";
import { TaskList } from "@/components/task/TaskList";
import { useProjectTasks } from "@/hooks/useTasks";
import { useProject } from "@/hooks/useProjects";

export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const project = useProject(id) as import("@/types").Project | undefined;
  const tasks = useProjectTasks(id);

  return (
    <TaskList
      tasks={tasks ?? []}
      title={project ? `${project.icon} ${project.name}` : "プロジェクト"}
    />
  );
}
