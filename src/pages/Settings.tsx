
import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { StoreSettings } from '@/types';
import { storage } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { Save, Download, Upload, Printer, Store, Database, FileJson } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

const SettingsPage = () => {
  const [settings, setSettings] = useState<StoreSettings>({
    name: '',
    phone: '',
    address: '',
    instagram: '',
    facebook: '',
  });
  
  const [isBackupDialogOpen, setIsBackupDialogOpen] = useState(false);
  const [backupData, setBackupData] = useState('');
  const [backupOperation, setBackupOperation] = useState<'export' | 'import'>('export');
  
  const { toast } = useToast();
  
  // Carregar configurações do localStorage
  useEffect(() => {
    const storedSettings = storage.getStoreSettings();
    setSettings(storedSettings);
  }, []);
  
  const saveSettings = () => {
    try {
      storage.saveStoreSettings(settings);
      toast({
        title: 'Configurações salvas',
        description: 'As configurações da loja foram salvas com sucesso.',
      });
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar as configurações da loja.',
        variant: 'destructive',
      });
    }
  };
  
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: keyof StoreSettings
  ) => {
    setSettings({
      ...settings,
      [field]: e.target.value,
    });
  };
  
  const openExportDialog = () => {
    const data = storage.exportData();
    setBackupData(data);
    setBackupOperation('export');
    setIsBackupDialogOpen(true);
  };
  
  const openImportDialog = () => {
    setBackupData('');
    setBackupOperation('import');
    setIsBackupDialogOpen(true);
  };
  
  const handleImportData = () => {
    if (!backupData.trim()) {
      toast({
        title: 'Erro na importação',
        description: 'Por favor, insira os dados de backup.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      const success = storage.importData(backupData);
      
      if (success) {
        setIsBackupDialogOpen(false);
        toast({
          title: 'Dados importados',
          description: 'Os dados foram importados com sucesso. A página será recarregada.',
        });
        
        // Recarregar a página depois de um pequeno delay
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        throw new Error('Falha na importação');
      }
    } catch (error) {
      console.error('Erro ao importar dados:', error);
      toast({
        title: 'Erro na importação',
        description: 'O formato dos dados de backup é inválido.',
        variant: 'destructive',
      });
    }
  };
  
  const handleDownloadBackup = () => {
    try {
      const blob = new Blob([backupData], { type: 'application/json' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `acaizen_backup_${new Date().toISOString().split('T')[0]}.json`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setIsBackupDialogOpen(false);
      
      toast({
        title: 'Backup salvo',
        description: 'O arquivo de backup foi baixado com sucesso.',
      });
    } catch (error) {
      console.error('Erro ao baixar backup:', error);
      toast({
        title: 'Erro ao baixar',
        description: 'Não foi possível baixar o arquivo de backup.',
        variant: 'destructive',
      });
    }
  };
  
  const handlePrintTest = () => {
    const printWindow = window.open('', '', 'height=800,width=800');
    if (printWindow) {
      printWindow.document.write('<html><head><title>Teste de Impressão</title>');
      printWindow.document.write(`
        <style>
          body {
            font-family: 'Courier', monospace;
            width: 79mm;
            margin: 0;
            padding: 10px 0;
          }
          .receipt-content {
            width: 79mm;
            padding: 0 5px;
          }
          .text-center { text-align: center; }
          .text-left { text-align: left; }
          .text-right { text-align: right; }
          .bold { font-weight: bold; }
          .divider {
            border-top: 1px dashed #000;
            margin: 10px 0;
          }
        </style>
      `);
      
      printWindow.document.write('</head><body>');
      
      printWindow.document.write(`
        <div class="receipt-content">
          <div class="text-center">
            <div class="bold">${settings.name}</div>
            <div>${settings.address}</div>
            <div>${settings.phone}</div>
            ${settings.instagram && `<div>${settings.instagram}</div>`}
          </div>
          
          <div class="divider"></div>
          
          <div class="text-center">
            <div class="bold">TESTE DE IMPRESSÃO</div>
            <div>${new Date().toLocaleString('pt-BR')}</div>
          </div>
          
          <div class="divider"></div>
          
          <div>
            Este é um teste para verificar se a impressora está configurada corretamente.
          </div>
          
          <div class="divider"></div>
          
          <div class="text-center">
            <div>Se você consegue ler este texto,</div>
            <div>a impressão está funcionando!</div>
          </div>
        </div>
      `);
      
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
  };
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">Configurações</h1>
        </div>
        
        <Tabs defaultValue="store" className="glass rounded-lg p-6">
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="store" className="flex items-center">
              <Store className="h-4 w-4 mr-2" />
              Dados da Loja
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center">
              <Database className="h-4 w-4 mr-2" />
              Sistema
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="store">
            <Card>
              <CardHeader>
                <CardTitle>Dados da Loja</CardTitle>
                <CardDescription>
                  Configure as informações da sua loja que aparecerão nos comprovantes.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="store-name">Nome da Loja</Label>
                  <Input
                    id="store-name"
                    value={settings.name}
                    onChange={(e) => handleInputChange(e, 'name')}
                    placeholder="Nome da sua loja"
                    className="bg-white/40"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="store-address">Endereço</Label>
                  <Input
                    id="store-address"
                    value={settings.address}
                    onChange={(e) => handleInputChange(e, 'address')}
                    placeholder="Endereço da loja"
                    className="bg-white/40"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="store-phone">Telefone</Label>
                  <Input
                    id="store-phone"
                    value={settings.phone}
                    onChange={(e) => handleInputChange(e, 'phone')}
                    placeholder="(00) 00000-0000"
                    className="bg-white/40"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="store-instagram">Instagram</Label>
                  <Input
                    id="store-instagram"
                    value={settings.instagram}
                    onChange={(e) => handleInputChange(e, 'instagram')}
                    placeholder="@seuinstagram"
                    className="bg-white/40"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="store-facebook">Facebook</Label>
                  <Input
                    id="store-facebook"
                    value={settings.facebook}
                    onChange={(e) => handleInputChange(e, 'facebook')}
                    placeholder="facebook.com/suapagina"
                    className="bg-white/40"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={handlePrintTest}
                  className="flex items-center"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Teste de Impressão
                </Button>
                <Button onClick={saveSettings} className="btn-primary">
                  <Save className="h-4 w-4 mr-2" />
                  Salvar
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="system">
            <Card>
              <CardHeader>
                <CardTitle>Backup e Restauração</CardTitle>
                <CardDescription>
                  Faça backup dos dados do sistema ou restaure a partir de um backup anterior.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  O backup inclui todos os dados do sistema: usuários, produtos, categorias, adicionais, vendas e configurações.
                </p>
              </CardContent>
              <CardFooter className="flex-col sm:flex-row space-y-2 sm:space-y-0 sm:justify-between">
                <Button 
                  variant="outline" 
                  onClick={openExportDialog}
                  className="w-full sm:w-auto flex items-center"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Dados
                </Button>
                <Button 
                  variant="outline" 
                  onClick={openImportDialog}
                  className="w-full sm:w-auto flex items-center"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Importar Dados
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Dialog para backup/restauração */}
      <Dialog open={isBackupDialogOpen} onOpenChange={setIsBackupDialogOpen}>
        <DialogContent className="max-w-md glass">
          <DialogHeader>
            <DialogTitle>
              {backupOperation === 'export' ? 'Exportar Dados' : 'Importar Dados'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            {backupOperation === 'export' ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  A seguir estão os dados de backup do sistema. Você pode copiá-los ou baixá-los como arquivo JSON.
                </p>
                
                <div className="space-y-2">
                  <Label htmlFor="backup-data">Dados de Backup</Label>
                  <Textarea
                    id="backup-data"
                    value={backupData}
                    readOnly
                    rows={10}
                    className="font-mono text-xs bg-white/40"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Cole os dados de backup abaixo para restaurar o sistema. <strong>Isso substituirá todos os dados atuais!</strong>
                </p>
                
                <div className="space-y-2">
                  <Label htmlFor="import-data">Dados de Backup</Label>
                  <Textarea
                    id="import-data"
                    value={backupData}
                    onChange={(e) => setBackupData(e.target.value)}
                    rows={10}
                    className="font-mono text-xs bg-white/40"
                  />
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter className="sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsBackupDialogOpen(false)}
            >
              Cancelar
            </Button>
            
            {backupOperation === 'export' ? (
              <Button onClick={handleDownloadBackup} className="btn-primary">
                <FileJson className="h-4 w-4 mr-2" />
                Baixar JSON
              </Button>
            ) : (
              <Button onClick={handleImportData} className="btn-primary">
                <Upload className="h-4 w-4 mr-2" />
                Importar
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default SettingsPage;
