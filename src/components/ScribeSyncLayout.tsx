"use client"

import * as React from "react"
import { 
  CheckSquare, 
  LayoutDashboard,
  Sun,
  Moon,
  Zap,
  Library,
  Settings,
  Plus,
  Calendar as CalendarIcon,
  List as ListIcon,
  FolderOpen,
  Command,
  LogOut,
  LogIn
} from "lucide-react"
import { cn } from "@/lib/utils"
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem, 
  SidebarProvider,
  SidebarTrigger
} from "@/components/ui/sidebar"
import { Switch } from "@/components/ui/switch"
import { useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { useUser, useAuth } from "@/firebase"
import { initiateAnonymousSignIn, signOutUser } from "@/firebase/non-blocking-login"

export function ScribeSyncLayout({ children }: { children: React.ReactNode }) {
  const {
    theme,
    setTheme,
    activeView,
    setActiveView,
    activeNoteId,
    notes,
    activeProjectId,
    projects,
    themeVariant
  } = useStore()
  const { user } = useUser()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    root.setAttribute('data-theme-variant', themeVariant);
  }, [theme, themeVariant]);

  // Global Keyboard Shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === 't') {
        e.preventDefault()
        setActiveView('all-tasks')
      }
      if (e.altKey && e.key.toLowerCase() === 'f') {
        e.preventDefault()
        const searchInput = document.querySelector('input[placeholder*="SCAN"]') as HTMLInputElement
        if (searchInput) searchInput.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [setActiveView])

  const activeNote = notes.find(n => n.id === activeNoteId)
  const activeProject = projects.find(p => p.id === activeProjectId)
  
  const headerTitle = activeNote ? activeNote.title : {
    'dashboard': 'ALWIN DASHBOARD',
    'all-tasks': 'TASKS REPOSITORY',
    'tasks': activeProject?.title || 'TASK REPOSITORY',
    'my-day': 'MY DAY PLANNER',
    'important': 'PRIORITY MATRIX',
    'calendar': 'DATE ARCHIVE',
    'timeline': 'TEMPORAL REGISTRY',
    'settings': 'SYSTEM PREFERENCES'
  }[activeView] || 'ALWIN NOTE'

  if (!mounted) return null;

  return (
    <SidebarProvider defaultOpen={true}>
      <div className={cn(
        "flex min-h-screen w-full bg-background overflow-hidden font-body transition-all duration-300",
        theme
      )}>
        <AppSidebar />
        <main className="flex-1 flex flex-col min-h-0 relative">
          <header className="h-14 border-b border-primary/20 flex items-center justify-between px-6 bg-background z-40 shrink-0">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="h-9 w-9" />
              <div className="h-4 w-[1px] bg-primary/20 mx-1" />
              <h2 className="text-[11px] font-headline font-bold text-foreground tracking-[0.4em] uppercase">
                {headerTitle}
              </h2>
            </div>
            <div className="flex items-center gap-6">
              <div className="hidden lg:flex items-center gap-2 text-[9px] text-muted-foreground font-black uppercase tracking-[0.2em] border-r border-primary/10 pr-6 mr-2">
                <Command className="h-3 w-3 opacity-40" />
                <span>Alt+F Scan | Alt+T Archive</span>
              </div>
              <div className="flex items-center gap-2 bg-muted/40 px-3 py-1.5 border border-primary/10">
                <Sun className={cn("h-3 w-3", theme === 'light' ? "text-primary" : "text-muted-foreground")} />
                <Switch 
                  checked={theme === 'dark'} 
                  onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')} 
                  className="scale-75"
                />
                <Moon className={cn("h-3 w-3", theme === 'dark' ? "text-primary" : "text-muted-foreground")} />
              </div>
            </div>
          </header>
          <div className="flex-1 overflow-auto bg-[#fdfcfb] dark:bg-background">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}

