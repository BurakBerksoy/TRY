"use client";

import { useEffect, useState } from 'react';
import { getProjects } from '@/lib/actions';
import { AddProjectDialog } from '@/components/project/add-project-dialog';
import { ProjectCard } from '@/components/project/project-card';
import { Bot, Loader2, FolderKanban } from 'lucide-react';
import { ProjectWithSubTasks } from '@/lib/definitions';

export default function Home() {
  const [projects, setProjects] = useState<ProjectWithSubTasks[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const result = await getProjects();
      if (result.success && result.data) {
        setProjects(result.data);
      } else {
        setError(result.error || 'Failed to load projects.');
      }
    } catch (e: any) {
      setError(e.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  if (loading && projects.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="rounded-lg border border-destructive bg-destructive/10 p-6 text-center text-destructive">
          <h2 className="text-lg font-semibold">Error Loading Projects</h2>
          <p className="mt-2 text-sm">{error}</p>
          <p className="mt-4 text-xs text-destructive/80">Please ensure the database is set up correctly. You may need to run `npx prisma migrate dev`.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">AI Project Planner</h1>
          </div>
          <AddProjectDialog onProjectAdded={fetchProjects} />
        </div>
      </header>
      <main className="container mx-auto p-4 md:p-6">
        {projects.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} onUpdate={fetchProjects} />
            ))}
          </div>
        ) : (
          <div className="mt-16 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-card p-12 text-center shadow-sm">
            <div className="rounded-full bg-secondary p-4">
              <FolderKanban className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="mt-6 text-xl font-semibold">No Projects Yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">Get started by creating your first project with AI.</p>
            <div className="mt-6">
              <AddProjectDialog onProjectAdded={fetchProjects} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
