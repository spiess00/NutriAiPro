import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions
export async function getMeals(userId: string, date?: string) {
  let query = supabase
    .from('meals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    query = query
      .gte('created_at', startOfDay.toISOString())
      .lte('created_at', endOfDay.toISOString());
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function saveMeal(meal: Omit<any, 'id'>) {
  const { data, error } = await supabase
    .from('meals')
    .insert([meal])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getDailyStats(userId: string, date: string) {
  const meals = await getMeals(userId, date);
  
  const stats = meals.reduce(
    (acc, meal) => ({
      total_calories: acc.total_calories + meal.total_calories,
      total_protein: acc.total_protein + meal.total_protein,
      total_carbs: acc.total_carbs + meal.total_carbs,
      total_fat: acc.total_fat + meal.total_fat,
      meals_count: acc.meals_count + 1,
    }),
    {
      total_calories: 0,
      total_protein: 0,
      total_carbs: 0,
      total_fat: 0,
      meals_count: 0,
    }
  );

  return {
    date,
    ...stats,
    goal_calories: 2000,
    goal_protein: 150,
    goal_carbs: 250,
    goal_fat: 65,
  };
}
