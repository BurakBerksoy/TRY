'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from './prisma';
import { generateProjectPlan } from '@/ai/flows/generate-project-plan';
import { ProjectWithSubTasks, SubTask } from '@/lib/definitions';

type ActionState<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

// --- Project Actions ---
export async function getProjects(): Promise<ActionState<ProjectWithSubTasks[]>> {
  try {
    const projects = await prisma.project.findMany({
      include: {
        subTasks: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return { success: true, data: projects };
  } catch (e) {
    const error = e instanceof Error ? e.message : 'Database error';
    console.error(`Error in getProjects: ${error}`);
    return { success: false, error };
  }
}

export async function deleteProject(id: string): Promise<ActionState<null>> {
  try {
    await prisma.project.delete({ where: { id } });
    revalidatePath('/');
    return { success: true };
  } catch (e) {
    const error = e instanceof Error ? e.message : 'Failed to delete project.';
    console.error(`Error in deleteProject: ${error}`);
    return { success: false, error };
  }
}

// --- SubTask Actions ---
export async function updateSubTaskStatus(id: string, completed: boolean): Promise<ActionState<SubTask>> {
    try {
        const updatedSubTask = await prisma.subTask.update({
            where: { id },
            data: { completed },
        });
        revalidatePath('/');
        return { success: true, data: updatedSubTask };
    } catch (e) {
        const error = e instanceof Error ? e.message : 'Failed to update sub-task.';
        console.error(`Error in updateSubTaskStatus: ${error}`);
        return { success: false, error };
    }
}


// --- AI Action ---
export async function planProjectWithAI(prompt: string): Promise<ActionState<{projectId: string}>> {
  if (!prompt) {
    return { success: false, error: 'Prompt cannot be empty.' };
  }

  try {
    // Generate the project plan from the AI flow
    const projectPlan = await generateProjectPlan({ prompt });

    if (!projectPlan.title || projectPlan.subTasks.length === 0) {
      return { success: false, error: 'AI could not generate a valid project plan. Please try a different prompt.' };
    }
    
    // Save the generated project and sub-tasks to the database
    const newProject = await prisma.project.create({
      data: {
        title: projectPlan.title,
        imageUrl: projectPlan.imageUrl,
        subTasks: {
          create: projectPlan.subTasks.map(task => ({
            text: task.text,
            completed: false,
          })),
        },
      },
    });

    revalidatePath('/');
    return { success: true, data: { projectId: newProject.id } };
  } catch (e) {
    const error = e instanceof Error ? e.message : 'AI generation failed.';
    console.error(e);
    return { success: false, error };
  }
}
