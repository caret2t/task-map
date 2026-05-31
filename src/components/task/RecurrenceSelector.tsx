"use client";

import { useState, useEffect } from "react";
import { RefreshCw, X } from "lucide-react";
import type { Recurrence, RecurrenceFrequency } from "@/types";
import { cn } from "@/lib/utils";

const FREQ_LABELS: Record<RecurrenceFrequency, string> = {
  daily: "毎日",
  weekly: "毎週",
  monthly: "毎月",
  yearly: "毎年",
  custom: "カスタム",
};

const DOW_LABELS = ["日", "月", "火", "水", "木", "金", "土"];

interface RecurrenceSelectorProps {
  value: Recurrence | null;
  onChange: (r: Recurrence | null) => void;
}

export function RecurrenceSelector({ value, onChange }: RecurrenceSelectorProps) {
  const [open, setOpen] = useState(false);
  const [freq, setFreq] = useState<RecurrenceFrequency>(value?.frequency ?? "weekly");
  const [interval, setInterval] = useState(value?.interval ?? 1);
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>(value?.daysOfWeek ?? []);

  // タスクが変わって value が変化したら編集フォームを同期
  useEffect(() => {
    if (!open) {
      setFreq(value?.frequency ?? "weekly");
      setInterval(value?.interval ?? 1);
      setDaysOfWeek(value?.daysOfWeek ?? []);
    }
  }, [value, open]);

  const apply = () => {
    const r: Recurrence = {
      frequency: freq,
      interval,
      daysOfWeek: freq === "weekly" ? daysOfWeek : undefined,
    };
    onChange(r);
    setOpen(false);
  };

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
  };

  const toggleDow = (d: number) => {
    setDaysOfWeek(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-1.5 text-sm px-2 py-1 rounded border transition-colors",
          value
            ? "border-blue-400 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950"
            : "border-[var(--border)] text-[var(--muted)] hover:border-blue-300"
        )}
      >
        <RefreshCw className="w-3.5 h-3.5" />
        {value ? `${FREQ_LABELS[value.frequency]}${value.interval > 1 ? ` (${value.interval}回)` : ""}` : "繰り返しなし"}
        {value && (
          <X className="w-3 h-3 ml-1" onClick={clear} />
        )}
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 w-64 bg-[var(--background)] border border-[var(--border)] rounded-lg shadow-lg p-3 space-y-3">
          <div className="grid grid-cols-5 gap-1">
            {(Object.keys(FREQ_LABELS) as RecurrenceFrequency[]).map(f => (
              <button
                key={f}
                onClick={() => setFreq(f)}
                className={cn(
                  "text-xs py-1 rounded border transition-colors",
                  freq === f
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400"
                    : "border-[var(--border)] hover:border-blue-300"
                )}
              >
                {FREQ_LABELS[f]}
              </button>
            ))}
          </div>

          {(freq === "custom" || freq === "daily") && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--muted)]">間隔</span>
              <input
                type="number"
                min={1}
                max={365}
                value={interval}
                onChange={(e) => setInterval(Number(e.target.value))}
                className="w-16 text-sm border border-[var(--border)] rounded px-2 py-0.5 bg-transparent outline-none"
              />
              <span className="text-xs text-[var(--muted)]">日ごと</span>
            </div>
          )}

          {freq === "weekly" && (
            <div className="space-y-1">
              <span className="text-xs text-[var(--muted)]">曜日</span>
              <div className="flex gap-1">
                {DOW_LABELS.map((label, i) => (
                  <button
                    key={i}
                    onClick={() => toggleDow(i)}
                    className={cn(
                      "w-7 h-7 rounded text-xs border transition-colors",
                      daysOfWeek.includes(i)
                        ? "border-blue-500 bg-blue-500 text-white"
                        : "border-[var(--border)] hover:border-blue-300"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button
              onClick={apply}
              className="flex-1 text-xs py-1.5 rounded bg-blue-500 hover:bg-blue-600 text-white transition-colors"
            >
              設定
            </button>
            <button
              onClick={() => setOpen(false)}
              className="flex-1 text-xs py-1.5 rounded border border-[var(--border)] hover:bg-[var(--surface)] transition-colors"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
