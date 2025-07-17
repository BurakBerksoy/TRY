'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating a complete project plan,
 * including a title, a list of sub-tasks, and a relevant image URL, based on a user's prompt.
 *
 * - generateProjectPlan - A function that triggers the project plan generation flow.
 * - GenerateProjectPlanInput - The input type for the generateProjectPlan function.
 * - GenerateProjectPlanOutput - The output type for the generateProjectPlan function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Input Schema
const GenerateProjectPlanInputSchema = z.object({
  prompt: z.string().describe('A prompt describing the project for which a plan needs to be generated.'),
});
export type GenerateProjectPlanInput = z.infer<typeof GenerateProjectPlanInputSchema>;

// Output Schema
const SubTaskSchema = z.object({
  text: z.string().describe('A single, actionable sub-task for the project.'),
});

const GenerateProjectPlanOutputSchema = z.object({
  title: z.string().describe('The generated title for the project.'),
  subTasks: z.array(SubTaskSchema).describe('A list of 3-5 sub-tasks required to complete the project.'),
  imageUrl: z.string().url().describe('A URL for an image that visually represents the project.'),
});
export type GenerateProjectPlanOutput = z.infer<typeof GenerateProjectPlanOutputSchema>;


// Main exported function
export async function generateProjectPlan(input: GenerateProjectPlanInput): Promise<GenerateProjectPlanOutput> {
  return generateProjectPlanFlow(input);
}


// Text Generation Prompt
const projectPlannerPrompt = ai.definePrompt({
  name: 'projectPlannerPrompt',
  input: { schema: GenerateProjectPlanInputSchema },
  output: { schema: GenerateProjectPlanOutputSchema },
  prompt: `You are an expert project manager. A user will provide a prompt for a project.
Your task is to generate a concise project plan.
The plan should include:
1.  A clear and concise title for the project.
2.  A list of 3 to 5 actionable sub-tasks to complete the project.
3.  A placeholder image URL that is thematically related to the project. Use the format https://placehold.co/600x400.png for the image.

Analyze the user's prompt and create a structured response.

User prompt: {{{prompt}}}
`,
});

// Image Generation Prompt (Simplified for this flow)
const imageGenerationPrompt = (title: string) => `
Generate a thematic, visually appealing, and modern flat-illustration-style image for a project titled "${title}".
The image should be simple, symbolic, and use a professional color palette. Do not include any text in the image.
`;

// The main flow
const generateProjectPlanFlow = ai.defineFlow(
  {
    name: 'generateProjectPlanFlow',
    inputSchema: GenerateProjectPlanInputSchema,
    outputSchema: GenerateProjectPlanOutputSchema,
  },
  async (input) => {
    // Step 1: Generate the text-based project plan (title and sub-tasks)
    const textPlanResponse = await projectPlannerPrompt(input);
    const textPlan = textPlanResponse.output;

    if (!textPlan) {
      throw new Error('Failed to generate project plan text.');
    }

    // Step 2: Generate an image based on the generated title
    const { media } = await ai.generate({
        model: 'googleai/gemini-2.0-flash-preview-image-generation',
        prompt: imageGenerationPrompt(textPlan.title),
        config: {
            responseModalities: ['TEXT', 'IMAGE'],
        },
    });
    
    const imageUrl = media.url || 'https://placehold.co/600x400.png';

    // Step 3: Combine results and return the final plan
    return {
      title: textPlan.title,
      subTasks: textPlan.subTasks,
      imageUrl: imageUrl,
    };
  }
);
