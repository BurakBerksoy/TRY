import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Task } from '@/lib/definitions';
import { format } from 'date-fns';
import { EditTaskDialog } from './edit-task-dialog';
import { DeleteTaskDialog } from './delete-task-dialog';
import { StatusBadge } from './status-badge';
import { CalendarDays } from 'lucide-react';

type TaskCardProps = {
  task: Task;
};

export function TaskCard({ task }: TaskCardProps) {
  return (
    <Card className="flex flex-col h-full shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="flex-row items-start justify-between">
        <div className="flex-1 space-y-1.5">
          <CardTitle>{task.title}</CardTitle>
          <CardDescription className="flex items-center gap-2 text-xs text-muted-foreground">
            <CalendarDays className="h-3 w-3" />
            <span>Created on {format(new Date(task.createdAt), 'MMM d, yyyy')}</span>
          </CardDescription>
        </div>
        <StatusBadge status={task.status} />
      </CardHeader>
      <CardContent className="flex-grow">
        {task.description && <p className="text-sm text-foreground/80">{task.description}</p>}
      </CardContent>
      <Separator />
      <CardFooter className="p-2 justify-end">
        <div className="flex items-center">
          <EditTaskDialog task={task} />
          <DeleteTaskDialog taskId={task.id} taskTitle={task.title} />
        </div>
      </CardFooter>
    </Card>
  );
}
