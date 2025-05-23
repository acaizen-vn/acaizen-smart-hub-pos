
import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { User } from '@/types';
import { storage, hashPassword } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Pencil, User as UserIcon } from 'lucide-react';

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<Partial<User>>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const { toast } = useToast();
  const { authState, createUser, updateUser, deleteUser } = useAuth();
  
  // Carregar usuários do localStorage
  useEffect(() => {
    const loadedUsers = storage.getUsers();
    setUsers(loadedUsers);
  }, []);
  
  const openUserDialog = (user?: User) => {
    if (user) {
      // Editar usuário existente (esconder a senha real)
      setCurrentUser({
        ...user,
        password: '' // Deixar em branco para não mostrar a senha atual
      });
    } else {
      // Criar novo usuário
      setCurrentUser({
        name: '',
        email: '',
        password: '',
        role: 'cashier',
        active: true
      });
    }
    setIsDialogOpen(true);
  };
  
  const saveUser = async () => {
    if (!currentUser.name || !currentUser.email) {
      toast({
        title: "Erro ao salvar usuário",
        description: "Nome e email são obrigatórios",
        variant: "destructive"
      });
      return;
    }
    
    if (!currentUser.id && !currentUser.password) {
      toast({
        title: "Erro ao salvar usuário",
        description: "A senha é obrigatória para novos usuários",
        variant: "destructive"
      });
      return;
    }
    
    try {
      let success = false;
      
      if (currentUser.id) {
        // Atualizar usuário existente
        success = await updateUser(currentUser as User);
      } else {
        // Criar novo usuário
        success = await createUser(currentUser as Omit<User, 'id' | 'createdAt'>);
      }
      
      if (success) {
        setIsDialogOpen(false);
        // Recarregar a lista de usuários
        setUsers(storage.getUsers());
      }
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar o usuário",
        variant: "destructive"
      });
    }
  };
  
  const handleDeleteUser = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      const success = await deleteUser(id);
      if (success) {
        setUsers(storage.getUsers());
      }
    }
  };
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">Gerenciamento de Funcionários</h1>
        </div>
        
        <div className="glass rounded-lg p-6 space-y-6">
          <div className="flex justify-between">
            <Button onClick={() => openUserDialog()} className="btn-primary">
              <Plus className="h-4 w-4 mr-2" /> Novo Funcionário
            </Button>
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[120px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role === 'admin' ? 'Administrador' : 'Caixa'}</TableCell>
                    <TableCell>{user.active ? 'Ativo' : 'Inativo'}</TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => openUserDialog(user)}
                        className="flex items-center"
                        disabled={user.id === authState.user?.id} // Não permitir editar o próprio usuário
                      >
                        <Pencil className="h-4 w-4 mr-2" /> Editar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                
                {users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                      Nenhum usuário cadastrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
      
      {/* Dialog para edição/criação de usuários */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md glass">
          <DialogHeader>
            <DialogTitle>
              {currentUser.id ? 'Editar Funcionário' : 'Novo Funcionário'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="user-name">Nome*</Label>
              <Input 
                id="user-name"
                value={currentUser.name || ''}
                onChange={(e) => setCurrentUser({ ...currentUser, name: e.target.value })}
                placeholder="Nome completo"
                className="bg-white/40"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="user-email">Email*</Label>
              <Input 
                id="user-email"
                type="email"
                value={currentUser.email || ''}
                onChange={(e) => setCurrentUser({ ...currentUser, email: e.target.value })}
                placeholder="email@exemplo.com"
                className="bg-white/40"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="user-password">
                {currentUser.id ? 'Nova Senha (deixe em branco para manter a atual)' : 'Senha*'}
              </Label>
              <Input 
                id="user-password"
                type="password"
                value={currentUser.password || ''}
                onChange={(e) => setCurrentUser({ ...currentUser, password: e.target.value })}
                placeholder={currentUser.id ? '••••••••' : 'Digite a senha'}
                className="bg-white/40"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="user-role">Função*</Label>
              <Select 
                value={currentUser.role} 
                onValueChange={(value: 'admin' | 'cashier') => setCurrentUser({ ...currentUser, role: value })}
              >
                <SelectTrigger id="user-role" className="bg-white/40">
                  <SelectValue placeholder="Selecione a função" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="cashier">Caixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="user-active"
                checked={currentUser.active}
                onCheckedChange={(checked) => setCurrentUser({ ...currentUser, active: checked })}
              />
              <Label htmlFor="user-active">Ativo</Label>
            </div>
          </div>
          
          <DialogFooter className="sm:justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={saveUser} className="btn-primary">
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default UsersPage;
