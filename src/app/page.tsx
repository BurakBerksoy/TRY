"use client";

import { useEffect, useState } from 'react';
import { getTasks } from '@/lib/actions';
import { AddTaskDialog } from '@/components/task/add-task-dialog';
import { TaskCard } from '@/components/task/task-card';
import { List, Loader2 } from 'lucide-react';
import { Task } from '@/lib/definitions';

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      const result = await getTasks();
      if (result.success && result.data) {
        setTasks(result.data);
      } else {
        setError(result.error || 'Failed to load tasks.');
      }
      setLoading(false);
    };

    fetchTasks();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <p className="text-destructive-foreground">Error loading tasks: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <List className="h-6 w-6" />
            <h1 className="text-2xl font-bold">TaskMaster</h1>
          </div>
          <AddTaskDialog />
        </div>
      </header>
      <main className="container mx-auto p-4 md:p-6">
        {tasks.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        ) : (
          <div className="mt-16 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-card p-12 text-center shadow-sm">
            <div className="rounded-full bg-secondary p-4">
              <List className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="mt-6 text-xl font-semibold">No Tasks Yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">Get started by adding your first task.</p>
            <div className="mt-6">
              <AddTaskDialog />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
