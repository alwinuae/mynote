
"use client"

import * as React from "react"
import { ScribeSyncLayout } from "@/components/ScribeSyncLayout"
import { NoteEditor } from "@/components/NoteEditor"
import { TaskListView } from "@/components/TaskListView"
import { CalendarView } from "@/components/CalendarView"
import { TimelineView } from "@/components/TimelineView"
import { useStore, ThemeVariant } from "@/lib/store"
import { cn } from "@/lib/utils"
import { 
  Plus, 
  Zap, 
  History,
  Star,
  FileText,
  Calendar,
  Settings,
  Palette,
  Trash2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useUser } from "@/firebase"

export default function HomePage() {
  const [mounted, setMounted] = React.useState(false)
  const { user } = useUser()
  const { 
    notes, 
    activeNoteId, 
    setActiveNote, 
    activeView, 
    tasks, 
    addNote, 
    setActiveView, 
    themeVariant,
    setThemeVariant
  } = useStore()

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const renderDashboard = () => (
    <div className="flex-1 flex flex-col overflow-auto bg-background animate-in fade-in duration-500">
      <div className="p-12 space-y-12 max-w-6xl mx-auto w-full">
        <section>
          <div className="flex items-center justify-between mb-10">
            <div>
              <h1 className="text-4xl font-headline font-bold text-foreground mb-2 uppercase tracking-tighter">
                Alwin Note
              </h1>
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.4em] opacity-60">
                Operational Status: {tasks.filter(t => !t.completed).length} Pending Actions
              </p>
            </div>
            {user && (
              <Badge variant="outline" className="text-[10px] uppercase font-bold px-4 py-2 border-primary/20 bg-primary/5">
                Authenticated: {user.email}
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-primary text-primary-foreground border-none shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-xs font-bold uppercase tracking-[0.2em]">Quick Command</CardTitle>
                <CardDescription className="text-primary-foreground/60 text-[10px] uppercase font-bold">New Entry</CardDescription>
              </CardHeader>
              <CardContent className="flex gap-3">
                <Button 
                  className="flex-1 bg-background text-primary hover:bg-background/90 text-[10px] uppercase font-bold h-10"
                  onClick={() => addNote({ title: 'NEW DOCUMENT', content: '', checklistMode: false })}
                >
                  <Plus className="h-4 w-4 mr-2" /> Document
                </Button>
                <Button 
                  variant="secondary" 
                  className="flex-1 text-[10px] uppercase font-bold h-10"
                  onClick={() => setActiveView('all-tasks')}
                >
                  <Plus className="h-4 w-4 mr-2" /> Task Item
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-none border-primary/10 bg-card/40">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Priority Items</CardTitle>
                <Star className="h-4 w-4 text-amber-600 fill-current" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tasks.filter(t => t.isImportant && !t.completed).slice(0, 3).map(task => (
                    <div key={task.id} className="flex items-center justify-between bg-muted/20 p-2 border border-primary/5">
                      <span className="text-[10px] font-bold uppercase truncate">{task.title}</span>
                      <Badge variant="outline" className="text-[8px] uppercase h-4 px-2 border-accent/30 text-accent">Hot</Badge>
                    </div>
                  ))}
                  {tasks.filter(t => t.isImportant && !t.completed).length === 0 && (
                    <p className="text-[10px] text-muted-foreground italic uppercase tracking-wider opacity-30">No critical actions.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-none border-primary/10 bg-card/40">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Registry Stats</CardTitle>
                <Zap className="h-4 w-4 text-amber-600" />
              </CardHeader>
              <CardContent className="flex items-center gap-10 py-2">
                <div>
                  <div className="text-3xl font-bold">{tasks.filter(t => t.completed).length}</div>
                  <div className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">Archived</div>
                </div>
                <div className="h-10 w-[1px] bg-border" />
                <div>
                  <div className="text-3xl font-bold">{notes.length}</div>
                  <div className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">Docs</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-8 border-b border-primary/10 pb-4">
            <h3 className="text-xs font-bold uppercase tracking-[0.3em]">Recent Archive</h3>
            <Button variant="ghost" size="sm" onClick={() => setActiveView('calendar')} className="text-[10px] uppercase font-bold gap-2">
               <Calendar className="h-3.5 w-3.5" /> Open Archive
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.slice(0, 6).map(note => (
              <Card 
                key={note.id} 
                className="cursor-pointer hover:border-primary/40 transition-all bg-card/30 border-primary/10 shadow-none hover:-translate-y-1"
                onClick={() => setActiveNote(note.id)}
              >
                <CardHeader className="p-6 pb-2">
                  <CardTitle className="text-sm font-bold uppercase truncate tracking-tight">{note.title || 'Untitled'}</CardTitle>
                  <CardDescription className="line-clamp-2 text-[10px] font-medium leading-relaxed uppercase opacity-60">
                    {note.content || 'System log empty...'}
                  </CardDescription>
                </CardHeader>
                <CardFooter className="p-6 pt-4 flex items-center justify-between border-t border-primary/5 mt-4">
                  <div className="flex items-center gap-2">
                    <History className="h-3 w-3 text-muted-foreground opacity-40" />
                    <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">
                      {new Date(note.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <FileText className="h-3 w-3 text-primary/20" />
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  )

  const renderContent = () => {
    if (activeNoteId) return <NoteEditor />

    switch (activeView) {
      case 'all-tasks':
      case 'tasks':
      case 'my-day':
      case 'important':
        return <TaskListView />
      case 'calendar':
        return <CalendarView />
      case 'timeline':
        return <TimelineView />
      case 'settings':
        return (
          <div className="p-12 space-y-12 animate-in fade-in max-w-4xl">
             <div className="border-b border-primary/20 pb-6">
                <h2 className="text-3xl font-bold uppercase tracking-tighter">System Configuration</h2>
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-2">Alwin Note v2.5.0-STABLE</p>
             </div>
             
             <div className="space-y-8">
                <section className="space-y-4">
                   <div className="flex items-center gap-3">
                      <Palette className="h-4 w-4 text-primary" />
                      <h3 className="text-sm font-bold uppercase tracking-widest">Visual Theme Gallery</h3>
                   </div>
                   <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {[
                        { id: 'classic', name: 'Classic Sandy', color: 'bg-[#8B4513]' },
                        { id: 'coffee', name: 'Dark Roast', color: 'bg-[#3E2723]' },
                        { id: 'umber', name: 'Raw Umber', color: 'bg-[#634433]' },
                        { id: 'forest', name: 'Deep Forest', color: 'bg-[#1B5E20]' },
                        { id: 'slate', name: 'Blue Slate', color: 'bg-[#37474F]' },
                        { id: 'burgundy', name: 'Royal Burgundy', color: 'bg-[#880E4F]' },
                      ].map((v) => (
                        <button 
                          key={v.id}
                          onClick={() => setThemeVariant(v.id as ThemeVariant)}
                          className={cn(
                            "flex items-center gap-3 p-3 border transition-all text-left",
                            themeVariant === v.id ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-primary/10 hover:bg-primary/5"
                          )}
                        >
                          <div className={cn("h-4 w-4 shrink-0", v.color)} />
                          <span className="text-[10px] font-bold uppercase">{v.name}</span>
                        </button>
                      ))}
                   </div>
                </section>

                <section className="space-y-4 pt-8 border-t border-primary/10">
                   <div className="flex items-center gap-3">
                      <Settings className="h-4 w-4 text-primary" />
                      <h3 className="text-sm font-bold uppercase tracking-widest">Workspace Management</h3>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className="bg-muted/10 border-primary/10 shadow-none">
                         <CardHeader>
                            <CardTitle className="text-[11px] uppercase">Data Integrity</CardTitle>
                            <CardDescription className="text-[10px] uppercase">Reset system to factory defaults.</CardDescription>
                         </CardHeader>
                         <CardContent>
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              className="w-full text-[10px] uppercase font-bold"
                              onClick={() => {
                                if(confirm("Confirm Factory Reset? All records will be permanently purged.")) {
                                  localStorage.clear();
                                  window.location.reload();
                                }
                              }}
                            >
                              Purge All Data
                            </Button>
                         </CardContent>
                      </Card>
                   </div>
                </section>
             </div>
          </div>
        )
      case 'dashboard':
      default:
        return renderDashboard()
    }
  }

  if (!mounted) return null;

  return (
    <ScribeSyncLayout>
      {renderContent()}
    </ScribeSyncLayout>
  )
}
