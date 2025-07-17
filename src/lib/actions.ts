"use server";

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { prisma } from './prisma';
import { TaskSchema, TaskFormValues, Task } from './definitions';
import { generateTaskDetails } from '@/ai/flows/generate-task-details';

type FormState = {
  success: boolean;
  error?: string;
};

type DataState<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

// --- CRUD Actions ---

export async function getTasks(): Promise<DataState<Task[]>> {
  try {
    const tasks = await prisma.task.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, data: tasks };
  } catch (e) {
    const error = e instanceof Error ? e.message : 'Database error';
    return { success: false, error };
  }
}

export async function addTask(values: TaskFormValues): Promise<FormState> {
  const validatedFields = TaskSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      success: false,
      error: 'Invalid fields. Please check your input.',
    };
  }

  const { title, description, status } = validatedFields.data;

  try {
    await prisma.task.create({
      data: {
        title,
        description,
        status,
      },
    });
    revalidatePath('/');
    return { success: true };
  } catch (e) {
    return { success: false, error: 'Failed to create task.' };
  }
}

export async function updateTask(id: string, values: TaskFormValues): Promise<FormState> {
  const validatedFields = TaskSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      success: false,
      error: 'Invalid fields. Please check your input.',
    };
  }

  const { title, description, status } = validatedFields.data;

  try {
    await prisma.task.update({
      where: { id },
      data: {
        title,
        description,
        status,
      },
    });
    revalidatePath('/');
    return { success: true };
  } catch (e) {
    return { success: false, error: 'Failed to update task.' };
  }
}

export async function deleteTask(id: string): Promise<FormState> {
  try {
    await prisma.task.delete({ where: { id } });
    revalidatePath('/');
    return { success: true };
  } catch (e) {
    return { success: false, error: 'Failed to delete task.' };
  }
}


// --- AI Action ---

const mapAiStatusToEnum = (aiStatus: string): Task['status'] => {
  const lowerCaseStatus = aiStatus.toLowerCase();
  if (lowerCaseStatus.includes('progress')) return 'IN_PROGRESS';
  if (lowerCaseStatus.includes('done') || lowerCaseStatus.includes('complete')) return 'DONE';
  return 'PENDING';
};

export async function planTaskWithAI(prompt: string): Promise<DataState<TaskFormValues>> {
  if (!prompt) {
    return { success: false, error: 'Prompt cannot be empty.' };
  }

  try {
    const result = await generateTaskDetails({ prompt });
    const mappedStatus = mapAiStatusToEnum(result.status);
    
    return { 
      success: true, 
      data: {
        title: result.title,
        description: result.description,
        status: mappedStatus
      }
    };
  } catch (e) {
    const error = e instanceof Error ? e.message : 'AI generation failed.';
    return { success: false, error };
  }
}
