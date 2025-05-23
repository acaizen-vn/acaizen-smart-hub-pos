
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { initializeDefaultData } from '@/lib/utils';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      // Inicializar dados padrão se for a primeira execução
      initializeDefaultData();
      
      // Tentar fazer login
      const success = await login(email, password);
      
      if (success) {
        navigate('/');
      } else {
        setError('Email ou senha incorretos');
      }
    } catch (error: any) {
      console.error('Erro no login:', error);
      setError(error.message || 'Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-background">
      <div className="w-full max-w-md glass rounded-lg shadow-lg p-6 animate-fade-in">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <img 
              src="/logo.jpg" 
              alt="Açaízen SmartHUB" 
              className="h-24 w-auto rounded-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "https://via.placeholder.com/240x100?text=A%C3%A7a%C3%ADzen";
              }}
            />
          </div>
          <h1 className="text-2xl font-bold">Bem-vindo ao Açaízen SmartHUB</h1>
          <p className="text-muted-foreground mt-2">Faça login para acessar o sistema</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email"
              type="email"
              placeholder="Seu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-white/50"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input 
              id="password"
              type="password"
              placeholder="Sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-white/50"
            />
          </div>
          
          <Button type="submit" className="w-full btn-primary" disabled={isLoading}>
            {isLoading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
        
        <div className="mt-6 pt-4 border-t border-border text-center text-sm text-muted-foreground">
          <p>Usuário padrão: <strong>pdvzen1@gmail.com</strong></p>
          <p>Senha padrão: <strong>Zen2024</strong></p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
