'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Phone, Weight, Calendar, Save, Loader2 } from 'lucide-react';

interface UserProfile {
  id?: string;
  name: string;
  email: string;
  weight: number | null;
  age: number | null;
  contact: string;
}

export default function ProfileForm() {
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: '',
    weight: null,
    age: null,
    contact: ''
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/profile');
      const data = await response.json();
      
      if (data.profile) {
        setProfile(data.profile);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile),
      });

      const data = await response.json();

      if (response.ok) {
        setProfile(data.profile);
        setMessage('Perfil salvo com sucesso!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Erro ao salvar perfil. Tente novamente.');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      setMessage('Erro ao salvar perfil. Tente novamente.');
    } finally {
      setSaving(false);
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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Perfil do Cliente
        </CardTitle>
        <CardDescription>
          Gerencie suas informações pessoais e dados de saúde
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Nome Completo *
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Digite seu nome completo"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              required
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email *
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              required
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weight" className="flex items-center gap-2">
                <Weight className="h-4 w-4" />
                Peso (kg)
              </Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                placeholder="70.5"
                value={profile.weight || ''}
                onChange={(e) => setProfile({ ...profile, weight: e.target.value ? parseFloat(e.target.value) : null })}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="age" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Idade
              </Label>
              <Input
                id="age"
                type="number"
                placeholder="25"
                value={profile.age || ''}
                onChange={(e) => setProfile({ ...profile, age: e.target.value ? parseInt(e.target.value) : null })}
                className="w-full"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Contato
            </Label>
            <Input
              id="contact"
              type="tel"
              placeholder="(11) 99999-9999"
              value={profile.contact}
              onChange={(e) => setProfile({ ...profile, contact: e.target.value })}
              className="w-full"
            />
          </div>

          {message && (
            <div className={`p-3 rounded-lg text-sm ${
              message.includes('sucesso') 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message}
            </div>
          )}

          <Button 
            type="submit" 
            disabled={saving}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Salvar Perfil
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
