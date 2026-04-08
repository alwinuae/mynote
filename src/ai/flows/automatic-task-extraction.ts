/**
 * @fileOverview Task extraction from note content.
 * Note: AI features require a server environment (Genkit).
 * On static builds (GitHub Pages), this provides a client-side fallback.
 */

export type ExtractTasksInput = {
  noteContent: string;
};

export type ExtractTasksOutput = {
  tasks: string[];
};

export async function extractTasks(input: ExtractTasksInput): Promise<ExtractTasksOutput> {
  // Simple client-side extraction: split by newlines and find action-like lines
  const lines = input.noteContent.split('\n').filter(line => line.trim().length > 0);
  const tasks = lines.filter(line => {
    const lower = line.trim().toLowerCase();
    return (
      lower.startsWith('- [ ]') ||
      lower.startsWith('todo:') ||
      lower.startsWith('task:') ||
      lower.startsWith('action:') ||
      lower.startsWith('* ') ||
      lower.startsWith('- ')
    );
  }).map(line => line.replace(/^[-*]\s*\[.\]\s*|^(todo|task|action):\s*/i, '').trim());

  return { tasks: tasks.length > 0 ? tasks : [] };
}
