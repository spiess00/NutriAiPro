'use client';

import { Meal } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Utensils, Clock } from 'lucide-react';

interface MealCardProps {
  meal: Meal;
}

const MEAL_TYPE_LABELS = {
  breakfast: 'Café da Manhã',
  lunch: 'Almoço',
  dinner: 'Jantar',
  snack: 'Lanche',
};

const MEAL_TYPE_COLORS = {
  breakfast: 'from-orange-400 to-amber-500',
  lunch: 'from-green-400 to-emerald-500',
  dinner: 'from-blue-400 to-indigo-500',
  snack: 'from-purple-400 to-pink-500',
};

export default function MealCard({ meal }: MealCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className={`h-2 bg-gradient-to-r ${MEAL_TYPE_COLORS[meal.meal_type]}`} />
      
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl bg-gradient-to-br ${MEAL_TYPE_COLORS[meal.meal_type]}`}>
              <Utensils className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                {MEAL_TYPE_LABELS[meal.meal_type]}
              </h3>
              <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                <Clock className="w-3 h-3" />
                {format(new Date(meal.created_at), "HH:mm", { locale: ptBR })}
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {meal.total_calories}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">calorias</p>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          {meal.foods.map((food, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg"
            >
              <div>
                <p className="font-medium text-sm text-gray-900 dark:text-white">
                  {food.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {food.quantity}
                </p>
              </div>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {food.calories} kcal
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Proteínas</p>
            <p className="text-sm font-bold text-red-500">{meal.total_protein}g</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Carboidratos</p>
            <p className="text-sm font-bold text-teal-500">{meal.total_carbs}g</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Gorduras</p>
            <p className="text-sm font-bold text-yellow-500">{meal.total_fat}g</p>
          </div>
        </div>
      </div>
    </div>
  );
}
