
import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sale, Product } from '@/types';
import { storage, formatCurrency, formatDate } from '@/lib/utils';
import { Download, BarChart4, ShoppingCart, CreditCard } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Add missing types
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

const ReportsPage = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [timeFilter, setTimeFilter] = useState<'day' | 'week' | 'month'>('day');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  
  // Estados derivados
  const [filteredSales, setFilteredSales] = useState<Sale[]>([]);
  const [productStats, setProductStats] = useState<{name: string, quantity: number, total: number}[]>([]);
  const [paymentStats, setPaymentStats] = useState<{method: string, count: number, total: number}[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  
  // Carregar vendas do localStorage
  useEffect(() => {
    const loadedSales = storage.getSales();
    setSales(loadedSales);
  }, []);
  
  // Aplicar filtros quando os filtros ou vendas mudarem
  useEffect(() => {
    if (!sales.length) return;
    
    // Filtrar por período
    const now = new Date();
    let minDate = new Date();
    
    if (timeFilter === 'day') {
      minDate.setHours(0, 0, 0, 0);
    } else if (timeFilter === 'week') {
      minDate.setDate(now.getDate() - 7);
    } else if (timeFilter === 'month') {
      minDate.setMonth(now.getMonth() - 1);
    }
    
    let filtered = sales.filter((sale) => new Date(sale.createdAt) >= minDate);
    
    // Filtrar por método de pagamento
    if (paymentFilter !== 'all') {
      filtered = filtered.filter((sale) => sale.paymentMethod === paymentFilter);
    }
    
    setFilteredSales(filtered);
    
    // Calcular estatísticas de produtos
    const products: Record<string, {name: string, quantity: number, total: number}> = {};
    
    filtered.forEach((sale) => {
      sale.items.forEach((item) => {
        if (!products[item.productId]) {
          products[item.productId] = {
            name: item.productName,
            quantity: 0,
            total: 0,
          };
        }
        products[item.productId].quantity += item.quantity;
        products[item.productId].total += item.subtotal;
      });
    });
    
    const productStatsList = Object.values(products).sort((a, b) => b.quantity - a.quantity);
    
    setProductStats(productStatsList);
    
    // Calcular estatísticas de pagamentos
    const payments: Record<string, {method: string, count: number, total: number}> = {
      cash: { method: 'Dinheiro', count: 0, total: 0 },
      credit: { method: 'Cartão de Crédito', count: 0, total: 0 },
      debit: { method: 'Cartão de Débito', count: 0, total: 0 },
      pix: { method: 'Pix', count: 0, total: 0 },
    };
    
    filtered.forEach((sale) => {
      const method = sale.paymentMethod;
      if (payments[method]) {
        payments[method].count += 1;
        payments[method].total += sale.subtotal;
      }
    });
    
    const paymentStatsList = Object.values(payments).filter((p) => p.count > 0);
    
    setPaymentStats(paymentStatsList);
    
    // Calcular receita total
    const total = filtered.reduce((sum, sale) => sum + sale.subtotal, 0);
    setTotalRevenue(total);
    
  }, [sales, timeFilter, paymentFilter]);
  
  // Exportar para PDF
  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Título
      doc.setFontSize(20);
      doc.text("Relatório de Vendas - Açaízen SmartHUB", 15, 20);
      
      doc.setFontSize(12);
      doc.text(`Período: ${getPeriodText()}`, 15, 30);
      doc.text(`Método de Pagamento: ${getPaymentMethodText()}`, 15, 37);
      doc.text(`Total de vendas: ${filteredSales.length}`, 15, 44);
      doc.text(`Receita total: ${formatCurrency(totalRevenue)}`, 15, 51);
      
      // Tabela de produtos mais vendidos
      doc.setFontSize(16);
      doc.text("Produtos Mais Vendidos", 15, 65);
      
      const productsTableData = productStats.map((product) => [
        product.name,
        product.quantity.toString(),
        formatCurrency(product.total),
      ]);
      
      doc.autoTable({
        startY: 70,
        head: [["Produto", "Quantidade", "Total"]],
        body: productsTableData,
      });
      
      // Tabela de métodos de pagamento
      const finalY = (doc as any).lastAutoTable.finalY || 150;
      
      doc.setFontSize(16);
      doc.text("Métodos de Pagamento", 15, finalY + 15);
      
      const paymentsTableData = paymentStats.map((payment) => [
        payment.method,
        payment.count.toString(),
        formatCurrency(payment.total),
      ]);
      
      doc.autoTable({
        startY: finalY + 20,
        head: [["Método", "Quantidade", "Total"]],
        body: paymentsTableData,
      });
      
      // Tabela de vendas
      const finalY2 = (doc as any).lastAutoTable.finalY || 220;
      
      doc.setFontSize(16);
      doc.text("Lista de Vendas", 15, finalY2 + 15);
      
      const salesTableData = filteredSales.map((sale) => [
        sale.id.substring(0, 6),
        formatDate(sale.createdAt),
        sale.customerName,
        getPaymentMethodName(sale.paymentMethod),
        formatCurrency(sale.subtotal),
      ]);
      
      doc.autoTable({
        startY: finalY2 + 20,
        head: [["ID", "Data", "Cliente", "Pagamento", "Total"]],
        body: salesTableData,
      });
      
      // Data do relatório
      doc.setFontSize(10);
      doc.text(`Relatório gerado em ${new Date().toLocaleString('pt-BR')}`, 15, doc.internal.pageSize.height - 10);
      
      // Salvar o PDF
      doc.save(`relatorio_vendas_${timeFilter}_${paymentFilter}.pdf`);
      
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
    }
  };

  // Exportar para CSV
  const exportToCSV = () => {
    try {
      let csvContent = 'ID,Data,Cliente,Método de Pagamento,Total\n';
      
      filteredSales.forEach((sale) => {
        csvContent += `${sale.id},${formatDate(sale.createdAt)},"${sale.customerName}",${getPaymentMethodName(sale.paymentMethod)},${sale.subtotal}\n`;
      });
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `relatorio_vendas_${timeFilter}_${paymentFilter}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Erro ao exportar CSV:', error);
    }
  };
  
  // Funções auxiliares
  const getPeriodText = () => {
    switch (timeFilter) {
      case 'day': return 'Hoje';
      case 'week': return 'Últimos 7 dias';
      case 'month': return 'Últimos 30 dias';
      default: return '';
    }
  };
  
  const getPaymentMethodName = (method: string) => {
    switch (method) {
      case 'cash': return 'Dinheiro';
      case 'credit': return 'Cartão de Crédito';
      case 'debit': return 'Cartão de Débito';
      case 'pix': return 'Pix';
      default: return method;
    }
  };
  
  const getPaymentMethodText = () => {
    switch (paymentFilter) {
      case 'all': return 'Todos';
      case 'cash': return 'Dinheiro';
      case 'credit': return 'Cartão de Crédito';
      case 'debit': return 'Cartão de Débito';
      case 'pix': return 'Pix';
      default: return '';
    }
  };
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">Relatórios</h1>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={exportToPDF} className="flex items-center">
              <Download className="h-4 w-4 mr-2" />
              Exportar para PDF
            </Button>
            <Button variant="outline" onClick={exportToCSV} className="flex items-center">
              <Download className="h-4 w-4 mr-2" />
              Exportar para CSV
            </Button>
          </div>
        </div>
        
        <div className="glass rounded-lg p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <label className="text-sm font-medium block mb-2">Período</label>
              <Select value={timeFilter} onValueChange={(value: 'day' | 'week' | 'month') => setTimeFilter(value)}>
                <SelectTrigger className="bg-white/40">
                  <SelectValue placeholder="Selecione o período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Hoje</SelectItem>
                  <SelectItem value="week">Últimos 7 dias</SelectItem>
                  <SelectItem value="month">Últimos 30 dias</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1">
              <label className="text-sm font-medium block mb-2">Método de Pagamento</label>
              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger className="bg-white/40">
                  <SelectValue placeholder="Selecione o método" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="cash">Dinheiro</SelectItem>
                  <SelectItem value="credit">Cartão de Crédito</SelectItem>
                  <SelectItem value="debit">Cartão de Débito</SelectItem>
                  <SelectItem value="pix">Pix</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Vendas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{filteredSales.length}</div>
                <p className="text-xs text-muted-foreground">{getPeriodText()}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Receita</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
                <p className="text-xs text-muted-foreground">{getPeriodText()}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Ticket Médio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {filteredSales.length > 0 ? formatCurrency(totalRevenue / filteredSales.length) : formatCurrency(0)}
                </div>
                <p className="text-xs text-muted-foreground">{getPeriodText()}</p>
              </CardContent>
            </Card>
          </div>
          
          <Tabs defaultValue="sales">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="sales" className="flex items-center">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Vendas
              </TabsTrigger>
              <TabsTrigger value="products" className="flex items-center">
                <BarChart4 className="h-4 w-4 mr-2" />
                Produtos
              </TabsTrigger>
              <TabsTrigger value="payments" className="flex items-center">
                <CreditCard className="h-4 w-4 mr-2" />
                Pagamentos
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="sales">
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Pagamento</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSales.map((sale) => (
                      <TableRow key={sale.id}>
                        <TableCell>{sale.id.substring(0, 6)}</TableCell>
                        <TableCell>{formatDate(sale.createdAt)}</TableCell>
                        <TableCell>{sale.customerName}</TableCell>
                        <TableCell>{getPaymentMethodName(sale.paymentMethod)}</TableCell>
                        <TableCell>{formatCurrency(sale.subtotal)}</TableCell>
                      </TableRow>
                    ))}
                    
                    {filteredSales.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                          Nenhuma venda encontrada neste período
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="products">
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto</TableHead>
                      <TableHead>Quantidade</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productStats.map((product, index) => (
                      <TableRow key={index}>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>{product.quantity}</TableCell>
                        <TableCell>{formatCurrency(product.total)}</TableCell>
                      </TableRow>
                    ))}
                    
                    {productStats.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                          Nenhum produto vendido neste período
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="payments">
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Método</TableHead>
                      <TableHead>Vendas</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentStats.map((payment, index) => (
                      <TableRow key={index}>
                        <TableCell>{payment.method}</TableCell>
                        <TableCell>{payment.count}</TableCell>
                        <TableCell>{formatCurrency(payment.total)}</TableCell>
                      </TableRow>
                    ))}
                    
                    {paymentStats.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                          Nenhum pagamento registrado neste período
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
};

export default ReportsPage;
