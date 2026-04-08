"use client"

import * as React from "react"
import { useStore } from "@/lib/store"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { FileText, History, Search, ListTodo } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

export function CalendarView() {
  const { notes, tasks, setActiveNote, updateTask } = useStore()
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date())
  const [search, setSearch] = React.useState("")
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const dateString = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ""

  const filteredNotes = React.useMemo(() => {
    return notes.filter(note => {
      const noteDate = new Date(note.createdAt).toISOString().split('T')[0]
      const isSameDate = selectedDate ? format(selectedDate, 'yyyy-MM-dd') === noteDate : true
      const matchesSearch = (note.title || "").toLowerCase().includes(search.toLowerCase()) || 
                           (note.content || "").toLowerCase().includes(search.toLowerCase())
      return isSameDate && matchesSearch
    })
  }, [notes, selectedDate, search])

  const filteredTasks = React.useMemo(() => {
    return tasks.filter(task => {
      const isSameDate = selectedDate ? task.dueDate === dateString : true
      const matchesSearch = (task.title || "").toLowerCase().includes(search.toLowerCase())
      return isSameDate && matchesSearch
    })
  }, [tasks, dateString, search])

  const CustomDayContent = React.useCallback(({ date }: { date: Date }) => {
    const dStr = format(date, 'yyyy-MM-dd')
    const noteCount = notes.filter(n => new Date(n.createdAt).toISOString().split('T')[0] === dStr).length
    const taskCount = tasks.filter(t => t.dueDate === dStr).length

    return (
      <div className="relative w-full h-full flex items-center justify-center">
        <span className="z-10 text-[11px] font-black">{date.getDate()}</span>
        
        {/* Task Counter - Top Right */}
        {taskCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[14px] h-[14px] bg-amber-600 text-white text-[8px] font-black rounded-sm border border-amber-500 shadow-sm z-20">
            {taskCount}
          </span>
        )}

        {/* Note Counter - Bottom Left */}
        {noteCount > 0 && (
          <span className="absolute bottom-1 left-1 flex items-center justify-center min-w-[14px] h-[14px] bg-primary text-primary-foreground text-[8px] font-black rounded-sm border border-primary/20 shadow-sm z-20">
            {noteCount}
          </span>
        )}
      </div>
    )
  }, [notes, tasks])

  if (!mounted) return null

  return (
    <div className="flex flex-col h-full bg-background animate-in fade-in duration-300">
      {/* Top Section Calendar */}
      <div className="w-full px-6 py-4 border-b border-primary/10 bg-muted/5 shrink-0">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-stretch">
            <div className="w-full lg:w-[420px] shrink-0 border border-primary/10 bg-card p-4 shadow-md">
               <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                components={{
                  DayContent: CustomDayContent
                }}
                className="w-full"
              />
            </div>
            
            <div className="flex-1 flex flex-col justify-between py-1 w-full gap-4">
              <div className="space-y-2">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary/60">Repository Filter</h3>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                  <Input 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="SCAN DOCUMENTS & ACTIONS..." 
                    className="pl-12 h-12 text-[11px] font-bold uppercase tracking-widest border-primary/10 bg-card rounded-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-primary/5 border border-primary/10">
                  <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Total Logs</div>
                  <div className="text-2xl font-black text-primary">{notes.length}</div>
                </div>
                <div className="p-4 bg-amber-500/5 border border-amber-500/10">
                  <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Actions Required</div>
                  <div className="text-2xl font-black text-amber-600">{tasks.filter(t => !t.completed).length}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Repository Content */}
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8 border-b border-primary/10 pb-4">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold uppercase tracking-tighter">Day Archive</h2>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em]">
                {selectedDate ? format(selectedDate, 'EEEE, MMMM do, yyyy').toUpperCase() : 'SELECT DATE'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <section className="space-y-4">
              <div className="flex items-center gap-3 mb-2 opacity-50">
                <ListTodo className="h-4 w-4" />
                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em]">Temporal Tasks ({filteredTasks.length})</h3>
              </div>
              <div className="space-y-1">
                {filteredTasks.map(task => (
                  <div key={task.id} className="flex items-center gap-4 p-3 bg-card border border-primary/5 hover:border-primary/20 transition-all">
                    <Checkbox 
                      checked={task.completed}
                      onCheckedChange={(checked) => updateTask(task.id, { completed: !!checked })}
                      className="rounded-none h-4 w-4 border-primary/30"
                    />
                    <span className={cn("text-[12px] font-bold uppercase flex-1 truncate", task.completed && "line-through opacity-30")}>{task.title}</span>
                  </div>
                ))}
                {filteredTasks.length === 0 && <p className="text-[10px] uppercase font-bold text-muted-foreground/20 italic py-8 text-center border border-dashed border-primary/10">Zero actions found for this date.</p>}
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3 mb-2 opacity-50">
                <FileText className="h-4 w-4" />
                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em]">Document Entries ({filteredNotes.length})</h3>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {filteredNotes.map(note => (
                  <Card 
                    key={note.id} 
                    className="cursor-pointer hover:border-primary/40 transition-all bg-card border-primary/10 shadow-none rounded-none group"
                    onClick={() => setActiveNote(note.id)}
                  >
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-[12px] font-bold uppercase truncate group-hover:text-primary transition-colors">{note.title || 'Untitled'}</CardTitle>
                      <CardDescription className="line-clamp-1 text-[9px] uppercase font-medium opacity-50 mt-1">
                        {note.content || 'No content...'}
                      </CardDescription>
                    </CardHeader>
                    <CardFooter className="p-4 pt-2 flex items-center justify-between border-t border-primary/5 mt-2">
                      <div className="flex items-center gap-2">
                        <History className="h-3 w-3 text-primary/40" />
                        <span className="text-[8px] text-muted-foreground uppercase font-black">
                          {new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
                {filteredNotes.length === 0 && <p className="text-[10px] uppercase font-bold text-muted-foreground/20 italic py-8 text-center border border-dashed border-primary/10">No document logs recorded.</p>}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
