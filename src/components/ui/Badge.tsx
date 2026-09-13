import React from 'react';
import { clsx } from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  color?: 'green' | 'orange' | 'red' | 'blue' | 'gray' | 'purple' | 'yellow';
  size?: 'sm' | 'md';
}

const colorMap = {
  green: 'bg-primary-100 text-primary-800 dark:bg-green-950/60 dark:text-green-300 dark:border dark:border-green-800/40',
  orange: 'bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 dark:border dark:border-orange-800/40',
  red: 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 dark:border dark:border-red-800/40',
  blue: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 dark:border dark:border-blue-800/40',
  gray: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:border dark:border-gray-700',
  purple: 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 dark:border dark:border-purple-800/40',
  yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/60 dark:text-yellow-300 dark:border dark:border-yellow-800/40',
};

export function Badge({ children, color = 'green', size = 'md' }: BadgeProps) {
  return (
    <span className={clsx(
      'inline-flex items-center font-medium rounded-full',
      size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs',
      colorMap[color]
    )}>
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { color: BadgeProps['color']; label: string }> = {
    PENDING: { color: 'yellow', label: 'Pending' },
    MATCHED: { color: 'blue', label: 'Matched' },
    CONFIRMED: { color: 'purple', label: 'Confirmed' },
    IN_PROGRESS: { color: 'orange', label: 'In Progress' },
    COMPLETED: { color: 'green', label: 'Completed' },
    CANCELLED: { color: 'red', label: 'Cancelled' },
    DRAFT: { color: 'gray', label: 'Draft' },
    ACTIVE: { color: 'green', label: 'Active' },
  };
  const cfg = map[status] || { color: 'gray' as const, label: status };
  return <Badge color={cfg.color}>{cfg.label}</Badge>;
}
