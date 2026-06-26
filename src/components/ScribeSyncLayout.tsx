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
  LogIn,
  Search
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
  SidebarTrigger,
  useSidebar
} from "@/components/ui/sidebar"
import { Switch } from "@/components/ui/switch"
import { useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useUser, useAuth } from "@/firebase"
import { initiateAnonymousSignIn, signOutUser } from "@/firebase/non-blocking-login"
import { SearchOverlay } from "@/components/SearchOverlay"

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
    themeVariant,
    addProject
  } = useStore()
  const [isSearchOpen, setIsSearchOpen] = React.useState(false)
  const [isProjectDialogOpen, setIsProjectDialogOpen] = React.useState(false)
  const [projectName, setProjectName] = React.useState("")

  const handleAddProject = (event: React.FormEvent) => {
    event.preventDefault()
    const name = projectName.trim()
    if (!name) return
    addProject(name)
    setProjectName("")
    setIsProjectDialogOpen(false)
  }

  React.useEffect(() => {
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
        setIsSearchOpen(true)
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setIsSearchOpen(true)
      }
      if (e.key === '/' && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault()
        setIsSearchOpen(true)
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

  return (
    <SidebarProvider defaultOpen={true}>
      <div className={cn(
        "flex min-h-screen w-full bg-background overflow-hidden font-body transition-all duration-300",
        theme
      )}>
        <AppSidebar onAddProject={() => setIsProjectDialogOpen(true)} />
        <main className="flex-1 flex flex-col min-h-0 relative">
          <header className="min-h-14 border-b border-primary/20 flex items-center justify-between gap-3 px-3 sm:px-6 py-2 bg-background z-40 shrink-0">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <SidebarTrigger className="h-9 w-9" />
              <div className="hidden sm:block h-4 w-[1px] bg-primary/20 mx-1" />
              <h2 className="text-[10px] sm:text-[11px] font-headline font-bold text-foreground tracking-[0.18em] sm:tracking-[0.4em] uppercase truncate min-w-0">
                {headerTitle}
              </h2>
            </div>
            <div className="flex items-center gap-2 sm:gap-6 shrink-0">
              <div className="hidden lg:flex items-center gap-2 text-[9px] text-muted-foreground font-black uppercase tracking-[0.2em] border-r border-primary/10 pr-6 mr-2">
                <Command className="h-3 w-3 opacity-40" />
                <span>Ctrl+K Search | Alt+T Archive</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() => setIsSearchOpen(true)}
                aria-label="Open search"
              >
                <Search className="h-4 w-4" />
              </Button>
              <div className="hidden sm:flex items-center gap-2 bg-muted/40 px-3 py-1.5 border border-primary/10">
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
        {isSearchOpen && <SearchOverlay onClose={() => setIsSearchOpen(false)} />}
        <Dialog open={isProjectDialogOpen} onOpenChange={setIsProjectDialogOpen}>
          <DialogContent className="sm:max-w-[420px] border-primary/20 bg-card">
            <form onSubmit={handleAddProject}>
              <DialogHeader>
                <DialogTitle className="text-sm font-bold uppercase tracking-widest">Add Project</DialogTitle>
                <DialogDescription className="text-[11px] uppercase text-muted-foreground">
                  Create a task silo for related actions.
                </DialogDescription>
              </DialogHeader>
              <Input
                value={projectName}
                onChange={(event) => setProjectName(event.target.value)}
                placeholder="PROJECT NAME"
                className="mt-6 h-11 uppercase font-bold"
                autoFocus
              />
              <DialogFooter className="gap-2 mt-6">
                <Button type="button" variant="ghost" size="sm" onClick={() => setIsProjectDialogOpen(false)} className="text-[10px] uppercase font-bold">
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={!projectName.trim()} className="text-[10px] uppercase font-bold">
                  Create
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </SidebarProvider>
  )
}

function AppSidebar({ onAddProject }: { onAddProject: () => void }) {
  const {
    notes,
    setActiveNote,
    activeNoteId,
    addNote,
    activeView,
    setActiveView,
    projects,
    activeProjectId,
    setActiveProjectId
  } = useStore()
  const { user } = useUser()
  const auth = useAuth()
  const { isMobile, setOpenMobile } = useSidebar()

  const closeMobileSidebar = React.useCallback(() => {
    if (isMobile) setOpenMobile(false)
  }, [isMobile, setOpenMobile])

  const navigate = React.useCallback((action: () => void) => {
    action()
    closeMobileSidebar()
  }, [closeMobileSidebar])

  const openProjectDialog = () => {
    closeMobileSidebar()
    window.setTimeout(onAddProject, 0)
  }

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', color: undefined },
    { id: 'all-tasks', icon: CheckSquare, label: 'Task Repository', color: undefined },
    { id: 'my-day', icon: Zap, label: 'My Day Plan', color: 'text-amber-600' },
    { id: 'calendar', icon: CalendarIcon, label: 'Date Archive', color: undefined },
    { id: 'timeline', icon: ListIcon, label: 'Temporal Registry', color: undefined },
  ] as const

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
                onClick={() => navigate(() => setActiveView(item.id))}
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
            aria-label="Add project"
            onClick={openProjectDialog}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
        
        <SidebarMenu className="group-data-[collapsible=icon]:hidden">
          {projects.map((proj) => (
            <SidebarMenuItem key={proj.id}>
              <SidebarMenuButton 
                isActive={activeView === 'tasks' && activeProjectId === proj.id && !activeNoteId} 
                onClick={() => navigate(() => setActiveProjectId(proj.id))}
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
            aria-label="Add note"
            onClick={() => navigate(() => addNote({ title: 'NEW DOCUMENT', content: '', checklistMode: false }))}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
        
        <SidebarMenu className="group-data-[collapsible=icon]:hidden">
          {notes.slice(0, 12).map((note) => (
            <SidebarMenuItem key={note.id}>
              <SidebarMenuButton 
                isActive={activeNoteId === note.id} 
                onClick={() => navigate(() => setActiveNote(note.id))}
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
             <SidebarMenuButton className="h-10 text-destructive hover:bg-destructive/5" onClick={() => { if (auth) signOutUser(auth); closeMobileSidebar(); }}>
              <LogOut className="h-4 w-4" />
              <span className="text-[10px] uppercase font-black tracking-widest">Terminate Session</span>
            </SidebarMenuButton>
          ) : auth ? (
             <SidebarMenuButton className="h-10 hover:bg-primary/5" onClick={() => { initiateAnonymousSignIn(auth); closeMobileSidebar(); }}>
              <LogIn className="h-4 w-4" />
              <span className="text-[10px] uppercase font-black tracking-widest">System Login</span>
            </SidebarMenuButton>
          ) : null}
          <SidebarMenuButton className="h-10 hover:bg-primary/5" onClick={() => navigate(() => setActiveView('settings'))}>
            <Settings className="h-4 w-4" />
            <span className="text-[10px] uppercase font-black tracking-widest">Configuration</span>
          </SidebarMenuButton>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
