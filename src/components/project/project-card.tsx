"use client";

import Image from 'next/image';
import { useState, useMemo } from 'react';
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
import { ProjectWithSubTasks } from '@/lib/definitions';
import { Loader2, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Progress } from '@/components/ui/progress';

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
    const originalTasks = project.subTasks;
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
      setProject({ ...project, subTasks: originalTasks }); // Revert to original state from before this change
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

  const completedTasks = useMemo(() => {
    return project.subTasks.filter(task => task.completed).length;
  }, [project.subTasks]);
  const totalTasks = project.subTasks.length;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <Card className="flex flex-col h-full shadow-lg border-border/60 hover:border-primary/50 transition-all duration-300">
      <CardHeader className="p-0">
        <div className="relative w-full h-40">
          <Image
            src={project.imageUrl || 'https://placehold.co/600x400.png'}
            alt={project.title}
            fill
            className="object-cover rounded-t-lg"
            unoptimized={project.imageUrl?.startsWith('data:image')}
            data-ai-hint="project image abstract"
          />
        </div>
        <div className="p-4 space-y-2">
          <CardTitle>{project.title}</CardTitle>
           {totalTasks > 0 && (
            <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Progress</span>
                    <span>{completedTasks} / {totalTasks}</span>
                </div>
                <Progress value={progress} className="h-2" />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-4 pt-0">
        <div className="space-y-2">
          {project.subTasks.map((task) => (
            <div key={task.id} className="flex items-center space-x-2 group">
              <Checkbox
                id={task.id}
                checked={task.completed}
                onCheckedChange={(checked) => handleSubTaskChange(task.id, !!checked)}
              />
              <label
                htmlFor={task.id}
                className="text-sm cursor-pointer group-hover:text-primary transition-colors duration-200"
              >
                <span className={task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}>
                    {task.text}
                </span>
              </label>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 justify-end">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" disabled={isDeleting}>
                <Trash2 className="h-4 w-4 text-destructive/70 hover:text-destructive transition-colors duration-200" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your project
                and all of its sub-tasks.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}
