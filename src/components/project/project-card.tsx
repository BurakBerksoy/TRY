"use client";

import Image from 'next/image';
import { useState } from 'react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { updateSubTaskStatus, deleteProject } from '@/lib/actions';
import { ProjectWithSubTasks, SubTask } from '@/lib/definitions';
import { Loader2, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type ProjectCardProps = {
  project: ProjectWithSubTasks;
  onUpdate: () => void;
};

export function ProjectCard({ project: initialProject, onUpdate }: ProjectCardProps) {
  const [project, setProject] = useState(initialProject);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleSubTaskChange = async (subTaskId: string, completed: boolean) => {
    // Optimistically update the UI
    const updatedSubTasks = project.subTasks.map(task =>
      task.id === subTaskId ? { ...task, completed } : task
    );
    setProject({ ...project, subTasks: updatedSubTasks });

    // Call server action
    const result = await updateSubTaskStatus(subTaskId, completed);
    if (!result.success) {
      // Revert on failure
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'Could not update sub-task. Please try again.',
      });
      setProject(initialProject); // Revert to original state
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deleteProject(project.id);
    setIsDeleting(false);

    if (result.success) {
      toast({
        title: 'Project Deleted',
        description: `Project "${project.title}" was successfully deleted.`,
      });
      onUpdate();
    } else {
      toast({
        variant: 'destructive',
        title: 'Delete Failed',
        description: result.error || 'Could not delete the project.',
      });
    }
  };

  return (
    <Card className="flex flex-col h-full shadow-lg border-border/60 hover:border-primary/50 transition-all duration-300">
      <CardHeader className="p-0">
        <div className="relative w-full h-40">
          <Image
            src={project.imageUrl}
            alt={project.title}
            fill
            className="object-cover rounded-t-lg"
            data-ai-hint="project image abstract"
          />
        </div>
        <div className="p-4">
          <CardTitle>{project.title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-4 pt-0">
        <div className="space-y-2">
          {project.subTasks.map((task) => (
            <div key={task.id} className="flex items-center space-x-2">
              <Checkbox
                id={task.id}
                checked={task.completed}
                onCheckedChange={(checked) => handleSubTaskChange(task.id, !!checked)}
              />
              <label
                htmlFor={task.id}
                className={`text-sm ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}
              >
                {task.text}
              </label>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 justify-end">
         <Button variant="ghost" size="icon" onClick={handleDelete} disabled={isDeleting}>
          {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 text-destructive/70 hover:text-destructive" />}
        </Button>
      </CardFooter>
    </Card>
  );
}
