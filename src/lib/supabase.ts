import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Exportar função para criar cliente (para uso em API routes)
export function createClient() {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey);
}

// Exportar instância padrão (para uso em componentes client-side)
export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey);

// Helper functions
export async function getMeals(userId: string, date?: string) {
  try {
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
    
    if (error) {
      console.error('Supabase error:', error);
      return []; // Retornar array vazio em caso de erro
    }
    
    return data || []; // Garantir que sempre retorna array
  } catch (error) {
    console.error('Error in getMeals:', error);
    return []; // Retornar array vazio em caso de exceção
  }
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
  
  // Garantir que meals é um array antes de usar reduce
  if (!Array.isArray(meals) || meals.length === 0) {
    return {
      date,
      total_calories: 0,
      total_protein: 0,
      total_carbs: 0,
      total_fat: 0,
      meals_count: 0,
      goal_calories: 2000,
      goal_protein: 150,
      goal_carbs: 250,
      goal_fat: 65,
    };
  }
  
  const stats = meals.reduce(
    (acc, meal) => ({
      total_calories: acc.total_calories + (meal.total_calories || 0),
      total_protein: acc.total_protein + (meal.total_protein || 0),
      total_carbs: acc.total_carbs + (meal.total_carbs || 0),
      total_fat: acc.total_fat + (meal.total_fat || 0),
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
