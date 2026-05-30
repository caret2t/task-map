"use client";

import { useEffect } from "react";
import { useUIStore } from "@/store/uiStore";

export default function SearchPage() {
  const { setCommandPaletteOpen } = useUIStore();
  useEffect(() => {
    setCommandPaletteOpen(true);
  }, [setCommandPaletteOpen]);

  return (
    <div className="flex items-center justify-center h-full text-[var(--muted)] text-sm">
      検索パレットを開いています...
    </div>
  );
}
