"use client";

import { use } from "react";
import { TaskList } from "@/components/task/TaskList";
import { BoardView } from "@/components/views/BoardView";
import { CalendarView } from "@/components/views/CalendarView";
import { ViewSwitcher } from "@/components/views/ViewSwitcher";
import { useProjectTasks } from "@/hooks/useTasks";
import { useProject } from "@/hooks/useProjects";
import { useUIStore } from "@/store/uiStore";

export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const project = useProject(id) as import("@/types").Project | undefined;
  const tasks = useProjectTasks(id);
  const { projectViewMode } = useUIStore();

  const title = project ? `${project.icon} ${project.name}` : "プロジェクト";

  if (projectViewMode === "board") {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border)]">
          <span className="text-sm font-semibold">{title}</span>
          <ViewSwitcher />
        </div>
        <div className="flex-1 overflow-hidden">
          <BoardView tasks={tasks ?? []} title={title} />
        </div>
      </div>
    );
  }

  if (projectViewMode === "calendar") {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border)]">
          <span className="text-sm font-semibold">{title}</span>
          <ViewSwitcher />
        </div>
        <div className="flex-1 overflow-hidden">
          <CalendarView tasks={tasks ?? []} title={title} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-end px-4 py-2 border-b border-[var(--border)]">
        <ViewSwitcher />
      </div>
      <div className="flex-1 overflow-hidden">
        <TaskList
          tasks={tasks ?? []}
          title={title}
          defaultProjectId={id}
        />
      </div>
    </div>
  );
}
