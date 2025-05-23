
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthState, User } from '@/types';
import { hashPassword, storage } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

interface AuthContextProps {
  authState: AuthState;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  createUser: (user: Omit<User, 'id' | 'createdAt'>) => Promise<boolean>;
  updateUser: (user: User) => Promise<boolean>;
  deleteUser: (id: string) => Promise<boolean>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({ user: null, isAuthenticated: false });
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);

  // Carregar o estado de autenticação do localStorage quando o componente for montado
  useEffect(() => {
    const savedAuth = storage.getAuth();
    setAuthState(savedAuth);
    setIsAdmin(savedAuth.user?.role === 'admin');
  }, []);

  // Salvar o estado de autenticação no localStorage sempre que ele mudar
  useEffect(() => {
    storage.saveAuth(authState);
    setIsAdmin(authState.user?.role === 'admin');
  }, [authState]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const users = storage.getUsers();
      const user = users.find(
        (u) => u.email === email && u.password === hashPassword(password) && u.active
      );

      if (user) {
        setAuthState({
          user,
          isAuthenticated: true,
        });
        toast({
          title: 'Login realizado com sucesso!',
          description: `Bem-vindo de volta, ${user.name}!`,
        });
        return true;
      } else {
        toast({
          title: 'Erro de autenticação',
          description: 'Email ou senha incorretos ou usuário inativo.',
          variant: 'destructive',
        });
        return false;
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      toast({
        title: 'Erro ao fazer login',
        description: 'Ocorreu um erro ao processar sua solicitação.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const logout = () => {
    setAuthState({
      user: null,
      isAuthenticated: false,
    });
    toast({
      title: 'Logout realizado',
      description: 'Você saiu do sistema com sucesso.',
    });
  };

  const createUser = async (newUser: Omit<User, 'id' | 'createdAt'>): Promise<boolean> => {
    try {
      const users = storage.getUsers();
      
      // Verificar se já existe um usuário com o mesmo e-mail
      const existingUser = users.find((u) => u.email === newUser.email);
      if (existingUser) {
        toast({
          title: 'Erro ao criar usuário',
          description: 'Já existe um usuário com este e-mail.',
          variant: 'destructive',
        });
        return false;
      }
      
      // Criar o novo usuário
      const user: User = {
        id: Math.random().toString(36).substring(2, 15),
        createdAt: new Date().toISOString(),
        ...newUser,
        password: hashPassword(newUser.password),
      };
      
      // Adicionar o novo usuário à lista de usuários
      users.push(user);
      storage.saveUsers(users);
      
      toast({
        title: 'Usuário criado com sucesso!',
        description: `O usuário ${user.name} foi criado com sucesso.`,
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      toast({
        title: 'Erro ao criar usuário',
        description: 'Ocorreu um erro ao processar sua solicitação.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const updateUser = async (updatedUser: User): Promise<boolean> => {
    try {
      const users = storage.getUsers();
      
      // Verificar se existe um usuário com o ID fornecido
      const index = users.findIndex((u) => u.id === updatedUser.id);
      if (index === -1) {
        toast({
          title: 'Erro ao atualizar usuário',
          description: 'Usuário não encontrado.',
          variant: 'destructive',
        });
        return false;
      }
      
      // Verificar se já existe um usuário com o mesmo e-mail (exceto o usuário atual)
      const existingUserWithSameEmail = users.find(
        (u) => u.email === updatedUser.email && u.id !== updatedUser.id
      );
      if (existingUserWithSameEmail) {
        toast({
          title: 'Erro ao atualizar usuário',
          description: 'Já existe um usuário com este e-mail.',
          variant: 'destructive',
        });
        return false;
      }
      
      // Atualizar o usuário na lista de usuários
      if (updatedUser.password && !updatedUser.password.startsWith('eyJ')) {
        // Se a senha foi alterada, criptografá-la
        updatedUser.password = hashPassword(updatedUser.password);
      }
      
      users[index] = updatedUser;
      storage.saveUsers(users);
      
      // Se o usuário atualizado for o usuário autenticado, atualizar o estado de autenticação
      if (authState.user && authState.user.id === updatedUser.id) {
        setAuthState({
          ...authState,
          user: updatedUser,
        });
      }
      
      toast({
        title: 'Usuário atualizado com sucesso!',
        description: `O usuário ${updatedUser.name} foi atualizado com sucesso.`,
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      toast({
        title: 'Erro ao atualizar usuário',
        description: 'Ocorreu um erro ao processar sua solicitação.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const deleteUser = async (id: string): Promise<boolean> => {
    try {
      const users = storage.getUsers();
      
      // Verificar se existe um usuário com o ID fornecido
      const index = users.findIndex((u) => u.id === id);
      if (index === -1) {
        toast({
          title: 'Erro ao excluir usuário',
          description: 'Usuário não encontrado.',
          variant: 'destructive',
        });
        return false;
      }
      
      // Verificar se o usuário a ser excluído é o usuário autenticado
      if (authState.user && authState.user.id === id) {
        toast({
          title: 'Erro ao excluir usuário',
          description: 'Você não pode excluir seu próprio usuário.',
          variant: 'destructive',
        });
        return false;
      }
      
      // Remover o usuário da lista de usuários
      users.splice(index, 1);
      storage.saveUsers(users);
      
      toast({
        title: 'Usuário excluído com sucesso!',
        description: `O usuário foi excluído com sucesso.`,
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      toast({
        title: 'Erro ao excluir usuário',
        description: 'Ocorreu um erro ao processar sua solicitação.',
        variant: 'destructive',
      });
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        authState,
        login,
        logout,
        createUser,
        updateUser,
        deleteUser,
        isAdmin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
