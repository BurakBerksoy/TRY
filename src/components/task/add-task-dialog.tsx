"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { Loader2, Plus, Sparkles } from 'lucide-react';
import { addTask, planTaskWithAI } from '@/lib/actions';
import { TaskSchema, TaskFormValues } from '@/lib/definitions';
import { TaskForm } from '@/components/task/task-form';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export function AddTaskDialog() {
  const [open, setOpen] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(TaskSchema),
    defaultValues: {
      title: '',
      description: '',
      status: 'PENDING',
    },
  });

  const handleAiGenerate = async () => {
    const prompt = form.getValues('description');
    if (!prompt) {
      toast({
        variant: 'destructive',
        title: 'Prompt is empty',
        description: 'Please enter a description to generate task details with AI.',
      });
      return;
    }

    setIsAiLoading(true);
    const result = await planTaskWithAI(prompt);
    setIsAiLoading(false);

    if (result.success && result.data) {
      form.setValue('title', result.data.title, { shouldValidate: true });
      form.setValue('description', result.data.description, { shouldValidate: true });
      form.setValue('status', result.data.status, { shouldValidate: true });
      toast({
        title: 'AI Task Plan Generated',
        description: 'The task details have been filled in for you.',
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'AI Generation Failed',
        description: result.error || 'An unknown error occurred.',
      });
    }
  };

  const processForm = async (values: TaskFormValues) => {
    const result = await addTask(values);

    if (result.success) {
      toast({
        title: 'Task Created',
        description: `Task "${values.title}" has been successfully added.`,
      });
      setOpen(false);
      form.reset();
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error || 'Could not create the task.',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
          <DialogDescription>
            Fill in the details below to add a new task. You can also use the AI planner to generate details from a description.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ai-prompt">AI Planner (Optional)</Label>
            <div className="relative">
              <Textarea
                id="ai-prompt"
                placeholder="e.g., 'Launch the new marketing campaign for the Q3 product release next week'"
                {...form.register('description')}
                className="pr-24"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleAiGenerate}
                disabled={isAiLoading}
                className="absolute right-1 top-1/2 -translate-y-1/2"
              >
                {isAiLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Generate
              </Button>
            </div>
          </div>
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
            Add Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
