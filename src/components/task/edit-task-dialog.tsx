"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Loader2, Pencil } from 'lucide-react';
import { updateTask } from '@/lib/actions';
import { Task, TaskSchema, TaskFormValues } from '@/lib/definitions';
import { TaskForm } from '@/components/task/task-form';
import { useToast } from '@/hooks/use-toast';

type EditTaskDialogProps = {
  task: Task;
};

export function EditTaskDialog({ task }: EditTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(TaskSchema),
    defaultValues: {
      title: task.title,
      description: task.description || '',
      status: task.status,
    },
  });

  const processForm = async (values: TaskFormValues) => {
    const result = await updateTask(task.id, values);

    if (result.success) {
      toast({
        title: 'Task Updated',
        description: `Task "${values.title}" has been successfully updated.`,
      });
      setOpen(false);
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error || 'Could not update the task.',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription>
            Update the details of your task below. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <TaskForm form={form} />
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={form.handleSubmit(processForm)}
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
