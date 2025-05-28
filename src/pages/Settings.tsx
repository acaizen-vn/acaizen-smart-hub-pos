import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StoreSettings, PaymentGateway, WhatsAppSettings, PrintSettings } from '@/types';
import { storage } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { Save, Download, Upload, Printer, Store, Database, FileJson, CreditCard, MessageCircle, Settings as SettingsIcon } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

const SettingsPage = () => {
  const [settings, setSettings] = useState<StoreSettings>({
    name: '',
    phone: '',
    address: '',
    instagram: '',
    facebook: '',
    logoUrl: '',
    systemTitle: '',
    paymentGateways: [],
    whatsapp: {
      enabled: false,
      connected: false,
      botEnabled: false,
      welcomeMessage: 'Olá! Como posso ajudá-lo?',
      autoReply: false,
      phoneNumber: '',
    },
    print: {
      autoprint: true,
      paperSize: '80mm',
      copies: 2,
    },
  });
  
  const [isBackupDialogOpen, setIsBackupDialogOpen] = useState(false);
  const [backupData, setBackupData] = useState('');
  const [backupOperation, setBackupOperation] = useState<'export' | 'import'>('export');
  
  const { toast } = useToast();
  
  // Carregar configurações do localStorage
  useEffect(() => {
    const storedSettings = storage.getStoreSettings();
    setSettings(prev => ({ ...prev, ...storedSettings }));
  }, []);
  
  const saveSettings = () => {
    try {
      storage.saveStoreSettings(settings);
      toast({
        title: 'Configurações salvas',
        description: 'As configurações foram salvas com sucesso. A página será recarregada para aplicar as alterações.',
      });
      
      // Recarregar a página depois de um pequeno delay para aplicar as mudanças
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar as configurações.',
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

  const handlePaymentGatewayChange = (index: number, field: keyof PaymentGateway, value: any) => {
    const updatedGateways = [...settings.paymentGateways];
    updatedGateways[index] = { ...updatedGateways[index], [field]: value };
    setSettings({ ...settings, paymentGateways: updatedGateways });
  };

  const addPaymentGateway = () => {
    const newGateway: PaymentGateway = {
      id: Date.now().toString(),
      name: 'Novo Gateway',
      active: false,
      apiKey: '',
      environment: 'sandbox',
      type: 'mercadopago',
    };
    setSettings({
      ...settings,
      paymentGateways: [...settings.paymentGateways, newGateway],
    });
  };

  const removePaymentGateway = (index: number) => {
    const updatedGateways = settings.paymentGateways.filter((_, i) => i !== index);
    setSettings({ ...settings, paymentGateways: updatedGateways });
  };

  const handleWhatsAppChange = (field: keyof WhatsAppSettings, value: any) => {
    setSettings({
      ...settings,
      whatsapp: { ...settings.whatsapp, [field]: value },
    });
  };

  const handlePrintChange = (field: keyof PrintSettings, value: any) => {
    setSettings({
      ...settings,
      print: { ...settings.print, [field]: value },
    });
  };
  
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Arquivo inválido',
          description: 'Por favor, selecione apenas arquivos de imagem (PNG, JPG, JPEG).',
          variant: 'destructive',
        });
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: 'Arquivo muito grande',
          description: 'Por favor, selecione uma imagem com menos de 2MB.',
          variant: 'destructive',
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setSettings({
          ...settings,
          logoUrl: result,
        });
        toast({
          title: 'Logo carregada',
          description: 'A logo foi carregada com sucesso. Lembre-se de salvar as configurações.',
        });
      };
      reader.readAsDataURL(file);
    }
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
          <TabsList className="grid grid-cols-5 mb-6">
            <TabsTrigger value="store" className="flex items-center text-xs">
              <Store className="h-4 w-4 mr-1" />
              Loja
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center text-xs">
              <CreditCard className="h-4 w-4 mr-1" />
              Pagamentos
            </TabsTrigger>
            <TabsTrigger value="whatsapp" className="flex items-center text-xs">
              <MessageCircle className="h-4 w-4 mr-1" />
              WhatsApp
            </TabsTrigger>
            <TabsTrigger value="print" className="flex items-center text-xs">
              <Printer className="h-4 w-4 mr-1" />
              Impressão
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center text-xs">
              <Database className="h-4 w-4 mr-1" />
              Sistema
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="store">
            <Card>
              <CardHeader>
                <CardTitle>Dados da Loja</CardTitle>
                <CardDescription>
                  Configure as informações da sua loja que aparecerão nos comprovantes, na tela de login e em todo o sistema.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Logo Upload */}
                <div className="space-y-4">
                  <Label htmlFor="logo-upload">Logo da Loja</Label>
                  <div className="flex items-center space-x-4">
                    {settings.logoUrl && (
                      <div className="flex-shrink-0">
                        <img 
                          src={settings.logoUrl} 
                          alt="Logo atual" 
                          className="h-16 w-auto rounded-lg border border-gray-200 object-contain"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <Input
                        id="logo-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="bg-white/40"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Formatos aceitos: PNG, JPG, JPEG. Tamanho máximo: 2MB. Esta logo aparecerá na tela de login e em todo o sistema.
                      </p>
                    </div>
                  </div>
                </div>

                {/* System Title */}
                <div className="space-y-2">
                  <Label htmlFor="system-title">Título do Sistema</Label>
                  <Input
                    id="system-title"
                    value={settings.systemTitle || ''}
                    onChange={(e) => handleInputChange(e, 'systemTitle')}
                    placeholder="Ex: Bem-vindo ao Sistema de Vendas"
                    className="bg-white/40"
                  />
                  <p className="text-xs text-muted-foreground">
                    Aparecerá abaixo da logo na tela de login
                  </p>
                </div>

                {/* Store Name */}
                <div className="space-y-2">
                  <Label htmlFor="store-name">Nome da Loja</Label>
                  <Input
                    id="store-name"
                    value={settings.name}
                    onChange={(e) => handleInputChange(e, 'name')}
                    placeholder="Nome da sua loja"
                    className="bg-white/40"
                  />
                  <p className="text-xs text-muted-foreground">
                    Este nome aparecerá em todo o sistema, incluindo o cabeçalho e comprovantes
                  </p>
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

          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Gateways de Pagamento</CardTitle>
                <CardDescription>
                  Configure os gateways de pagamento para aceitar Pix, cartões e outros métodos.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {settings.paymentGateways.map((gateway, index) => (
                  <div key={gateway.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <Input
                        value={gateway.name}
                        onChange={(e) => handlePaymentGatewayChange(index, 'name', e.target.value)}
                        placeholder="Nome do Gateway"
                        className="bg-white/40"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removePaymentGateway(index)}
                      >
                        Remover
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Tipo</Label>
                        <Select
                          value={gateway.type}
                          onValueChange={(value) => handlePaymentGatewayChange(index, 'type', value)}
                        >
                          <SelectTrigger className="bg-white/40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mercadopago">Mercado Pago</SelectItem>
                            <SelectItem value="pagseguro">PagSeguro</SelectItem>
                            <SelectItem value="stripe">Stripe</SelectItem>
                            <SelectItem value="paypal">PayPal</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label>Ambiente</Label>
                        <Select
                          value={gateway.environment}
                          onValueChange={(value) => handlePaymentGatewayChange(index, 'environment', value)}
                        >
                          <SelectTrigger className="bg-white/40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sandbox">Sandbox (Teste)</SelectItem>
                            <SelectItem value="production">Produção</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div>
                      <Label>API Key</Label>
                      <Input
                        type="password"
                        value={gateway.apiKey}
                        onChange={(e) => handlePaymentGatewayChange(index, 'apiKey', e.target.value)}
                        placeholder="Sua API Key"
                        className="bg-white/40"
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={gateway.active}
                        onCheckedChange={(checked) => handlePaymentGatewayChange(index, 'active', checked)}
                      />
                      <Label>Gateway ativo</Label>
                    </div>
                  </div>
                ))}
                
                <Button onClick={addPaymentGateway} variant="outline" className="w-full">
                  Adicionar Gateway de Pagamento
                </Button>
              </CardContent>
              <CardFooter>
                <Button onClick={saveSettings} className="btn-primary">
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Configurações
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="whatsapp">
            <Card>
              <CardHeader>
                <CardTitle>WhatsApp Business</CardTitle>
                <CardDescription>
                  Configure a integração com WhatsApp para atendimento automatizado.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.whatsapp.enabled}
                    onCheckedChange={(checked) => handleWhatsAppChange('enabled', checked)}
                  />
                  <Label>Ativar WhatsApp</Label>
                </div>
                
                <div className="space-y-2">
                  <Label>Número do WhatsApp</Label>
                  <Input
                    value={settings.whatsapp.phoneNumber}
                    onChange={(e) => handleWhatsAppChange('phoneNumber', e.target.value)}
                    placeholder="5511999999999"
                    className="bg-white/40"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.whatsapp.botEnabled}
                    onCheckedChange={(checked) => handleWhatsAppChange('botEnabled', checked)}
                  />
                  <Label>Ativar Bot de Atendimento</Label>
                </div>
                
                <div className="space-y-2">
                  <Label>Mensagem de Boas-vindas</Label>
                  <Textarea
                    value={settings.whatsapp.welcomeMessage}
                    onChange={(e) => handleWhatsAppChange('welcomeMessage', e.target.value)}
                    placeholder="Mensagem automática de boas-vindas"
                    className="bg-white/40"
                    rows={3}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.whatsapp.autoReply}
                    onCheckedChange={(checked) => handleWhatsAppChange('autoReply', checked)}
                  />
                  <Label>Resposta Automática</Label>
                </div>
                
                {settings.whatsapp.enabled && (
                  <div className="border rounded-lg p-4 bg-blue-50">
                    <h4 className="font-medium mb-2">Status da Conexão</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      {settings.whatsapp.connected 
                        ? '✅ WhatsApp conectado e funcionando' 
                        : '❌ WhatsApp não conectado - Escaneie o QR Code'}
                    </p>
                    
                    {!settings.whatsapp.connected && (
                      <div className="text-center">
                        <div className="bg-white p-4 rounded border inline-block">
                          <p className="text-sm mb-2">QR Code aparecerá aqui</p>
                          <div className="w-32 h-32 bg-gray-200 rounded"></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Escaneie com o WhatsApp do seu celular
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button onClick={saveSettings} className="btn-primary">
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Configurações
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="print">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Impressão</CardTitle>
                <CardDescription>
                  Configure como os comprovantes serão impressos.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.print.autoprint}
                    onCheckedChange={(checked) => handlePrintChange('autoprint', checked)}
                  />
                  <Label>Impressão Automática</Label>
                </div>
                
                <div className="space-y-2">
                  <Label>Tamanho do Papel</Label>
                  <Select
                    value={settings.print.paperSize}
                    onValueChange={(value) => handlePrintChange('paperSize', value)}
                  >
                    <SelectTrigger className="bg-white/40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="58mm">58mm</SelectItem>
                      <SelectItem value="80mm">80mm</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Número de Cópias</Label>
                  <Select
                    value={settings.print.copies.toString()}
                    onValueChange={(value) => handlePrintChange('copies', parseInt(value))}
                  >
                    <SelectTrigger className="bg-white/40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 via (Cliente)</SelectItem>
                      <SelectItem value="2">2 vias (Cliente + Produção)</SelectItem>
                      <SelectItem value="3">3 vias (Cliente + Produção + Arquivo)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Nome da Impressora (Opcional)</Label>
                  <Input
                    value={settings.print.printerName || ''}
                    onChange={(e) => handlePrintChange('printerName', e.target.value)}
                    placeholder="Ex: POS-80"
                    className="bg-white/40"
                  />
                  <p className="text-xs text-muted-foreground">
                    Deixe em branco para usar a impressora padrão
                  </p>
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
                  Salvar Configurações
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
