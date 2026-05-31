"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { TaskList } from "@/components/task/TaskList";
import { BoardView } from "@/components/views/BoardView";
import { CalendarView } from "@/components/views/CalendarView";
import { ViewSwitcher } from "@/components/views/ViewSwitcher";
import { useProjectTasks } from "@/hooks/useTasks";
import { useProject, archiveProject } from "@/hooks/useProjects";
import { useUIStore } from "@/store/uiStore";
import { ArchiveIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const project = useProject(id) as import("@/types").Project | undefined;
  const tasks = useProjectTasks(id);
  const { projectViewMode } = useUIStore();
  const router = useRouter();

  const title = project ? `${project.icon} ${project.name}` : "プロジェクト";

  const handleArchive = async () => {
    if (!confirm(`「${project?.name}」をアーカイブしますか？`)) return;
    await archiveProject(id);
    router.push("/archives");
  };

  const header = (
    <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border)]">
      <div className="flex items-center gap-2">
        {project && (
          <Button variant="ghost" size="sm" onClick={handleArchive} title="アーカイブ">
            <ArchiveIcon className="w-3.5 h-3.5 mr-1" />完了にする
          </Button>
        )}
      </div>
      <ViewSwitcher />
    </div>
  );

  if (projectViewMode === "board") {
    return (
      <div className="flex flex-col h-full">
        {header}
        <div className="flex-1 overflow-hidden">
          <BoardView tasks={tasks ?? []} title={title} />
        </div>
      </div>
    );
  }

  if (projectViewMode === "calendar") {
    return (
      <div className="flex flex-col h-full">
        {header}
        <div className="flex-1 overflow-hidden">
          <CalendarView tasks={tasks ?? []} title={title} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {header}
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
