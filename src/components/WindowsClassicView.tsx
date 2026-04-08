
"use client"

import * as React from "react"
import { useStore } from "@/lib/store"
import { 
  File, 
  X, 
  Minus, 
  Square,
  Terminal,
  Save,
  Trash,
  FolderOpen,
  Scissors,
  Copy,
  Clipboard,
  Play,
  Search
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"

export function WindowsClassicView() {
  const { notes, activeNoteId, setActiveNote, updateNote, addNote, deleteNote } = useStore()
  const [activeTabId, setActiveTabId] = React.useState<string | null>(activeNoteId)
  const [mounted, setMounted] = React.useState(false)
  
  // Robust active note selection for Classic Mode
  const activeNote = React.useMemo(() => {
    return notes.find(n => n.id === activeTabId) || notes.find(n => n.id === activeNoteId) || notes[0]
  }, [notes, activeTabId, activeNoteId])

  React.useEffect(() => {
    setMounted(true)
    if (activeNoteId) setActiveTabId(activeNoteId)
  }, [activeNoteId])

  if (!mounted) return null;

  const lineCount = activeNote?.content?.split('\n').length || 1

  const handleSave = () => {
    if (!activeNote) return
    toast({
      title: "File Saved",
      description: `${activeNote.title || 'Document'} has been synchronized.`,
      className: "bg-[#252526] text-white border-blue-500"
    })
  }

  return (
    <div className="h-full bg-[#0c0c0c] flex flex-col font-code text-blue-300 overflow-hidden border-2 border-[#1e1e1e] select-none animate-in fade-in duration-500">
      <div className="h-9 bg-gradient-to-b from-[#333] to-[#1a1a1a] flex items-center justify-between px-2 border-b border-[#000] shadow-inner shrink-0">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 bg-blue-600 rounded-sm flex items-center justify-center shadow-lg">
            <Terminal className="h-3 w-3 text-white" />
          </div>
          <span className="text-[11px] font-bold text-gray-300 drop-shadow-md">
            ScribeSync v2.5 - {activeNote?.title || 'new_entry.txt'}
          </span>
        </div>
        <div className="flex items-center h-full">
          <button className="h-full w-12 flex items-center justify-center hover:bg-[#444] text-gray-400 transition-colors"><Minus className="h-3.5 w-3.5" /></button>
          <button className="h-full w-12 flex items-center justify-center hover:bg-[#444] text-gray-400 transition-colors"><Square className="h-3 w-3" /></button>
          <button className="h-full w-14 flex items-center justify-center hover:bg-[#e81123] hover:text-white text-gray-400 transition-colors"><X className="h-4 w-4" /></button>
        </div>
      </div>

      <div className="h-7 bg-[#efefef] dark:bg-[#252526] flex items-center px-1 border-b border-[#333] gap-1 shadow-sm overflow-hidden shrink-0">
        {['File', 'Edit', 'Search', 'View', 'Settings', 'Run', 'Help'].map(menu => (
          <button key={menu} className="text-[11px] px-2.5 py-1 hover:bg-[#3e3e42] hover:text-white text-gray-400 rounded transition-colors cursor-default whitespace-nowrap">
            {menu}
          </button>
        ))}
      </div>

      <div className="h-11 bg-[#f0f0f0] dark:bg-[#2d2d2d] flex items-center px-2 border-b border-[#333] gap-1.5 shadow-sm shrink-0">
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded hover:bg-[#3e3e42]" onClick={() => addNote({ title: 'untitled.txt', content: '' })}>
          <File className="h-4 w-4 text-gray-400" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded hover:bg-[#3e3e42]">
          <FolderOpen className="h-4 w-4 text-amber-500" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded hover:bg-[#3e3e42]" onClick={handleSave} disabled={!activeNote}>
          <Save className="h-4 w-4 text-blue-500" />
        </Button>
        <div className="w-[1px] h-6 bg-[#444] mx-1" />
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded hover:bg-[#3e3e42]">
          <Scissors className="h-4 w-4 text-gray-400" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded hover:bg-[#3e3e42]">
          <Copy className="h-4 w-4 text-gray-400" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded hover:bg-[#3e3e42]">
          <Clipboard className="h-4 w-4 text-gray-400" />
        </Button>
        <div className="w-[1px] h-6 bg-[#444] mx-1" />
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded hover:bg-red-900/20" onClick={() => activeNote && deleteNote(activeNote.id)} disabled={!activeNote}>
          <Trash className="h-4 w-4 text-red-500" />
        </Button>
        <div className="flex-1" />
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded hover:bg-green-900/20 text-green-500">
          <Play className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-56 bg-[#1e1e1e] border-r border-[#333] flex flex-col shadow-2xl shrink-0">
          <div className="p-2.5 text-[10px] uppercase font-bold text-gray-500 border-b border-[#333] flex items-center justify-between">
            <span>Project Explorer</span>
            <Search className="h-3 w-3 cursor-pointer hover:text-white" />
          </div>
          <div className="flex-1 overflow-auto py-1">
            {notes.map(note => (
              <button
                key={note.id}
                onClick={() => {
                  setActiveTabId(note.id)
                  // We stay in Classic View but sync the note ID
                  setActiveNote(note.id)
                }}
                className={cn(
                  "w-full text-left px-4 py-1.5 text-[12px] truncate hover:bg-[#2d2d2d] flex items-center gap-2 transition-all",
                  activeNote?.id === note.id ? "bg-[#37373d] text-white" : "text-gray-500"
                )}
              >
                <File className={cn("h-3 w-3", activeNote?.id === note.id ? "text-blue-400" : "text-gray-600")} />
                {note.title || 'Untitled'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-[#1e1e1e] relative min-w-0">
          <div className="h-8 flex bg-[#2d2d2d] border-b border-[#333] px-1 overflow-x-auto shrink-0 scrollbar-hide">
             {notes.slice(0, 8).map(note => (
               <div 
                 key={note.id}
                 onClick={() => {
                    setActiveTabId(note.id)
                    setActiveNote(note.id)
                 }}
                 className={cn(
                   "px-4 h-full flex items-center gap-2 text-[11px] border-r border-[#333] cursor-pointer transition-all whitespace-nowrap shrink-0",
                   activeNote?.id === note.id 
                    ? "bg-[#1e1e1e] border-t-2 border-t-blue-500 text-white font-bold" 
                    : "bg-[#2d2d2d] text-gray-500 hover:bg-[#333]"
                 )}
               >
                  <File className="h-3 w-3" />
                  {note.title || 'Untitled'}
               </div>
             ))}
          </div>

          <div className="flex-1 flex overflow-hidden relative">
            <div className="w-14 bg-[#1e1e1e] text-right pr-4 pt-4 text-gray-600 text-[12px] select-none border-r border-[#333] font-code shrink-0">
              {Array.from({ length: Math.max(lineCount + 20, 40) }).map((_, i) => (
                <div key={i} className="h-6 flex items-center justify-end leading-none">{i + 1}</div>
              ))}
            </div>

            {activeNote ? (
              <Textarea 
                value={activeNote.content}
                onChange={(e) => updateNote(activeNote.id, { content: e.target.value })}
                className="flex-1 bg-transparent border-none text-[#9cdcfe] font-code p-4 resize-none focus-visible:ring-0 leading-6 caret-white text-[14px] selection:bg-blue-900/50"
                placeholder="/* ScribeSync++ - Start writing your document here... */"
              />
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-600 italic">
                No file selected
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="h-6 bg-[#007acc] flex items-center justify-between px-4 text-[11px] text-white font-medium select-none shadow-[0_-2px_5px_rgba(0,0,0,0.5)] z-20 shrink-0">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1"><Terminal className="h-3 w-3" /> Ready</span>
          <span className="bg-blue-800 px-2 h-full flex items-center">Ln: {lineCount}, Col: 1</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hover:bg-blue-800 px-2 cursor-pointer transition-colors">UTF-8</span>
          <span className="hover:bg-blue-800 px-2 cursor-pointer transition-colors font-bold uppercase">TypeScript</span>
        </div>
      </div>
    </div>
  )
}
