import { format } from "date-fns"

export function localDateKey(date: Date = new Date()) {
  return format(date, "yyyy-MM-dd")
}

export function dateKeyFromIso(value: string) {
  return localDateKey(new Date(value))
}
