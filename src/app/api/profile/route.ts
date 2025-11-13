import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Buscar perfil do usuário (simulado - sem auth por enquanto)
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching profile:', error);
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }

    return NextResponse.json({ profile: data || null });
  } catch (error) {
    console.error('Error in profile GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, weight, age, contact } = body;

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    const supabase = createClient();

    // Verificar se já existe perfil
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('id')
      .limit(1)
      .single();

    let result;
    if (existingProfile) {
      // Atualizar perfil existente
      result = await supabase
        .from('user_profiles')
        .update({
          name,
          email,
          weight: weight ? parseFloat(weight) : null,
          age: age ? parseInt(age) : null,
          contact,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingProfile.id)
        .select()
        .single();
    } else {
      // Criar novo perfil
      result = await supabase
        .from('user_profiles')
        .insert({
          name,
          email,
          weight: weight ? parseFloat(weight) : null,
          age: age ? parseInt(age) : null,
          contact,
          user_id: null // Será preenchido quando houver autenticação
        })
        .select()
        .single();
    }

    if (result.error) {
      console.error('Error saving profile:', result.error);
      return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 });
    }

    return NextResponse.json({ profile: result.data });
  } catch (error) {
    console.error('Error in profile POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
