import { create } from "zustand";
import type { Task } from "@/types";

interface TaskState {
  selectedTaskId: string | null;
  selectedTask: Task | null;
  setSelectedTask: (task: Task | null) => void;
  setSelectedTaskId: (id: string | null) => void;
}

export const useTaskStore = create<TaskState>((set) => ({
  selectedTaskId: null,
  selectedTask: null,
  setSelectedTask: (task) => set({ selectedTask: task, selectedTaskId: task?.id ?? null }),
  setSelectedTaskId: (id) => set({ selectedTaskId: id }),
}));
