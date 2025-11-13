'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface NutritionChartProps {
  protein: number;
  carbs: number;
  fat: number;
}

const COLORS = {
  protein: '#FF6B6B',
  carbs: '#4ECDC4',
  fat: '#FFD93D',
};

export default function NutritionChart({ protein, carbs, fat }: NutritionChartProps) {
  const data = [
    { name: 'Proteínas', value: protein, color: COLORS.protein },
    { name: 'Carboidratos', value: carbs, color: COLORS.carbs },
    { name: 'Gorduras', value: fat, color: COLORS.fat },
  ];

  const total = protein + carbs + fat;

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      
      <div className="grid grid-cols-3 gap-4 mt-4">
        {data.map((item) => (
          <div key={item.name} className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                {item.name}
              </span>
            </div>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {item.value}g
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              {total > 0 ? Math.round((item.value / total) * 100) : 0}%
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
