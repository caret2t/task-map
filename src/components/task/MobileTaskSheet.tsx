"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTaskStore } from "@/store/taskStore";
import { useTask } from "@/hooks/useTasks";
import { TaskDetail } from "./TaskDetail";

export function MobileTaskSheet() {
  const { selectedTaskId, setSelectedTask } = useTaskStore();
  const taskRaw = useTask(selectedTaskId);
  const task = taskRaw && "id" in taskRaw ? taskRaw as import("@/types").Task : undefined;

  // ESC で閉じる
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedTask(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [setSelectedTask]);

  return (
    <AnimatePresence>
      {selectedTaskId && task && (
        <>
          {/* Scrim */}
          <motion.div
            key="scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden fixed inset-0 z-40 bg-black/40"
            onClick={() => setSelectedTask(null)}
          />
          {/* Sheet */}
          <motion.div
            key="sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
            className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[var(--background)] rounded-t-2xl shadow-2xl overflow-hidden"
            style={{ maxHeight: "85dvh" }}
          >
            {/* Drag pill */}
            <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
              <div className="w-10 h-1 rounded-full bg-[var(--border)]" />
            </div>
            <div className="overflow-y-auto" style={{ maxHeight: "calc(85dvh - 20px)" }}>
              <TaskDetail task={task} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
