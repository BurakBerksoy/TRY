import { z } from 'zod';
import type { Project as PrismaProject, SubTask as PrismaSubTask } from '@prisma/client';

// Base Prisma-like types for reference
export type Project = PrismaProject;
export type SubTask = PrismaSubTask;

// Type that includes the relation
export type ProjectWithSubTasks = Project & {
  subTasks: SubTask[];
};

// Zod schemas for validation if needed (e.g., for forms)
export const ProjectSchema = z.object({
  id: z.string(),
  title: z.string(),
  imageUrl: z.string().url(),
  subTasks: z.array(z.object({
      id: z.string(),
      text: z.string(),
      completed: z.boolean(),
      projectId: z.string(),
      createdAt: z.date(),
      updatedAt: z.date(),
  })),
});
