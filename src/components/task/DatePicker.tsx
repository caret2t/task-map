"use client";

import { useState } from "react";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import { ja as jaDateFns } from "date-fns/locale";
import { ja as jaRdp } from "react-day-picker/locale";
import { CalendarIcon, X } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/Popover";
import { Button } from "@/components/ui/Button";
import "react-day-picker/style.css";

interface DatePickerProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
}

export function DatePicker({ value, onChange, placeholder = "日付を選択" }: DatePickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs font-normal">
          <CalendarIcon className="w-3 h-3" />
          {value ? format(value, "M月d日", { locale: jaDateFns }) : placeholder}
          {value && (
            <X
              className="w-3 h-3 ml-1 hover:text-red-500"
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
              }}
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2">
        <DayPicker
          mode="single"
          selected={value ?? undefined}
          onSelect={(d) => {
            onChange(d ?? null);
            setOpen(false);
          }}
          locale={jaRdp}
        />
      </PopoverContent>
    </Popover>
  );
}
