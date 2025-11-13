'use client';

import { useState } from 'react';
import { Camera, Upload, Loader2 } from 'lucide-react';
import { AnalyzeMealResponse } from '@/types';

interface MealUploadProps {
  onAnalysisComplete: (analysis: AnalyzeMealResponse & { imageUrl: string }) => void;
}

export default function MealUpload({ onAnalysisComplete }: MealUploadProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Analyze image
    setIsAnalyzing(true);
    try {
      // Convert to base64 for OpenAI
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      const response = await fetch('/api/analyze-meal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: base64 }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to analyze meal');
      }

      const analysis = await response.json();
      
      // Validar se a resposta tem os campos necessários
      if (!analysis.foods || !Array.isArray(analysis.foods)) {
        throw new Error('Resposta inválida da API');
      }

      onAnalysisComplete({ ...analysis, imageUrl: base64 });
      setPreview(null);
    } catch (error: any) {
      console.error('Error analyzing meal:', error);
      alert(`Erro ao analisar refeição: ${error.message || 'Tente novamente.'}`);
      setPreview(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="w-full">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        id="meal-upload"
        disabled={isAnalyzing}
      />
      
      <label
        htmlFor="meal-upload"
        className={`
          flex flex-col items-center justify-center
          w-full h-48 border-2 border-dashed rounded-2xl
          cursor-pointer transition-all duration-300
          ${isAnalyzing 
            ? 'border-blue-400 bg-blue-50 dark:bg-blue-950/20' 
            : 'border-gray-300 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 bg-gray-50 dark:bg-gray-900/50 hover:bg-blue-50 dark:hover:bg-blue-950/20'
          }
        `}
      >
        {isAnalyzing ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Analisando refeição com IA...
            </p>
          </div>
        ) : preview ? (
          <div className="flex flex-col items-center gap-3">
            <img src={preview} alt="Preview" className="w-32 h-32 object-cover rounded-xl" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Processando...
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="flex gap-2">
              <Camera className="w-10 h-10 text-blue-500" />
              <Upload className="w-10 h-10 text-blue-500" />
            </div>
            <div className="text-center">
              <p className="text-base font-semibold text-gray-700 dark:text-gray-200">
                Tire uma foto da sua refeição
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                A IA analisará os alimentos e nutrientes
              </p>
            </div>
          </div>
        )}
      </label>
    </div>
  );
}
