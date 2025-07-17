"use client";

import { useEffect, useState, startTransition } from 'react';
import { getProjects } from '@/lib/actions';
import { AddProjectDialog } from '@/components/project/add-project-dialog';
import { ProjectCard } from '@/components/project/project-card';
import { Bot, FolderKanban, Loader2 } from 'lucide-react';
import { ProjectWithSubTasks } from '@/lib/definitions';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const [projects, setProjects] = useState<ProjectWithSubTasks[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProjects = async () => {
    try {
      const result = await getProjects();
      if (result.success && result.data) {
        setProjects(result.data);
      } else {
        toast({
            variant: 'destructive',
            title: 'Error Loading Projects',
            description: result.error || 'Failed to load projects. Please ensure the database is set up correctly and you have run `npx prisma migrate dev`.',
        });
      }
    } catch (e: any) {
        toast({
            variant: 'destructive',
            title: 'An Unexpected Error Occurred',
            description: e.message || 'Could not connect to the server to fetch projects.',
        });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    startTransition(() => {
        setLoading(true);
        fetchProjects();
    });
  }, []);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex h-full items-center justify-center p-10">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      );
    }
    
    return projects.length > 0 ? (
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} onUpdate={fetchProjects} />
        ))}
      </div>
    ) : (
      <div className="mt-16 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-card/50 p-12 text-center shadow-sm">
        <div className="rounded-full bg-secondary p-4">
          <FolderKanban className="h-12 w-12 text-muted-foreground" />
        </div>
        <h2 className="mt-6 text-xl font-semibold">No Projects Yet</h2>
        <p className="mt-2 text-sm text-muted-foreground">Get started by creating your first project with our AI assistant.</p>
        <div className="mt-6">
          <AddProjectDialog onProjectAdded={fetchProjects} />
        </div>
      </div>
    );
  };

  return (
    <SidebarProvider>
      <Sidebar className="sidebar" collapsible="icon">
        <SidebarHeader className="sidebar-header flex items-center justify-between p-4 bg-primary/90">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="shrink-0 text-primary-foreground hover:bg-primary/80 hover:text-primary-foreground">
              <Bot className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-bold truncate text-primary-foreground">TaskMaster</h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
           <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Projects" isActive>
                <FolderKanban/>
                <span>Projects</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
          <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
            <div className="flex items-center gap-2">
               <SidebarTrigger className="md:hidden" />
               <h1 className="text-xl font-semibold">Projects</h1>
            </div>
            <AddProjectDialog onProjectAdded={fetchProjects} />
          </div>
        </header>
        <main className="container mx-auto p-4 md:p-6 flex-1">
          {renderContent()}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
