'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating task details (title, description, status) based on a user prompt.
 *
 * - generateTaskDetails - A function that triggers the task details generation flow.
 * - GenerateTaskDetailsInput - The input type for the generateTaskDetails function.
 * - GenerateTaskDetailsOutput - The output type for the generateTaskDetails function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTaskDetailsInputSchema = z.object({
  prompt: z.string().describe('A prompt describing the task for which details need to be generated.'),
});
export type GenerateTaskDetailsInput = z.infer<typeof GenerateTaskDetailsInputSchema>;

const GenerateTaskDetailsOutputSchema = z.object({
  title: z.string().describe('The generated title for the task.'),
  description: z.string().describe('The generated description for the task.'),
  status: z.string().describe('The generated status for the task.'),
});
export type GenerateTaskDetailsOutput = z.infer<typeof GenerateTaskDetailsOutputSchema>;

export async function generateTaskDetails(input: GenerateTaskDetailsInput): Promise<GenerateTaskDetailsOutput> {
  return generateTaskDetailsFlow(input);
}

const generateTaskDetailsPrompt = ai.definePrompt({
  name: 'generateTaskDetailsPrompt',
  input: {schema: GenerateTaskDetailsInputSchema},
  output: {schema: GenerateTaskDetailsOutputSchema},
  prompt: `You are a task planning assistant. Generate a title, short description, and status for a task based on the following prompt:\n\nPrompt: {{{prompt}}}\n\nTitle:`, // The title is intentionally left open, because the LLM will generate it.
});

const generateTaskDetailsFlow = ai.defineFlow(
  {
    name: 'generateTaskDetailsFlow',
    inputSchema: GenerateTaskDetailsInputSchema,
    outputSchema: GenerateTaskDetailsOutputSchema,
  },
  async input => {
    const {output} = await generateTaskDetailsPrompt(input);
    return output!;
  }
);
