"use client"

import * as React from "react"
import { useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { extractTasks } from "@/ai/flows/automatic-task-extraction"
import { cn } from "@/lib/utils"
import { 
  BrainCircuit, 
  Trash2, 
  Clock, 
  ListTodo,
  FileText,
  Loader2,
  Check,
  X,
  History,
  AlertTriangle
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"

export function NoteEditor() {
  const { activeNoteId, notes, updateNote, deleteNote, addTask } = useStore()
  const activeNote = notes.find((n) => n.id === activeNoteId)
  const [isExtracting, setIsExtracting] = React.useState(false)
  const [extractedTasks, setExtractedTasks] = React.useState<string[]>([])
  const [selectedTasks, setSelectedTasks] = React.useState<string[]>([])
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = React.useState(false)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  if (!activeNote) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground bg-background">
        <FileText className="h-12 w-12 opacity-5 mb-4" />
        <p className="text-[11px] font-bold uppercase tracking-[0.3em]">No entry selected</p>
      </div>
    )
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && activeNote.checklistMode) {
      e.preventDefault()
      const start = e.currentTarget.selectionStart
      const end = e.currentTarget.selectionEnd
      const value = e.currentTarget.value
      
      const newValue = value.substring(0, start) + "\n- [ ] " + value.substring(end)
      updateNote(activeNote.id, { content: newValue })
      
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 7
        }
      }, 0)
    }
  }

  const handleExtractTasks = async () => {
    if (!activeNote.content.trim()) return
    setIsExtracting(true)
    try {
      const result = await extractTasks({ noteContent: activeNote.content })
      if (result?.tasks?.length > 0) {
        setExtractedTasks(result.tasks)
        setSelectedTasks(result.tasks)
        setIsPreviewOpen(true)
      } else {
        toast({ title: "No tasks found" })
      }
    } catch (error) {
      toast({ title: "AI Error", variant: "destructive" })
    } finally {
      setIsExtracting(false)
    }
  }

  const confirmAddTasks = () => {
    selectedTasks.forEach(taskTitle => {
      addTask({ title: taskTitle, dueDate: new Date().toISOString().split('T')[0] })
    })
    setIsPreviewOpen(false)
    toast({ title: "Tasks synchronized", description: `${selectedTasks.length} items added.` })
  }

  return (
    <div className="flex flex-col h-full bg-background animate-in fade-in duration-300">
      <div className="px-6 h-14 border-b border-primary/10 flex items-center justify-between shrink-0">
        <div className="flex-1 flex items-center gap-6">
          <Input 
            value={activeNote.title}
            onChange={(e) => updateNote(activeNote.id, { title: e.target.value })}
            className="text-xl font-headline font-bold border-none px-0 shadow-none focus-visible:ring-0 h-auto bg-transparent uppercase tracking-tighter"
            placeholder="DOCUMENT TITLE"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost"
            size="sm"
            onClick={() => updateNote(activeNote.id, { checklistMode: !activeNote.checklistMode })}
            className={cn("h-9 gap-2 font-bold text-[10px] uppercase tracking-widest", activeNote.checklistMode && "text-primary bg-primary/5")}
          >
            <ListTodo className="h-3.5 w-3.5" />
            Checklist
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-9 text-[10px] font-bold uppercase gap-2 border-primary/20 hover:bg-primary/5"
            onClick={handleExtractTasks}
            disabled={isExtracting}
          >
            {isExtracting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <BrainCircuit className="h-3.5 w-3.5" />}
            AI Parse
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-9 w-9 text-destructive hover:bg-destructive/10"
            onClick={() => setIsDeleteConfirmOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <Textarea 
          ref={textareaRef}
          value={activeNote.content}
          onKeyDown={handleKeyDown}
          onChange={(e) => updateNote(activeNote.id, { content: e.target.value })}
          className="w-full h-full border-none shadow-none focus-visible:ring-0 text-[13px] leading-relaxed resize-none p-8 bg-transparent font-code selection:bg-primary/20"
          placeholder="COMMENCE DOCUMENTATION..."
        />
      </div>

      <div className="px-6 h-10 border-t border-primary/10 flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] bg-muted/10">
        <div className="flex gap-8">
          <span className="flex items-center gap-2">
            <FileText className="h-3.5 w-3.5 opacity-40" />
            Words: {activeNote.content.split(/\s+/).filter(Boolean).length}
          </span>
          <div className="flex items-center gap-2">
             <History className="h-3.5 w-3.5 opacity-40" />
             <span>Modified: {new Date(activeNote.updatedAt).toLocaleTimeString()}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-primary/60">
          <Clock className="h-3.5 w-3.5" />
          <span>Synchronized</span>
        </div>
      </div>

      {/* Delete Confirmation */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[400px] border-destructive/20 bg-card">
          <DialogHeader>
            <div className="h-10 w-10 bg-destructive/10 flex items-center justify-center mb-4">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <DialogTitle className="text-sm font-bold uppercase tracking-widest">Confirm Deletion</DialogTitle>
            <DialogDescription className="text-[11px] uppercase text-muted-foreground mt-2">
              This action will permanently remove "{activeNote.title}" from the repository. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 mt-4">
            <Button variant="ghost" size="sm" onClick={() => setIsDeleteConfirmOpen(false)} className="text-[10px] uppercase font-bold">Cancel</Button>
            <Button variant="destructive" size="sm" onClick={() => {
              deleteNote(activeNote.id)
              setIsDeleteConfirmOpen(false)
            }} className="text-[10px] uppercase font-bold">Delete Permanent</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Extraction Preview */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="sm:max-w-[400px] border-primary/20 bg-card">
          <DialogHeader>
            <DialogTitle className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Review Extracted Actions</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-6 max-h-[50vh] overflow-auto">
            {extractedTasks.map((task, idx) => (
              <div key={idx} className="flex items-center gap-4 p-3 bg-muted/20 border border-primary/5 hover:border-primary/20 transition-colors">
                <Checkbox 
                  checked={selectedTasks.includes(task)}
                  onCheckedChange={(checked) => {
                    setSelectedTasks(prev => checked ? [...prev, task] : prev.filter(t => t !== task))
                  }}
                />
                <Input 
                  value={task}
                  onChange={(e) => {
                    const newTasks = [...extractedTasks]
                    newTasks[idx] = e.target.value
                    setExtractedTasks(newTasks)
                    // If it was selected, update selection too
                    if (selectedTasks.includes(task)) {
                      setSelectedTasks(prev => prev.map(t => t === task ? e.target.value : t))
                    }
                  }}
                  className="bg-transparent border-none text-[11px] uppercase font-bold h-auto p-0 focus-visible:ring-0"
                />
              </div>
            ))}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" size="sm" onClick={() => setIsPreviewOpen(false)} className="text-[10px] uppercase font-bold">Discard</Button>
            <Button size="sm" onClick={confirmAddTasks} disabled={selectedTasks.length === 0} className="text-[10px] uppercase font-bold">Synchronize</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}