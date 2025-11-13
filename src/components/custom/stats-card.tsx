'use client';

import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: number;
  goal: number;
  unit: string;
  icon: LucideIcon;
  color: string;
}

export default function StatsCard({
  title,
  value,
  goal,
  unit,
  icon: Icon,
  color,
}: StatsCardProps) {
  const percentage = Math.min((value / goal) * 100, 100);
  const isOverGoal = value > goal;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {value}
            <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-1">
              {unit}
            </span>
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            de {goal} {unit}
          </p>
        </div>
      </div>

      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
        {title}
      </h3>

      <div className="relative w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${
            isOverGoal
              ? 'bg-gradient-to-r from-red-400 to-red-600'
              : `bg-gradient-to-r ${color}`
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-right">
        {Math.round(percentage)}% da meta
      </p>
    </div>
  );
}
