import { z } from 'zod';

export type Task = {
  id: string;
  title: string;
  description: string | null;
  status: 'PENDING' | 'IN_PROGRESS' | 'DONE';
  createdAt: Date;
  updatedAt: Date;
};

export const TaskSchema = z.object({
  title: z.string().min(1, { message: 'Title is required.' }).max(100, { message: 'Title must be 100 characters or less.'}),
  description: z.string().max(500, { message: 'Description must be 500 characters or less.'}).optional().or(z.literal('')),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'DONE']),
});

export type TaskFormValues = z.infer<typeof TaskSchema>;
