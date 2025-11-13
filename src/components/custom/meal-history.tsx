'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { History, Calendar, Utensils, Loader2, TrendingUp, TrendingDown } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MealHistoryEntry {
  id: string;
  action: string;
  details: any;
  created_at: string;
  meals?: {
    id: string;
    image_url: string;
    analysis: any;
    created_at: string;
  };
}

export default function MealHistoryList() {
  const [history, setHistory] = useState<MealHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/history');
      const data = await response.json();
      
      if (data.history) {
        setHistory(data.history);
      }
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </CardContent>
      </Card>
    );
  }

  if (history.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Histórico de Registros
          </CardTitle>
          <CardDescription>
            Acompanhe todas as suas refeições registradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Utensils className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">Nenhum registro encontrado</p>
            <p className="text-sm text-gray-500 mt-2">
              Comece adicionando suas refeições para ver o histórico aqui
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Histórico de Registros
        </CardTitle>
        <CardDescription>
          {history.length} {history.length === 1 ? 'registro encontrado' : 'registros encontrados'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {history.map((entry) => (
            <div
              key={entry.id}
              className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
            >
              <div className="flex-shrink-0">
                {entry.meals?.image_url ? (
                  <img
                    src={entry.meals.image_url}
                    alt="Refeição"
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                    <Utensils className="h-8 w-8 text-blue-600" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    {entry.action === 'meal_added' && (
                      <>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        Refeição Adicionada
                      </>
                    )}
                    {entry.action === 'meal_analyzed' && (
                      <>
                        <Utensils className="h-4 w-4 text-blue-600" />
                        Refeição Analisada
                      </>
                    )}
                    {entry.action !== 'meal_added' && entry.action !== 'meal_analyzed' && (
                      <>
                        <History className="h-4 w-4 text-gray-600" />
                        {entry.action}
                      </>
                    )}
                  </h4>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(entry.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </span>
                </div>

                {entry.meals?.analysis && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
                    <div className="bg-blue-50 rounded-lg p-2">
                      <p className="text-xs text-blue-600 font-medium">Calorias</p>
                      <p className="text-sm font-bold text-blue-900">
                        {entry.meals.analysis.calories || 0} kcal
                      </p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-2">
                      <p className="text-xs text-green-600 font-medium">Proteínas</p>
                      <p className="text-sm font-bold text-green-900">
                        {entry.meals.analysis.protein || 0}g
                      </p>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-2">
                      <p className="text-xs text-yellow-600 font-medium">Carboidratos</p>
                      <p className="text-sm font-bold text-yellow-900">
                        {entry.meals.analysis.carbs || 0}g
                      </p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-2">
                      <p className="text-xs text-orange-600 font-medium">Gorduras</p>
                      <p className="text-sm font-bold text-orange-900">
                        {entry.meals.analysis.fat || 0}g
                      </p>
                    </div>
                  </div>
                )}

                {entry.details && Object.keys(entry.details).length > 0 && (
                  <div className="mt-2 text-sm text-gray-600">
                    {JSON.stringify(entry.details)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
