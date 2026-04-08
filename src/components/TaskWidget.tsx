"use client"

import * as React from "react"
import { useStore, Task } from "@/lib/store"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle2, Star, Plus, Zap } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export function TaskWidget() {
  const { tasks, updateTask, toggleTaskImportance, addTask, activeView } = useStore()
  const [newTaskTitle, setNewTaskTitle] = React.useState("")
  const [currentDateString, setCurrentDateString] = React.useState("")

  React.useEffect(() => {
    setCurrentDateString(new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase())
  }, [])

  const filteredTasks = React.useMemo(() => {
    switch (activeView) {
      case 'my-day': return tasks.filter(t => t.isMyDay);
      case 'important': return tasks.filter(t => t.isImportant);
      default: return tasks;
    }
  }, [tasks, activeView]);

  const displayedTasks = filteredTasks.slice(0, 8)

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskTitle.trim()) return
    addTask({
      title: newTaskTitle,
      completed: false,
      isMyDay: activeView === 'my-day',
      isImportant: activeView === 'important'
    })
    setNewTaskTitle("")
  }

  return (
    <div className="w-full bg-card border-2 border-primary/10 shadow-none flex flex-col h-full max-h-[500px]">
      <div className="bg-primary p-4 text-white">
        <div className="flex items-center justify-between mb-3">
          <div className="flex flex-col">
            <span className="text-[8px] opacity-70 font-bold tracking-widest h-3">{currentDateString}</span>
            <h3 className="text-sm font-headline font-bold uppercase tracking-tight">
              {activeView === 'my-day' ? 'My Day' : activeView === 'important' ? 'Important' : 'Tasks'}
            </h3>
          </div>
          <div className="h-8 w-8 bg-white/10 flex items-center justify-center">
            {activeView === 'my-day' ? <Zap className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-white/10 hover:bg-white/20 text-white border-none px-2 py-0 text-[9px] font-bold">
            {filteredTasks.filter(t => !t.completed).length} PENDING
          </Badge>
          <div className="h-0.5 flex-1 bg-white/10 overflow-hidden">
            <div 
              className="h-full bg-accent transition-all duration-500" 
              style={{ width: `${(filteredTasks.filter(t => t.completed).length / (filteredTasks.length || 1)) * 100}%` }} 
            />
          </div>
        </div>
      </div>
      
      <div className="flex-1 p-3 bg-background flex flex-col gap-2 overflow-hidden">
        <form onSubmit={handleQuickAdd} className="flex items-center gap-2 mb-1">
          <div className="relative flex-1">
            <Plus className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
            <Input 
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="QUICK ADD..." 
              className="pl-7 h-7 bg-muted/30 border-none text-[10px] uppercase font-bold"
            />
          </div>
        </form>

        <div className="flex-1 overflow-y-auto space-y-1 pr-1">
          {displayedTasks.map((task) => (
            <div 
              key={task.id} 
              className="flex items-center gap-3 p-2 bg-card border border-muted hover:border-primary/20 transition-all group"
            >
              <Checkbox 
                checked={task.completed} 
                onCheckedChange={(checked) => updateTask(task.id, { completed: !!checked })}
                className="h-3.5 w-3.5 border-muted-foreground/30"
              />
              <div className="flex flex-col flex-1 min-w-0">
                <span className={`text-[10px] font-bold uppercase truncate ${task.completed ? 'line-through text-muted-foreground/40' : 'text-foreground'}`}>
                  {task.title}
                </span>
              </div>
              <button 
                onClick={() => toggleTaskImportance(task.id)}
                className={cn(
                  "opacity-0 group-hover:opacity-100 transition-opacity",
                  task.isImportant ? "opacity-100 text-accent" : "text-muted-foreground"
                )}
              >
                <Star className={cn("h-3 w-3", task.isImportant && "fill-current")} />
              </button>
            </div>
          ))}
          
          {displayedTasks.length === 0 && (
            <div className="text-center py-10 text-muted-foreground opacity-10">
              <CheckCircle2 className="h-6 w-6 mx-auto mb-1" />
              <p className="text-[8px] font-bold uppercase">Clear View</p>
            </div>
          )}
        </div>

        <button className="w-full py-2 text-center text-[8px] font-bold text-primary hover:bg-primary/5 transition-colors uppercase tracking-[0.2em] mt-auto border-t border-primary/5">
          Synchronized
        </button>
      </div>
    </div>
  )
}