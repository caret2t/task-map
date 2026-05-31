"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { X, Play, Pause, RotateCcw, CheckCircle2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/uiStore";
import { useTask, toggleTaskDone } from "@/hooks/useTasks";
import { SubtaskList } from "@/components/task/SubtaskList";

const POMODORO_WORK = 25 * 60;
const POMODORO_BREAK = 5 * 60;

type TimerState = "idle" | "work" | "break";

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export function FocusMode() {
  const { focusModeOpen, focusTaskId, exitFocusMode } = useUIStore();
  const taskRaw = useTask(focusTaskId);
  const task = taskRaw && "id" in taskRaw ? taskRaw as import("@/types").Task : undefined;

  const [timerState, setTimerState] = useState<TimerState>("idle");
  const [remaining, setRemaining] = useState(POMODORO_WORK);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [showSubtasks, setShowSubtasks] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!focusModeOpen) {
      clearTimer();
      setIsRunning(false);
      setTimerState("idle");
      setRemaining(POMODORO_WORK);
    }
  }, [focusModeOpen, clearTimer]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setRemaining(r => {
          if (r <= 1) {
            clearTimer();
            setIsRunning(false);
            if (timerState === "work") {
              setSessions(s => s + 1);
              setTimerState("break");
              setRemaining(POMODORO_BREAK);
              if ("Notification" in window && Notification.permission === "granted") {
                new Notification("休憩タイムです！", { body: "5分間休憩しましょう" });
              }
            } else {
              setTimerState("work");
              setRemaining(POMODORO_WORK);
              if ("Notification" in window && Notification.permission === "granted") {
                new Notification("作業を再開しましょう", { body: "ポモドーロセッション開始" });
              }
            }
            return 0;
          }
          return r - 1;
        });
      }, 1000);
    } else {
      clearTimer();
    }
    return clearTimer;
  }, [isRunning, timerState, clearTimer]);

  const toggle = () => {
    if (timerState === "idle") setTimerState("work");
    setIsRunning(r => !r);
  };

  const reset = () => {
    clearTimer();
    setIsRunning(false);
    setTimerState("idle");
    setRemaining(POMODORO_WORK);
  };

  const progress = timerState === "break"
    ? 1 - remaining / POMODORO_BREAK
    : 1 - remaining / POMODORO_WORK;

  const circumference = 2 * Math.PI * 54;

  if (!focusModeOpen || !task) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-[var(--background)] flex flex-col items-center justify-center">
      {/* Close */}
      <button
        onClick={exitFocusMode}
        className="absolute top-4 right-4 p-2 rounded-full hover:bg-[var(--surface)] text-[var(--muted)] transition-colors"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Task info */}
      <div className="text-center mb-8 max-w-md px-6">
        <p className="text-xs text-[var(--muted)] uppercase tracking-wider mb-2">フォーカス中</p>
        <h1 className="text-2xl font-bold">{task.title}</h1>
        {sessions > 0 && (
          <p className="text-sm text-[var(--muted)] mt-1">
            完了セッション: {sessions}
          </p>
        )}
      </div>

      {/* Timer ring */}
      <div className="relative w-40 h-40 mb-8">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" fill="none" stroke="var(--surface-2)" strokeWidth="8" />
          <circle
            cx="60" cy="60" r="54"
            fill="none"
            stroke={timerState === "break" ? "#10b981" : "#3b82f6"}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-mono font-bold">{formatTime(remaining)}</span>
          <span className={cn("text-xs mt-1", timerState === "break" ? "text-emerald-500" : "text-blue-500")}>
            {timerState === "break" ? "休憩" : timerState === "work" ? "作業" : "待機"}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={reset}
          className="p-3 rounded-full hover:bg-[var(--surface)] text-[var(--muted)] transition-colors"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
        <button
          onClick={toggle}
          className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center text-white transition-colors shadow-lg",
            timerState === "break" ? "bg-emerald-500 hover:bg-emerald-600" : "bg-blue-500 hover:bg-blue-600"
          )}
        >
          {isRunning ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-0.5" />}
        </button>
        <button
          onClick={() => { toggleTaskDone(task); exitFocusMode(); }}
          className="p-3 rounded-full hover:bg-[var(--surface)] text-[var(--muted)] transition-colors"
          title="完了にして終了"
        >
          <CheckCircle2 className="w-5 h-5" />
        </button>
      </div>

      {/* Subtasks toggle */}
      {task.subtasks.length > 0 && (
        <div className="w-full max-w-sm px-6">
          <button
            onClick={() => setShowSubtasks(s => !s)}
            className="flex items-center gap-2 text-sm text-[var(--muted)] mb-2"
          >
            <ChevronDown className={cn("w-4 h-4 transition-transform", showSubtasks && "rotate-180")} />
            サブタスク ({task.subtasks.filter(s => s.completed).length}/{task.subtasks.length})
          </button>
          {showSubtasks && (
            <div className="bg-[var(--surface)] rounded-lg p-3">
              <SubtaskList task={task} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
