"use client"

import * as React from "react"
import { Search, BrainCircuit, Loader2, FileText, ChevronRight, X } from "lucide-react"
import { semanticNoteSearch } from "@/ai/flows/semantic-note-search"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useStore } from "@/lib/store"
import { Badge } from "@/components/ui/badge"

export function SearchOverlay({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = React.useState("")
  const [results, setResults] = React.useState<any[]>([])
  const [isSearching, setIsSearching] = React.useState(false)
  const { setActiveNote } = useStore()

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setIsSearching(true)
    try {
      const { notes } = await semanticNoteSearch({ searchQuery: query })
      setResults(notes)
    } catch (error) {
      console.error(error)
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-start justify-center pt-[10vh]">
      <div className="w-full max-w-2xl bg-card border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
        <div className="p-4 border-b flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <form onSubmit={handleSearch}>
              <Input 
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search semantically (e.g., 'plans for my house')" 
                className="pl-10 h-12 text-lg border-none shadow-none focus-visible:ring-0"
              />
            </form>
          </div>
          <div className="flex items-center gap-2">
            {isSearching ? (
              <Loader2 className="h-5 w-5 animate-spin text-accent" />
            ) : (
              <Badge variant="outline" className="bg-accent/5 text-accent border-accent/20 flex items-center gap-1">
                <BrainCircuit className="h-3.5 w-3.5" />
                AI Enhanced
              </Badge>
            )}
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="max-h-[60vh] overflow-auto">
          {results.length > 0 ? (
            <div className="p-2">
              <div className="px-4 py-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">Semantic Matches</div>
              {results.map((note) => (
                <button
                  key={note.noteId}
                  onClick={() => {
                    setActiveNote(note.noteId)
                    onClose()
                  }}
                  className="w-full flex items-center gap-4 p-4 hover:bg-primary/5 rounded-xl transition-colors text-left group"
                >
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-foreground group-hover:text-primary transition-colors">{note.title}</h4>
                    <p className="text-sm text-muted-foreground truncate">{note.content}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          ) : query && !isSearching ? (
            <div className="p-12 text-center text-muted-foreground">
              <p>No semantic matches found for "{query}"</p>
            </div>
          ) : (
            <div className="p-8">
              <h5 className="text-xs font-bold text-muted-foreground uppercase mb-4 tracking-widest">Try searching for:</h5>
              <div className="flex flex-wrap gap-2">
                {["Work milestones", "Home projects", "Gift ideas", "Client meetings"].map(suggestion => (
                  <Button 
                    key={suggestion} 
                    variant="outline" 
                    size="sm" 
                    className="rounded-full hover:bg-primary/5"
                    onClick={() => setQuery(suggestion)}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="p-4 bg-muted/30 text-[10px] text-muted-foreground flex items-center justify-center gap-1">
          <BrainCircuit className="h-3 w-3" />
          <span>Powered by ScribeSync Semantic AI</span>
        </div>
      </div>
    </div>
  )
}