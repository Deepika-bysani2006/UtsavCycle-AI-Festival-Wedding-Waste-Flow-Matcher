import React from 'react';
import { clsx } from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  style?: React.CSSProperties;
}

export function Card({ children, className, hover = false, padding = 'md', style }: CardProps) {
  const paddings = { none: '', sm: 'p-4', md: 'p-6', lg: 'p-8' };
  return (
    <div
      style={style}
      className={clsx(
        'bg-white dark:bg-[#1a2018] rounded-2xl border border-gray-100 dark:border-[#2a3828] shadow-card dark:shadow-none',
        hover && 'hover:shadow-card-hover dark:hover:bg-[#1f2d1d] transition-all duration-200 cursor-pointer',
        paddings[padding],
        className
      )}
    >
      {children}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  color?: 'green' | 'orange' | 'blue' | 'purple';
}

export function StatCard({ label, value, sub, icon, color = 'green' }: StatCardProps) {
  const colors = {
    green: 'bg-primary-50 dark:bg-green-900/20 text-[#1a6b2f] dark:text-green-400',
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
  };
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
          {sub && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{sub}</p>}
        </div>
        <span className={clsx('p-3 rounded-xl', colors[color])}>{icon}</span>
      </div>
    </Card>
  );
}
