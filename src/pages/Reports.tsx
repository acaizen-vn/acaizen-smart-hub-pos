import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import ReportsFilters, { ReportFilters } from '@/components/Reports/ReportsFilters';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sale, Product, User } from '@/types';
import { storage, formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import { Download, BarChart4, ShoppingCart, CreditCard, TrendingUp, Clock, Users } from 'lucide-react';
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
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [filters, setFilters] = useState<ReportFilters>({
    paymentMethod: '',
    userId: '',
    productId: '',
    minAmount: '',
    maxAmount: '',
    timeOfDay: '',
    customerName: ''
  });
  
  // Estados derivados
  const [filteredSales, setFilteredSales] = useState<Sale[]>([]);
  const [productStats, setProductStats] = useState<{name: string, quantity: number, total: number}[]>([]);
  const [paymentStats, setPaymentStats] = useState<{method: string, count: number, total: number}[]>([]);
  const [userStats, setUserStats] = useState<{name: string, sales: number, total: number}[]>([]);
  const [hourlyStats, setHourlyStats] = useState<{hour: string, sales: number, total: number}[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  
  // Carregar dados do localStorage
  useEffect(() => {
    const loadedSales = storage.getSales();
    const loadedUsers = storage.getUsers();
    const loadedProducts = storage.getProducts();
    
    setSales(loadedSales);
    setUsers(loadedUsers);
    setProducts(loadedProducts);
  }, []);
  
  // Aplicar filtros quando os filtros ou vendas mudarem
  useEffect(() => {
    if (!sales.length) return;
    
    let filtered = [...sales];
    
    // Filtrar por período
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      startDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter(sale => new Date(sale.createdAt) >= startDate);
    }
    
    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(sale => new Date(sale.createdAt) <= endDate);
    }
    
    // Filtrar por método de pagamento
    if (filters.paymentMethod) {
      filtered = filtered.filter(sale => sale.paymentMethod === filters.paymentMethod);
    }
    
    // Filtrar por usuário
    if (filters.userId) {
      filtered = filtered.filter(sale => sale.createdBy === filters.userId);
    }
    
    // Filtrar por produto
    if (filters.productId) {
      filtered = filtered.filter(sale => 
        sale.items.some(item => item.productId === filters.productId)
      );
    }
    
    // Filtrar por valor
    if (filters.minAmount) {
      const minAmount = parseFloat(filters.minAmount);
      filtered = filtered.filter(sale => sale.subtotal >= minAmount);
    }
    
    if (filters.maxAmount) {
      const maxAmount = parseFloat(filters.maxAmount);
      filtered = filtered.filter(sale => sale.subtotal <= maxAmount);
    }
    
    // Filtrar por período do dia
    if (filters.timeOfDay) {
      filtered = filtered.filter(sale => {
        const hour = new Date(sale.createdAt).getHours();
        switch (filters.timeOfDay) {
          case 'morning': return hour >= 6 && hour < 12;
          case 'afternoon': return hour >= 12 && hour < 18;
          case 'evening': return hour >= 18 && hour < 24;
          case 'dawn': return hour >= 0 && hour < 6;
          default: return true;
        }
      });
    }
    
    // Filtrar por nome do cliente
    if (filters.customerName) {
      const searchTerm = filters.customerName.toLowerCase();
      filtered = filtered.filter(sale => 
        sale.customerName.toLowerCase().includes(searchTerm)
      );
    }
    
    setFilteredSales(filtered);
    
    // Calcular estatísticas de produtos
    const productMap: Record<string, {name: string, quantity: number, total: number}> = {};
    
    filtered.forEach(sale => {
      sale.items.forEach(item => {
        if (!productMap[item.productId]) {
          productMap[item.productId] = {
            name: item.productName,
            quantity: 0,
            total: 0,
          };
        }
        productMap[item.productId].quantity += item.quantity;
        productMap[item.productId].total += item.subtotal;
      });
    });
    
    const productStatsList = Object.values(productMap).sort((a, b) => b.quantity - a.quantity);
    setProductStats(productStatsList);
    
    // Calcular estatísticas de pagamentos
    const paymentMap: Record<string, {method: string, count: number, total: number}> = {
      cash: { method: 'Dinheiro', count: 0, total: 0 },
      credit: { method: 'Cartão de Crédito', count: 0, total: 0 },
      debit: { method: 'Cartão de Débito', count: 0, total: 0 },
      pix: { method: 'Pix', count: 0, total: 0 },
    };
    
    filtered.forEach(sale => {
      const method = sale.paymentMethod;
      if (paymentMap[method]) {
        paymentMap[method].count += 1;
        paymentMap[method].total += sale.subtotal;
      }
    });
    
    const paymentStatsList = Object.values(paymentMap).filter(p => p.count > 0);
    setPaymentStats(paymentStatsList);
    
    // Calcular estatísticas por usuário
    const userMap: Record<string, {name: string, sales: number, total: number}> = {};
    
    filtered.forEach(sale => {
      const user = users.find(u => u.id === sale.createdBy);
      const userName = user ? user.name : 'Usuário Desconhecido';
      
      if (!userMap[sale.createdBy]) {
        userMap[sale.createdBy] = {
          name: userName,
          sales: 0,
          total: 0
        };
      }
      userMap[sale.createdBy].sales += 1;
      userMap[sale.createdBy].total += sale.subtotal;
    });
    
    const userStatsList = Object.values(userMap).sort((a, b) => b.total - a.total);
    setUserStats(userStatsList);
    
    // Calcular estatísticas por hora
    const hourMap: Record<string, {hour: string, sales: number, total: number}> = {};
    
    filtered.forEach(sale => {
      const hour = new Date(sale.createdAt).getHours();
      const hourKey = `${hour.toString().padStart(2, '0')}:00`;
      
      if (!hourMap[hourKey]) {
        hourMap[hourKey] = {
          hour: hourKey,
          sales: 0,
          total: 0
        };
      }
      hourMap[hourKey].sales += 1;
      hourMap[hourKey].total += sale.subtotal;
    });
    
    const hourlyStatsList = Object.values(hourMap).sort((a, b) => a.hour.localeCompare(b.hour));
    setHourlyStats(hourlyStatsList);
    
    // Calcular receita total
    const total = filtered.reduce((sum, sale) => sum + sale.subtotal, 0);
    setTotalRevenue(total);
    
  }, [sales, users, filters]);
  
  // Exportar para PDF
  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Título
      doc.setFontSize(20);
      doc.text("Relatório Detalhado de Vendas", 15, 20);
      
      doc.setFontSize(12);
      doc.text(`Período: ${getFilterDescription()}`, 15, 30);
      doc.text(`Total de vendas: ${filteredSales.length}`, 15, 37);
      doc.text(`Receita total: ${formatCurrency(totalRevenue)}`, 15, 44);
      doc.text(`Ticket médio: ${filteredSales.length > 0 ? formatCurrency(totalRevenue / filteredSales.length) : 'R$ 0,00'}`, 15, 51);
      
      // Tabela de vendas detalhada
      doc.setFontSize(16);
      doc.text("Vendas Detalhadas", 15, 65);
      
      const salesTableData = filteredSales.map(sale => {
        const user = users.find(u => u.id === sale.createdBy);
        return [
          sale.id.substring(0, 8),
          formatDateTime(sale.createdAt),
          sale.customerName,
          getPaymentMethodName(sale.paymentMethod),
          user ? user.name : 'N/A',
          formatCurrency(sale.subtotal),
        ];
      });
      
      doc.autoTable({
        startY: 70,
        head: [["ID", "Data/Hora", "Cliente", "Pagamento", "Vendedor", "Total"]],
        body: salesTableData,
        styles: { fontSize: 8 }
      });
      
      // Salvar o PDF
      doc.save(`relatorio_vendas_detalhado_${new Date().toISOString().split('T')[0]}.pdf`);
      
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
    }
  };

  // Limpar filtros
  const clearFilters = () => {
    setFilters({
      paymentMethod: '',
      userId: '',
      productId: '',
      minAmount: '',
      maxAmount: '',
      timeOfDay: '',
      customerName: ''
    });
  };
  
  // Funções auxiliares
  const getPaymentMethodName = (method: string) => {
    switch (method) {
      case 'cash': return 'Dinheiro';
      case 'credit': return 'Cartão de Crédito';
      case 'debit': return 'Cartão de Débito';
      case 'pix': return 'Pix';
      default: return method;
    }
  };
  
  const getFilterDescription = () => {
    const parts = [];
    if (filters.startDate) parts.push(`de ${formatDate(filters.startDate.toISOString())}`);
    if (filters.endDate) parts.push(`até ${formatDate(filters.endDate.toISOString())}`);
    if (filters.paymentMethod) parts.push(`pagamento: ${getPaymentMethodName(filters.paymentMethod)}`);
    if (filters.userId) {
      const user = users.find(u => u.id === filters.userId);
      if (user) parts.push(`vendedor: ${user.name}`);
    }
    return parts.length > 0 ? parts.join(', ') : 'Todos os registros';
  };
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">Relatórios Detalhados</h1>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={exportToPDF} className="flex items-center">
              <Download className="h-4 w-4 mr-2" />
              Exportar PDF
            </Button>
          </div>
        </div>
        
        <ReportsFilters
          filters={filters}
          onFiltersChange={setFilters}
          users={users}
          products={products}
          onClearFilters={clearFilters}
        />
        
        <div className="glass rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Total de Vendas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{filteredSales.length}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Receita Total
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                  <BarChart4 className="mr-2 h-4 w-4" />
                  Ticket Médio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {filteredSales.length > 0 ? formatCurrency(totalRevenue / filteredSales.length) : formatCurrency(0)}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                  <Users className="mr-2 h-4 w-4" />
                  Vendedores Ativos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userStats.length}</div>
              </CardContent>
            </Card>
          </div>
          
          <Tabs defaultValue="sales">
            <TabsList className="grid grid-cols-5 mb-6">
              <TabsTrigger value="sales">Vendas</TabsTrigger>
              <TabsTrigger value="products">Produtos</TabsTrigger>
              <TabsTrigger value="payments">Pagamentos</TabsTrigger>
              <TabsTrigger value="users">Vendedores</TabsTrigger>
              <TabsTrigger value="hourly">Por Hora</TabsTrigger>
            </TabsList>
            
            <TabsContent value="sales">
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Data/Hora</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Pagamento</TableHead>
                      <TableHead>Vendedor</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSales.map((sale) => {
                      const user = users.find(u => u.id === sale.createdBy);
                      return (
                        <TableRow key={sale.id}>
                          <TableCell>{sale.id.substring(0, 8)}</TableCell>
                          <TableCell>{formatDateTime(sale.createdAt)}</TableCell>
                          <TableCell>{sale.customerName}</TableCell>
                          <TableCell>{getPaymentMethodName(sale.paymentMethod)}</TableCell>
                          <TableCell>{user ? user.name : 'N/A'}</TableCell>
                          <TableCell>{formatCurrency(sale.subtotal)}</TableCell>
                        </TableRow>
                      );
                    })}
                    
                    {filteredSales.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                          Nenhuma venda encontrada com os filtros aplicados
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
            
            <TabsContent value="users">
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vendedor</TableHead>
                      <TableHead>Vendas</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Ticket Médio</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userStats.map((user, index) => (
                      <TableRow key={index}>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.sales}</TableCell>
                        <TableCell>{formatCurrency(user.total)}</TableCell>
                        <TableCell>{formatCurrency(user.total / user.sales)}</TableCell>
                      </TableRow>
                    ))}
                    
                    {userStats.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                          Nenhum vendedor ativo no período
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="hourly">
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Horário</TableHead>
                      <TableHead>Vendas</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {hourlyStats.map((hour, index) => (
                      <TableRow key={index}>
                        <TableCell>{hour.hour}</TableCell>
                        <TableCell>{hour.sales}</TableCell>
                        <TableCell>{formatCurrency(hour.total)}</TableCell>
                      </TableRow>
                    ))}
                    
                    {hourlyStats.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                          Nenhuma venda registrada no período
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
