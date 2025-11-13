import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Buscar histórico de refeições
    const { data, error } = await supabase
      .from('meal_history')
      .select(`
        *,
        meals (
          id,
          image_url,
          analysis,
          created_at
        )
      `)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching history:', error);
      return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
    }

    return NextResponse.json({ history: data || [] });
  } catch (error) {
    console.error('Error in history GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { meal_id, action, details } = body;

    if (!meal_id || !action) {
      return NextResponse.json({ error: 'meal_id and action are required' }, { status: 400 });
    }

    const supabase = createClient();

    const { data, error } = await supabase
      .from('meal_history')
      .insert({
        meal_id,
        action,
        details: details || {},
        user_id: null // Será preenchido quando houver autenticação
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating history entry:', error);
      return NextResponse.json({ error: 'Failed to create history entry' }, { status: 500 });
    }

    return NextResponse.json({ history: data });
  } catch (error) {
    console.error('Error in history POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
