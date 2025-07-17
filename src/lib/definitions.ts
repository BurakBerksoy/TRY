import { z } from 'zod';

// Base Prisma-like types for reference
export type Project = {
  id: string;
  title: string;
  imageUrl: string;
  createdAt: Date;
  updatedAt: Date;
};

export type SubTask = {
  id: string;
  text: string;
  completed: boolean;
  projectId: string;
  createdAt: Date;
  updatedAt: Date;
};

// Type that includes the relation
export type ProjectWithSubTasks = Project & {
  subTasks: SubTask[];
};

// Zod schemas for validation if needed (e.g., for forms)
export const SubTaskSchema = z.object({
  id: z.string(),
  text: z.string(),
  completed: z.boolean(),
  projectId: z.string(),
});

export const ProjectSchema = z.object({
  id: z.string(),
  title: z.string(),
  imageUrl: z.string().url(),
  subTasks: z.array(SubTaskSchema),
});
