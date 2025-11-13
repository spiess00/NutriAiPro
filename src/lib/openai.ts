import OpenAI from 'openai';

// Validar se a API key está configurada
if (!process.env.OPENAI_API_KEY) {
  console.error('⚠️ OPENAI_API_KEY não configurada! Configure nas variáveis de ambiente.');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'sk-placeholder',
});

export async function analyzeMealImage(imageUrl: string) {
  try {
    // Validar URL da imagem
    if (!imageUrl || typeof imageUrl !== 'string') {
      throw new Error('URL da imagem inválida');
    }

    console.log('🔍 Analisando imagem:', imageUrl);

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `Você é um nutricionista profissional especializado em análise de alimentos por imagem. 

IMPORTANTE: Sua resposta DEVE ser APENAS um objeto JSON válido, sem texto adicional antes ou depois.

Analise a imagem da refeição e retorne um JSON com esta estrutura EXATA:

{
  "foods": [
    {
      "name": "Nome do alimento em português",
      "quantity": "Quantidade estimada (ex: '150g', '1 xícara', '2 fatias', '200ml')",
      "calories": número_inteiro,
      "protein": número_inteiro_em_gramas,
      "carbs": número_inteiro_em_gramas,
      "fat": número_inteiro_em_gramas
    }
  ],
  "analysis_text": "Descrição breve e profissional da refeição em português"
}

REGRAS IMPORTANTES:
- Seja preciso com porções e valores nutricionais
- Use dados nutricionais reais e confiáveis
- Estime o peso/quantidade de cada alimento visível
- Se não conseguir identificar claramente, faça sua melhor estimativa profissional
- Todos os valores numéricos devem ser números inteiros (sem decimais)
- Retorne APENAS o JSON, sem markdown, sem texto adicional`,
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Analise esta imagem de refeição e forneça informações nutricionais detalhadas para cada alimento visível. Retorne APENAS o JSON, sem formatação markdown.',
            },
            {
              type: 'image_url',
              image_url: { 
                url: imageUrl,
                detail: 'high'
              },
            },
          ],
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 2000,
      temperature: 0.3, // Mais determinístico para análises consistentes
    });

    const content = response.choices[0].message.content;
    
    if (!content) {
      throw new Error('Nenhuma resposta recebida da OpenAI');
    }

    console.log('✅ Resposta da OpenAI recebida');

    // Parse do JSON
    let result;
    try {
      result = JSON.parse(content);
    } catch (parseError) {
      console.error('❌ Erro ao fazer parse do JSON:', content);
      throw new Error('Resposta da IA não está em formato JSON válido');
    }

    // Validar estrutura da resposta
    if (!result.foods || !Array.isArray(result.foods)) {
      throw new Error('Resposta da IA não contém array de alimentos');
    }

    // Calcular totais
    const totals = result.foods.reduce(
      (acc: any, food: any) => ({
        calories: acc.calories + (Number(food.calories) || 0),
        protein: acc.protein + (Number(food.protein) || 0),
        carbs: acc.carbs + (Number(food.carbs) || 0),
        fat: acc.fat + (Number(food.fat) || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    const finalResult = {
      foods: result.foods.map((food: any) => ({
        name: food.name || 'Alimento não identificado',
        quantity: food.quantity || 'Quantidade não especificada',
        calories: Math.round(Number(food.calories) || 0),
        protein: Math.round(Number(food.protein) || 0),
        carbs: Math.round(Number(food.carbs) || 0),
        fat: Math.round(Number(food.fat) || 0),
      })),
      total_calories: Math.round(totals.calories),
      total_protein: Math.round(totals.protein),
      total_carbs: Math.round(totals.carbs),
      total_fat: Math.round(totals.fat),
      analysis_text: result.analysis_text || 'Análise da refeição concluída',
    };

    console.log('📊 Análise completa:', {
      foods_count: finalResult.foods.length,
      total_calories: finalResult.total_calories,
    });

    return finalResult;
  } catch (error: any) {
    console.error('❌ Erro na análise da imagem:', error);
    
    // Tratamento de erros específicos
    if (error.code === 'invalid_api_key') {
      throw new Error('Chave da API OpenAI inválida. Configure OPENAI_API_KEY nas variáveis de ambiente.');
    }
    
    if (error.code === 'insufficient_quota') {
      throw new Error('Cota da API OpenAI excedida. Verifique seu plano.');
    }

    if (error.message?.includes('URL')) {
      throw new Error('Erro ao acessar a imagem. Verifique se a URL está acessível.');
    }

    throw new Error(error.message || 'Erro ao analisar a imagem com IA');
  }
}
