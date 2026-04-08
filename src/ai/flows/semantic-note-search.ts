/**
 * @fileOverview Semantic note search.
 * Note: AI features require a server environment (Genkit).
 * On static builds (GitHub Pages), this provides a client-side keyword search fallback.
 */

export type SemanticNoteSearchInput = {
  searchQuery: string;
};

export type SemanticNoteSearchOutput = {
  notes: {
    noteId: string;
    title: string;
    content: string;
  }[];
};

export async function semanticNoteSearch(input: SemanticNoteSearchInput): Promise<SemanticNoteSearchOutput> {
  // Client-side fallback: returns empty results.
  // The actual search is handled by the SearchOverlay component using local store data.
  return { notes: [] };
}
