"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-0 w-full", className)}
      classNames={{
        months: "flex flex-col space-y-4",
        month: "space-y-4 w-full",
        caption: "flex justify-center pt-1 relative items-center mb-4 px-2",
        caption_label: "text-[11px] font-bold uppercase tracking-[0.3em] text-foreground",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 border-primary/20 rounded-none"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex w-full mb-2",
        head_cell: "text-muted-foreground rounded-md w-full font-black text-[10px] uppercase text-center tracking-widest",
        row: "flex w-full mt-0",
        cell: cn(
          "relative h-14 w-full text-center text-sm p-0 flex items-center justify-center focus-within:relative focus-within:z-20 border border-primary/5 first:border-l-0 last:border-r-0",
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
            : "[&:has([aria-selected])]:rounded-md"
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-full w-full p-0 font-bold uppercase text-[11px] aria-selected:opacity-100 hover:bg-primary/10 transition-all rounded-none border-none"
        ),
        day_range_start: "day-range-start",
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent/10 text-accent font-black",
        day_outside:
          "day-outside text-muted-foreground/10 aria-selected:bg-accent/5 aria-selected:text-muted-foreground/10",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
