"use client";

import { useState } from "react";
import { useUIStore } from "@/store/uiStore";
import { createTask } from "@/hooks/useTasks";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function QuickCaptureModal() {
  const { quickCaptureOpen, setQuickCaptureOpen } = useUIStore();
  const [title, setTitle] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await createTask({ title: title.trim(), status: "inbox" });
    setTitle("");
    setQuickCaptureOpen(false);
  };

  return (
    <Dialog open={quickCaptureOpen} onOpenChange={setQuickCaptureOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>クイックキャプチャ</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="タスクのタイトル..."
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setQuickCaptureOpen(false)}>
              キャンセル
            </Button>
            <Button type="submit">追加</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
