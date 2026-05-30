export interface Task {
  id: string;
  title: string;
  body: string;
  dueDate: Date | null;
  scheduledDate: Date | null;
  completedAt: Date | null;
  projectId: string | null;
  areaId: string | null;
  tags: string[];
  status: "inbox" | "todo" | "in_progress" | "done" | "archived";
  priority: 0 | 1 | 2 | 3;
  parentId: string | null;
  subtasks: Subtask[];
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  order: number;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  paraCategory: "projects" | "areas" | "resources" | "archives";
  dueDate: Date | null;
  status: "active" | "completed" | "archived";
  defaultView: "list" | "board" | "calendar";
  sortOrder: "manual" | "due_date" | "priority" | "created";
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  userId: string;
  createdAt: Date;
}