function AppSidebar() {
  const {
    notes,
    setActiveNote,
    activeNoteId,
    addNote,
    activeView,
    setActiveView,
    projects,
    activeProjectId,
    setActiveProjectId,
    addProject
  } = useStore()
  const { user } = useUser()
  const auth = useAuth()

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'all-tasks', icon: CheckSquare, label: 'Task Repository' },
    { id: 'my-day', icon: Zap, label: 'My Day Plan', color: 'text-amber-600' },
    { id: 'calendar', icon: CalendarIcon, label: 'Date Archive' },
    { id: 'timeline', icon: ListIcon, label: 'Temporal Registry' },
  ]

  return (
    <Sidebar collapsible="icon" className="border-r border-primary/20 bg-sidebar shadow-none">
      <SidebarHeader className="p-4 mb-2">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-primary flex items-center justify-center shadow-lg">
            <Library className="h-5 w-5 text-primary-foreground fill-current" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="font-headline font-black text-xs tracking-[0.2em] uppercase leading-none">Alwin Note</span>
            <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-[0.3em] mt-1">v2.5.0-STABLE</span>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-2 scrollbar-hide">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton 
                isActive={activeView === item.id && !activeNoteId} 
                onClick={() => setActiveView(item.id as any)}
                className="h-10 transition-all hover:bg-primary/5"
              >
                <item.icon className={cn("h-4 w-4", item.color)} />
                <span className="text-[10px] uppercase font-black tracking-widest">{item.label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>

        <div className="mt-8 mb-3 px-4 flex items-center justify-between group-data-[collapsible=icon]:hidden">
          <h3 className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em] opacity-50">Project Silos</h3>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-5 w-5 hover:bg-primary/10 text-primary"
            onClick={() => {
              const name = prompt("Enter project name:")
              if (name) addProject(name)
            }}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
        
        <SidebarMenu className="group-data-[collapsible=icon]:hidden">
          {projects.map((proj) => (
            <SidebarMenuItem key={proj.id}>
              <SidebarMenuButton 
                isActive={activeView === 'tasks' && activeProjectId === proj.id && !activeNoteId} 
                onClick={() => setActiveProjectId(proj.id)}
                className="pl-4 h-8"
              >
                <FolderOpen className="h-3.5 w-3.5 mr-2 opacity-40" />
                <span className="truncate text-[9px] uppercase font-black tracking-tighter">{proj.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>

        <div className="mt-8 mb-3 px-4 flex items-center justify-between group-data-[collapsible=icon]:hidden">
          <h3 className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em] opacity-50">Active Documents</h3>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-5 w-5 hover:bg-primary/10 text-primary"
            onClick={() => addNote({ title: 'NEW DOCUMENT', content: '', checklistMode: false })}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
        
        <SidebarMenu className="group-data-[collapsible=icon]:hidden">
          {notes.slice(0, 12).map((note) => (
            <SidebarMenuItem key={note.id}>
              <SidebarMenuButton 
                isActive={activeNoteId === note.id} 
                onClick={() => setActiveNote(note.id)}
                className="pl-4 h-8"
              >
                <div className={cn("h-1.5 w-1.5 mr-2", activeNoteId === note.id ? "bg-primary" : "bg-primary/10")} />
                <span className="truncate text-[9px] uppercase font-bold text-muted-foreground/80">{note.title || 'Untitled'}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-2 border-t border-primary/10 bg-muted/5">
        <div className="space-y-1">
          {user ? (
             <SidebarMenuButton className="h-10 text-destructive hover:bg-destructive/5" onClick={() => signOutUser(auth)}>
              <LogOut className="h-4 w-4" />
              <span className="text-[10px] uppercase font-black tracking-widest">Terminate Session</span>
            </SidebarMenuButton>
          ) : (
             <SidebarMenuButton className="h-10 hover:bg-primary/5" onClick={() => initiateAnonymousSignIn(auth)}>
              <LogIn className="h-4 w-4" />
              <span className="text-[10px] uppercase font-black tracking-widest">System Login</span>
            </SidebarMenuButton>
          )}
          <SidebarMenuButton className="h-10 hover:bg-primary/5" onClick={() => setActiveView('settings')}>
            <Settings className="h-4 w-4" />
            <span className="text-[10px] uppercase font-black tracking-widest">Configuration</span>
          </SidebarMenuButton>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
