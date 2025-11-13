import { NextRequest, NextResponse } from 'next/server';
import { getMeals, saveMeal, getDailyStats } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'demo-user';
    const date = searchParams.get('date');
    const statsOnly = searchParams.get('statsOnly') === 'true';

    if (statsOnly && date) {
      const stats = await getDailyStats(userId, date);
      return NextResponse.json(stats);
    }

    const meals = await getMeals(userId, date || undefined);
    return NextResponse.json(meals);
  } catch (error: any) {
    console.error('Error fetching meals:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch meals' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const meal = await saveMeal(body);
    return NextResponse.json(meal);
  } catch (error: any) {
    console.error('Error saving meal:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save meal' },
      { status: 500 }
    );
  }
}
