'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Flame, Beef, Wheat, Droplet, TrendingUp, Calendar, Sparkles } from 'lucide-react';
import MealUpload from '@/components/custom/meal-upload';
import MealCard from '@/components/custom/meal-card';
import StatsCard from '@/components/custom/stats-card';
import NutritionChart from '@/components/custom/nutrition-chart';
import { Meal, DailyStats, AnalyzeMealResponse } from '@/types';

export default function Home() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [stats, setStats] = useState<DailyStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch');

  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Load meals
      const mealsResponse = await fetch(`/api/meals?userId=demo-user&date=${today}`);
      const mealsData = await mealsResponse.json();
      setMeals(mealsData);

      // Load stats
      const statsResponse = await fetch(`/api/meals?userId=demo-user&date=${today}&statsOnly=true`);
      const statsData = await statsResponse.json();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalysisComplete = async (analysis: AnalyzeMealResponse & { imageUrl: string }) => {
    try {
      const newMeal = {
        user_id: 'demo-user',
        image_url: analysis.imageUrl,
        meal_type: selectedMealType,
        foods: analysis.foods,
        total_calories: analysis.total_calories,
        total_protein: analysis.total_protein,
        total_carbs: analysis.total_carbs,
        total_fat: analysis.total_fat,
      };

      const response = await fetch('/api/meals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMeal),
      });

      if (!response.ok) throw new Error('Failed to save meal');

      setShowUpload(false);
      loadData();
    } catch (error) {
      console.error('Error saving meal:', error);
      alert('Erro ao salvar refeição. Tente novamente.');
    }
  };

  const caloriesRemaining = stats ? stats.goal_calories - stats.total_calories : 0;
  const caloriesPercentage = stats ? Math.min((stats.total_calories / stats.goal_calories) * 100, 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-gray-950 dark:via-gray-900 dark:to-emerald-950">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  NutriAiPro
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Nutrição Inteligente com IA
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Calendar className="w-4 h-4" />
              {format(new Date(), "d 'de' MMMM", { locale: ptBR })}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Stats */}
        <div className="mb-8">
          <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-3xl p-8 text-white shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-medium opacity-90 mb-1">Calorias Hoje</h2>
                <div className="flex items-baseline gap-2">
                  <p className="text-5xl font-bold">{stats?.total_calories || 0}</p>
                  <p className="text-xl opacity-75">/ {stats?.goal_calories || 2000}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-75 mb-1">Restantes</p>
                <p className="text-3xl font-bold">
                  {caloriesRemaining > 0 ? caloriesRemaining : 0}
                </p>
              </div>
            </div>

            <div className="relative w-full h-3 bg-white/20 rounded-full overflow-hidden mb-4">
              <div
                className="absolute top-0 left-0 h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${caloriesPercentage}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="text-center">
                <p className="text-sm opacity-75 mb-1">Proteínas</p>
                <p className="text-2xl font-bold">{stats?.total_protein || 0}g</p>
              </div>
              <div className="text-center">
                <p className="text-sm opacity-75 mb-1">Carboidratos</p>
                <p className="text-2xl font-bold">{stats?.total_carbs || 0}g</p>
              </div>
              <div className="text-center">
                <p className="text-sm opacity-75 mb-1">Gorduras</p>
                <p className="text-2xl font-bold">{stats?.total_fat || 0}g</p>
              </div>
            </div>
          </div>
        </div>

        {/* Add Meal Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Adicionar Refeição
            </h2>
          </div>

          {!showUpload ? (
            <button
              onClick={() => setShowUpload(true)}
              className="w-full py-6 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3"
            >
              <Sparkles className="w-6 h-6" />
              Analisar Refeição com IA
            </button>
          ) : (
            <div className="space-y-4">
              <div className="flex gap-2 mb-4">
                {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedMealType(type)}
                    className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                      selectedMealType === type
                        ? 'bg-emerald-600 text-white shadow-lg'
                        : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
                    }`}
                  >
                    {type === 'breakfast' && 'Café'}
                    {type === 'lunch' && 'Almoço'}
                    {type === 'dinner' && 'Jantar'}
                    {type === 'snack' && 'Lanche'}
                  </button>
                ))}
              </div>
              
              <MealUpload onAnalysisComplete={handleAnalysisComplete} />
              
              <button
                onClick={() => setShowUpload(false)}
                className="w-full py-3 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Calorias"
            value={stats?.total_calories || 0}
            goal={stats?.goal_calories || 2000}
            unit="kcal"
            icon={Flame}
            color="from-orange-400 to-red-500"
          />
          <StatsCard
            title="Proteínas"
            value={stats?.total_protein || 0}
            goal={stats?.goal_protein || 150}
            unit="g"
            icon={Beef}
            color="from-red-400 to-pink-500"
          />
          <StatsCard
            title="Carboidratos"
            value={stats?.total_carbs || 0}
            goal={stats?.goal_carbs || 250}
            unit="g"
            icon={Wheat}
            color="from-amber-400 to-yellow-500"
          />
          <StatsCard
            title="Gorduras"
            value={stats?.total_fat || 0}
            goal={stats?.goal_fat || 65}
            unit="g"
            icon={Droplet}
            color="from-cyan-400 to-blue-500"
          />
        </div>

        {/* Nutrition Chart */}
        {stats && stats.total_calories > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg mb-8">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Distribuição de Macronutrientes
              </h2>
            </div>
            <NutritionChart
              protein={stats.total_protein}
              carbs={stats.total_carbs}
              fat={stats.total_fat}
            />
          </div>
        )}

        {/* Meals List */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Refeições de Hoje
          </h2>
          
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-500 dark:text-gray-400 mt-4">Carregando...</p>
            </div>
          ) : meals.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl">
              <Sparkles className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                Nenhuma refeição registrada hoje
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                Adicione sua primeira refeição usando a IA!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {meals.map((meal) => (
                <MealCard key={meal.id} meal={meal} />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            NutriAiPro - Nutrição Inteligente Powered by AI
          </p>
        </div>
      </footer>
    </div>
  );
}
