import { NextRequest, NextResponse } from 'next/server';
import { analyzeMealImage } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageUrl } = body;

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      );
    }

    // Validar se a URL é válida
    try {
      new URL(imageUrl);
    } catch {
      return NextResponse.json(
        { error: 'Invalid image URL format' },
        { status: 400 }
      );
    }

    const analysis = await analyzeMealImage(imageUrl);

    return NextResponse.json(analysis, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error: any) {
    console.error('Error analyzing meal:', error);
    
    // Retornar erro mais detalhado
    const errorMessage = error.message || 'Failed to analyze meal';
    const errorDetails = error.response?.data || error.toString();
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: errorDetails,
        timestamp: new Date().toISOString()
      },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
