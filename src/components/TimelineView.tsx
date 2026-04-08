"use client"

import * as React from "react"
import { useStore, Task } from "@/lib/store"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  Star, 
  Search, 
  Filter, 
  Plus, 
  ChevronDown, 
  ChevronUp, 
  X, 
  PlusCircle,
  Layers,
  ArrowRight
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

export function TimelineView() {
  const { 
    tasks, 
    updateTask, 
    toggleTaskImportance, 
    addTask, 
    activeProjectId,
    projects,
    addTaskStep,
    updateTaskStep,
    toggleTaskStep,
    deleteTaskStep
  } = useStore()
  
  const [search, setSearch] = React.useState("")
  const [inlineTask, setInlineTask] = React.useState("")
  const [expandedTaskId, setExpandedTaskId] = React.useState<string | null>(null)
  const [newStep, setNewStep] = React.useState("")

  const todayStr = new Date().toISOString().split('T')[0]

  const sections = React.useMemo(() => {
    const list = tasks.filter(t => 
      (t.title || "").toLowerCase().includes(search.toLowerCase())
    )

    return {
      past: list.filter(t => t.dueDate && t.dueDate < todayStr && !t.completed).sort((a,b) => (a.dueDate || "").localeCompare(b.dueDate || "")),
      today: list.filter(t => t.dueDate === todayStr && !t.completed),
      future: list.filter(t => t.dueDate && t.dueDate > todayStr && !t.completed).sort((a,b) => (a.dueDate || "").localeCompare(b.dueDate || "")),
      completed: list.filter(t => t.completed).sort((a,b) => (b.createdAt || "").localeCompare(a.createdAt || ""))
    }
  }, [tasks, search, todayStr])

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inlineTask.trim()) return
    addTask({ 
      title: inlineTask, 
      dueDate: todayStr,
      listId: activeProjectId
    })
    setInlineTask("")
  }

  const handleAddStep = (taskId: string) => {
    if (!newStep.trim()) return
    addTaskStep(taskId, newStep)
    setNewStep("")
  }

  const TimelineSection = ({ title, items, bg, textColor }: { title: string, items: Task[], bg: string, textColor: string }) => (
    <div className="space-y-6">
      <div className={cn("flex items-center justify-between p-4 border border-primary/20 shadow-md transition-all", bg)}>
        <h3 className={cn("text-[11px] font-black uppercase tracking-[0.4em]", textColor)}>{title}</h3>
        <Badge variant="outline" className="text-[11px] font-black border-white/40 px-3 bg-white/20">{items.length}</Badge>
      </div>
      <div className="space-y-2">
        {items.map(task => (
          <div key={task.id} className="group flex flex-col bg-card border border-primary/5 hover:border-primary/40 transition-all shadow-sm">
            <div className="flex items-center gap-6 p-4">
              <Checkbox 
                checked={task.completed} 
                onCheckedChange={(checked) => updateTask(task.id, { completed: !!checked })}
                className="h-5 w-5 border-primary/30"
              />
              <div 
                className="flex-1 min-w-0 cursor-pointer"
                onClick={() => setExpandedTaskId(expandedTaskId === task.id ? null : task.id)}
              >
                <span className={cn(
                  "text-[12px] font-bold uppercase truncate block tracking-tight transition-colors",
                  task.completed ? "line-through text-muted-foreground/30 font-normal" : "text-foreground group-hover:text-primary"
                )}>
                  {task.title}
                </span>
                <div className="flex items-center gap-6 mt-1.5">
                   <div className="flex items-center gap-2 text-[9px] font-black text-muted-foreground uppercase tracking-widest group/date">
                      <CalendarIcon className="h-4 w-4 text-primary/60" />
                      <input 
                        type="date" 
                        value={task.dueDate || ""} 
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => updateTask(task.id, { dueDate: e.target.value })}
                        className="bg-transparent border-none outline-none focus:text-primary cursor-pointer font-black text-foreground"
                      />
                   </div>
                   {task.steps.length > 0 && (
                      <div className="flex items-center gap-1.5 text-[9px] font-black text-muted-foreground uppercase">
                        <CheckCircle2 className="h-4 w-4 text-primary/40" />
                        {task.steps.filter(s => s.completed).length}/{task.steps.length}
                      </div>
                   )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={(e) => { e.stopPropagation(); toggleTaskImportance(task.id); }}>
                  <Star className={cn("h-4 w-4 transition-all", task.isImportant ? "text-amber-500 fill-current" : "text-muted-foreground/10 hover:text-muted-foreground/30")} />
                </button>
                <button 
                  className="text-muted-foreground/40 hover:text-foreground transition-colors"
                  onClick={() => setExpandedTaskId(expandedTaskId === task.id ? null : task.id)}
                >
                  {expandedTaskId === task.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {expandedTaskId === task.id && (
              <div className="px-14 pb-6 space-y-6 animate-in slide-in-from-top-1 duration-200 bg-muted/5 border-t border-primary/5">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6 pt-6">
                  <div className="flex-1 w-full">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">Project Association</p>
                    <Select value={task.listId} onValueChange={(val) => updateTask(task.id, { listId: val })}>
                      <SelectTrigger className="h-10 text-[10px] font-bold uppercase border-primary/10 bg-card">
                        <SelectValue placeholder="SELECT PROJECT" />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.map(p => (
                          <SelectItem key={p.id} value={p.id} className="text-[10px] uppercase font-bold">{p.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1 w-full">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">Target Date</p>
                    <div className="flex items-center gap-3 border border-primary/10 h-10 px-3 bg-card">
                      <CalendarIcon className="h-4 w-4 text-primary/60" />
                      <input 
                        type="date" 
                        value={task.dueDate || ""} 
                        onChange={(e) => updateTask(task.id, { dueDate: e.target.value })}
                        className="bg-transparent text-[11px] uppercase font-black border-none outline-none w-full"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-primary/5">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Operational Steps</p>
                  <div className="space-y-2">
                    {task.steps.map(step => (
                      <div key={step.id} className="flex items-center gap-4 py-2 group/step bg-background/30 px-3 border border-transparent hover:border-primary/10">
                        <Checkbox 
                          checked={step.completed} 
                          onCheckedChange={() => toggleTaskStep(task.id, step.id)}
                          className="h-4 w-4"
                        />
                        <Input 
                          defaultValue={step.title}
                          onBlur={(e) => updateTaskStep(task.id, step.id, e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && updateTaskStep(task.id, step.id, e.currentTarget.value)}
                          className="bg-transparent border-none text-[11px] uppercase font-bold h-auto p-0 focus-visible:ring-0 placeholder:opacity-20 flex-1"
                        />
                        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover/step:opacity-100 text-destructive" onClick={() => deleteTaskStep(task.id, step.id)}>
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                    <div className="flex items-center gap-4 pt-3 px-3">
                      <PlusCircle className="h-5 w-5 text-primary/30" />
                      <Input 
                        value={newStep}
                        onChange={(e) => setNewStep(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddStep(task.id)}
                        placeholder="ADD SUB-ACTION..."
                        className="h-8 bg-transparent border-none text-[11px] uppercase font-bold p-0 placeholder:text-muted-foreground/20 focus-visible:ring-0"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        {items.length === 0 && (
          <div className="py-16 text-center border border-dashed border-primary/10 bg-muted/5">
            <p className="text-[10px] uppercase font-black text-muted-foreground/20 tracking-[0.5em]">No Active Records</p>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="flex flex-col h-full bg-background animate-in fade-in duration-300">
      <div className="px-12 h-20 border-b border-primary/10 flex items-center gap-12 bg-background/80 backdrop-blur-md shrink-0 z-40">
        <div className="flex items-center gap-4 shrink-0">
          <Filter className="h-5 w-5 text-primary" />
          <h2 className="text-[12px] font-black uppercase tracking-[0.5em] text-primary">Temporal Registry</h2>
        </div>
        
        <form onSubmit={handleQuickAdd} className="flex items-center gap-4 flex-1 max-w-4xl">
           <div className="relative flex-1">
             <Plus className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
             <Input 
              value={inlineTask}
              onChange={(e) => setInlineTask(e.target.value)}
              placeholder="INJECT NEW ACTION TO TODAY'S REPOSITORY..."
              className="pl-12 h-12 w-full text-[12px] uppercase font-bold border-primary/20 bg-card focus-visible:ring-primary/40 rounded-none shadow-sm"
             />
           </div>
           <Button type="submit" size="lg" className="h-12 px-10 text-[11px] uppercase font-black tracking-widest">
             <ArrowRight className="h-4 w-4 mr-2" /> Commit
           </Button>
        </form>

        <div className="relative flex-1 max-w-sm hidden lg:block">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
          <Input 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="FILTER REGISTRY..."
            className="pl-12 h-12 text-[11px] uppercase font-bold border-primary/10 bg-muted/10 w-full rounded-none"
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto p-12 lg:p-16">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-12 max-w-full mx-auto">
          <TimelineSection title="Past (Overdue)" items={sections.past} bg="bg-red-600/5 text-red-600 border-red-500/20" textColor="text-red-700" />
          <TimelineSection title="Today (Focus)" items={sections.today} bg="bg-amber-600/5 text-amber-600 border-amber-500/20" textColor="text-amber-700" />
          <TimelineSection title="Future (Upcoming)" items={sections.future} bg="bg-blue-600/5 text-blue-600 border-blue-500/20" textColor="text-blue-700" />
          <TimelineSection title="Archive (Completed)" items={sections.completed} bg="bg-green-600/5 text-green-600 border-green-500/20" textColor="text-green-700" />
        </div>
      </div>
    </div>
  )
}