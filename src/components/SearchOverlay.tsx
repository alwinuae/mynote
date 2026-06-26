"use client"

import * as React from "react"
import { Search, BrainCircuit, Loader2, FileText, ChevronRight, X } from "lucide-react"
import { semanticNoteSearch } from "@/ai/flows/semantic-note-search"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Note, useStore } from "@/lib/store"
import { Badge } from "@/components/ui/badge"

export function SearchOverlay({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = React.useState("")
  const [results, setResults] = React.useState<Note[]>([])
  const [isSearching, setIsSearching] = React.useState(false)
  const { notes, setActiveNote } = useStore()

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onClose])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setIsSearching(true)
    try {
      const searchText = query.trim().toLowerCase()
      const localResults = notes.filter((note) =>
        [note.title, note.content].some((value) =>
          value.toLowerCase().includes(searchText)
        )
      )

      if (localResults.length > 0) {
        setResults(localResults)
        return
      }

      const semanticResults = await semanticNoteSearch({ searchQuery: query })
      setResults(
        semanticResults.notes
          .map((result) => notes.find((note) => note.id === result.noteId))
          .filter((note): note is Note => Boolean(note))
      )
    } catch (error) {
      console.error(error)
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-background/85 backdrop-blur-md z-50 flex items-start justify-center px-4 pt-[8vh]" role="dialog" aria-modal="true" aria-labelledby="global-search-title">
      <div className="w-full max-w-2xl bg-card border border-primary/20 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
        <div className="p-4 border-b border-primary/10 flex items-center gap-3">
          <h2 id="global-search-title" className="sr-only">Search notes</h2>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <form onSubmit={handleSearch}>
              <Input 
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="SEARCH NOTES..." 
                className="pl-10 h-12 text-sm sm:text-lg border-none shadow-none focus-visible:ring-0 uppercase font-bold bg-transparent"
              />
            </form>
          </div>
          <div className="flex items-center gap-2">
            {isSearching ? (
              <Loader2 className="h-5 w-5 animate-spin text-accent" />
            ) : (
              <Badge variant="outline" className="hidden sm:flex bg-accent/5 text-accent border-accent/20 items-center gap-1">
                <BrainCircuit className="h-3.5 w-3.5" />
                Local + AI
              </Badge>
            )}
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close search">
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
                  key={note.id}
                  onClick={() => {
                    setActiveNote(note.id)
                    onClose()
                  }}
                  className="w-full flex items-center gap-4 p-4 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors text-left group"
                >
                  <div className="h-10 w-10 bg-primary/10 flex items-center justify-center shrink-0">
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
                    className="hover:bg-primary/5"
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
