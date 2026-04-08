'use server';
/**
 * @fileOverview This file implements a Genkit flow for automatically extracting tasks from note content.
 *
 * - extractTasks - A function that handles the task extraction process.
 * - ExtractTasksInput - The input type for the extractTasks function.
 * - ExtractTasksOutput - The return type for the extractTasks function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractTasksInputSchema = z.object({
  noteContent: z.string().describe('The unstructured note content from which to extract tasks.'),
});
export type ExtractTasksInput = z.infer<typeof ExtractTasksInputSchema>;

const ExtractTasksOutputSchema = z.object({
  tasks: z.array(z.string()).describe('An array of actionable tasks extracted from the note content.'),
});
export type ExtractTasksOutput = z.infer<typeof ExtractTasksOutputSchema>;

export async function extractTasks(input: ExtractTasksInput): Promise<ExtractTasksOutput> {
  return extractTasksFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractTasksPrompt',
  input: {schema: ExtractTasksInputSchema},
  output: {schema: ExtractTasksOutputSchema},
  prompt: `You are an AI assistant specialized in identifying and extracting actionable tasks from provided text.
Your goal is to parse the given note content and return a list of distinct, actionable tasks.
Only return the tasks themselves, do not include any other text or commentary.
If no actionable tasks are found, return an empty array.

Note Content: {{{noteContent}}}`,
});

const extractTasksFlow = ai.defineFlow(
  {
    name: 'extractTasksFlow',
    inputSchema: ExtractTasksInputSchema,
    outputSchema: ExtractTasksOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
