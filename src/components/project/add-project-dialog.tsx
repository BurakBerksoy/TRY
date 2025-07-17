"use client";

import { useState } from 'react';
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
import { planProjectWithAI } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export function AddProjectDialog({ onProjectAdded }: { onProjectAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [prompt, setPrompt] = useState('');
  const { toast } = useToast();

  const handleGenerateProject = async () => {
    if (!prompt) {
      toast({
        variant: 'destructive',
        title: 'Prompt is empty',
        description: 'Please describe the project you want to plan.',
      });
      return;
    }

    setIsLoading(true);
    const result = await planProjectWithAI(prompt);
    setIsLoading(false);

    if (result.success && result.data) {
      toast({
        title: 'Project Created!',
        description: 'Your new project has been generated and added to your board.',
      });
      onProjectAdded(); // Refresh the project list
      setOpen(false);
      setPrompt('');
    } else {
      toast({
        variant: 'destructive',
        title: 'AI Generation Failed',
        description: result.error || 'An unknown error occurred. Please try a different prompt.',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> New Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Create a New Project</DialogTitle>
          <DialogDescription>
            Describe your project goal, and our AI will generate a title, an image, and actionable sub-tasks for you.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="ai-prompt">Project Description</Label>
            <Textarea
              id="ai-prompt"
              placeholder="e.g., 'Launch a new personal blog about cooking' or 'Plan a team offsite to improve morale'"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleGenerateProject}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Generate Project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
