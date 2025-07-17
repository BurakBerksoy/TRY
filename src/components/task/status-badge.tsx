import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Task } from '@/lib/definitions';

type StatusBadgeProps = {
  status: Task['status'];
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const statusStyles = {
    PENDING: 'bg-yellow-200 text-yellow-800 hover:bg-yellow-300 dark:bg-yellow-800 dark:text-yellow-200 dark:hover:bg-yellow-700 border-yellow-300 dark:border-yellow-700',
    IN_PROGRESS: 'bg-blue-200 text-blue-800 hover:bg-blue-300 dark:bg-blue-800 dark:text-blue-200 dark:hover:bg-blue-700 border-blue-300 dark:border-blue-700',
    DONE: 'bg-green-200 text-green-800 hover:bg-green-300 dark:bg-green-800 dark:text-green-200 dark:hover:bg-green-700 border-green-300 dark:border-green-700',
  };

  return (
    <Badge variant="outline" className={cn('font-normal', statusStyles[status])}>
      {status.replace('_', ' ')}
    </Badge>
  );
}
