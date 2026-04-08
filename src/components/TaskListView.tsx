"use client"

import * as React from "react"
import { useStore, Task, ProjectList } from "@/lib/store"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, 
  Star, 
  Calendar as CalendarIcon, 
  Trash2, 
  LayoutList,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  X,
  PlusCircle,
  RotateCcw,
  Archive,
  Layers
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

export function TaskListView() {
  const { 
    tasks, 
    activeView, 
    activeProjectId,
    projects,
    updateTask, 
    toggleTaskImportance, 
    addTask, 
    deleteTask,
    addTaskStep,
    updateTaskStep,
    toggleTaskStep,
    deleteTaskStep 
  } = useStore()
  
  const [inlineTask, setInlineTask] = React.useState("")
  const [selectedProjectId, setSelectedProjectId] = React.useState(activeProjectId)
  const [editingTaskId, setEditingTaskId] = React.useState<string | null>(null)
  const [newStep, setNewStep] = React.useState("")
  const [showCompleted, setShowCompleted] = React.useState(false)

  React.useEffect(() => {
    setSelectedProjectId(activeProjectId)
  }, [activeProjectId])

  const today = new Date().toISOString().split('T')[0]

  const filteredTasks = React.useMemo(() => {
    let list = tasks.filter(t => !t.completed)
    
    if (activeView === 'my-day') {
      return list.filter(t => t.dueDate === today)
    }
    if (activeView === 'important') {
      return list.filter(t => t.isImportant)
    }
    if (activeView === 'tasks') {
      return list.filter(t => t.listId === activeProjectId)
    }
    return list
  }, [tasks, activeView, activeProjectId, today])

  const completedTasks = React.useMemo(() => {
    let list = tasks.filter(t => t.completed)
    if (activeView === 'tasks') return list.filter(t => t.listId === activeProjectId)
    if (activeView === 'my-day') return list.filter(t => t.dueDate === today)
    return list
  }, [tasks, activeView, activeProjectId, today])

  const handleInlineAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inlineTask.trim()) return
    addTask({ 
      title: inlineTask, 
      listId: selectedProjectId,
      dueDate: today
    })
    setInlineTask("")
  }

  const handleAddStep = (taskId: string) => {
    if (!newStep.trim()) return
    addTaskStep(taskId, newStep)
    setNewStep("")
  }

  const StepInput = ({ taskId, step }: { taskId: string, step: any }) => {
    const [val, setVal] = React.useState(step.title)
    return (
      <Input 
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onBlur={() => updateTaskStep(taskId, step.id, val)}
        onKeyDown={(e) => e.key === 'Enter' && updateTaskStep(taskId, step.id, val)}
        className="bg-transparent border-none text-[11px] uppercase font-bold h-auto p-0 focus-visible:ring-0"
      />
    )
  }

  const TaskItem = ({ task }: { task: Task }) => (
    <div className="group bg-card transition-all">
      <div className="flex items-center gap-6 px-8 py-4 border-b border-primary/5">
        <Checkbox 
          checked={task.completed} 
          onCheckedChange={(checked) => updateTask(task.id, { completed: !!checked })}
          className="h-5 w-5 border-primary/30"
        />
        <div className="flex-1 min-w-0" onClick={() => setEditingTaskId(editingTaskId === task.id ? null : task.id)}>
          <span className={cn(
            "text-[13px] font-bold block truncate transition-colors uppercase tracking-tight",
            task.completed ? "line-through text-muted-foreground/40 font-normal" : "text-foreground"
          )}>
            {task.title}
          </span>
          <div className="flex items-center gap-6 mt-1 text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
            <div className="flex items-center gap-2 group/date">
              <CalendarIcon className="h-4 w-4 text-primary" />
              <input 
                type="date" 
                value={task.dueDate || ""} 
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => updateTask(task.id, { dueDate: e.target.value })}
                className="bg-transparent border-none outline-none focus:text-primary cursor-pointer font-bold text-foreground"
              />
            </div>
            {activeView !== 'tasks' && (
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary/60" />
                <span>{projects.find(p => p.id === task.listId)?.title || 'UNCATEGORIZED'}</span>
              </div>
            )}
            {task.steps.length > 0 && (
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary/60" />
                {task.steps.filter(s => s.completed).length}/{task.steps.length}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => toggleTaskImportance(task.id)}
          >
            <Star className={cn("h-4 w-4", task.isImportant ? "text-accent fill-current" : "text-muted-foreground/20")} />
          </Button>
          {!task.completed && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100"
              onClick={() => deleteTask(task.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          {task.completed && (
             <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-primary"
              onClick={() => updateTask(task.id, { completed: false })}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingTaskId(editingTaskId === task.id ? null : task.id)}>
            {editingTaskId === task.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {editingTaskId === task.id && (
        <div className="border-b border-primary/10 px-14 py-4 space-y-4 bg-muted/5 animate-in slide-in-from-top-1 duration-200">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Detailed Steps</p>
          <div className="space-y-2">
            {task.steps.map(step => (
              <div key={step.id} className="flex items-center gap-4 py-1 group/step">
                <Checkbox 
                  checked={step.completed} 
                  onCheckedChange={() => toggleTaskStep(task.id, step.id)}
                  className="h-4 w-4"
                />
                <div className={cn("flex-1", step.completed && "opacity-40")}>
                  <StepInput taskId={task.id} step={step} />
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover/step:opacity-100" onClick={() => deleteTaskStep(task.id, step.id)}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
            <div className="flex items-center gap-3 pt-2 mt-2">
              <PlusCircle className="h-4 w-4 text-primary/40" />
              <Input 
                value={newStep}
                onChange={(e) => setNewStep(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddStep(task.id)}
                placeholder="ADD NEW SUB-ACTION..."
                className="h-8 bg-transparent border-none text-[11px] uppercase font-bold p-0 placeholder:text-muted-foreground/20 focus-visible:ring-0"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="px-8 h-14 border-b border-primary/10 flex items-center justify-between sticky top-0 z-30 bg-background/80 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <LayoutList className="h-4 w-4 text-primary" />
          <h1 className="text-[11px] font-bold uppercase tracking-[0.3em]">{activeView.replace('-', ' ')}</h1>
        </div>
        <Badge variant="outline" className="text-[10px] font-bold border-primary/20 px-3">{filteredTasks.length} PENDING</Badge>
      </div>

      <div className="px-8 py-3 border-b bg-muted/10 border-primary/5 flex items-center gap-4">
        <Plus className="h-4 w-4 text-primary" />
        <form onSubmit={handleInlineAdd} className="flex-1 flex items-center gap-3">
          <Input 
            value={inlineTask}
            onChange={(e) => setInlineTask(e.target.value)}
            placeholder="ADD NEW RECORD (PRESS ENTER)..." 
            className="flex-1 h-10 bg-transparent border-none shadow-none focus-visible:ring-0 text-[12px] font-bold placeholder:text-muted-foreground/30 p-0 uppercase tracking-tight"
          />
          <div className="w-48">
            <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
              <SelectTrigger className="h-8 text-[9px] font-bold uppercase border-primary/10 bg-background/50">
                <SelectValue placeholder="LIST" />
              </SelectTrigger>
              <SelectContent>
                {projects.map(p => (
                  <SelectItem key={p.id} value={p.id} className="text-[9px] uppercase font-bold">{p.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </form>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="flex flex-col">
          {filteredTasks.map((task) => <TaskItem key={task.id} task={task} />)}

          {filteredTasks.length === 0 && (
            <div className="py-24 text-center opacity-10">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-4" />
              <p className="text-[11px] font-bold uppercase tracking-[0.4em]">All Records Processed</p>
            </div>
          )}

          {completedTasks.length > 0 && (
            <div className="mt-8">
              <button 
                onClick={() => setShowCompleted(!showCompleted)}
                className="w-full flex items-center gap-3 px-8 py-3 bg-muted/20 hover:bg-muted/30 transition-colors text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground"
              >
                {showCompleted ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                Archive Repository ({completedTasks.length})
              </button>
              {showCompleted && (
                <div className="opacity-80">
                  {completedTasks.map((task) => <TaskItem key={task.id} task={task} />)}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}