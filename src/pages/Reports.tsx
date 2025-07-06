
import React, { useState } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import ReportsFilters, { ReportFilters } from '@/components/Reports/ReportsFilters';
import SalesChart from '@/components/Reports/SalesChart';
import ProductsChart from '@/components/Reports/ProductsChart';
import PaymentMethodsChart from '@/components/Reports/PaymentMethodsChart';
import UsersChart from '@/components/Reports/UsersChart';
import WeeklyChart from '@/components/Reports/WeeklyChart';
import ExportButtons from '@/components/Reports/ExportButtons';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { ShoppingCart, TrendingUp, BarChart4, Users, Loader2 } from 'lucide-react';
import { useReportsData } from '@/hooks/useReportsData';

const ReportsPage = () => {
  const [filters, setFilters] = useState<ReportFilters>({
    paymentMethod: '',
    userId: '',
    productId: '',
    minAmount: '',
    maxAmount: '',
    timeOfDay: '',
    weekDay: ''
  });

  const {
    users,
    products,
    filteredSales,
    loading,
    totalRevenue,
    productStats,
    paymentStats,
    userStats,
    hourlyStats,
    weeklyStats,
  } = useReportsData(filters);

  // Limpar filtros
  const clearFilters = () => {
    setFilters({
      paymentMethod: '',
      userId: '',
      productId: '',
      minAmount: '',
      maxAmount: '',
      timeOfDay: '',
      weekDay: ''
    });
  };

  // Função auxiliar para nome do método de pagamento
  const getPaymentMethodName = (method: string) => {
    switch (method) {
      case 'cash': return 'Dinheiro';
      case 'credit': return 'Cartão de Crédito';
      case 'debit': return 'Cartão de Débito';
      case 'pix': return 'Pix';
      default: return method;
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">Relatórios Completos</h1>
          <ExportButtons
            filteredSales={filteredSales}
            users={users}
            products={products}
            productStats={productStats}
            paymentStats={paymentStats}
            userStats={userStats}
            totalRevenue={totalRevenue}
          />
        </div>
        
        <ReportsFilters
          filters={filters}
          onFiltersChange={setFilters}
          users={users}
          products={products}
          onClearFilters={clearFilters}
        />
        
        <div className="glass rounded-lg p-6">
          {/* Cards de métricas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Total de Vendas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{filteredSales.length}</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Receita Total
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
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
            
            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Users className="mr-2 h-4 w-4" />
                  Vendedores Ativos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userStats.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <SalesChart data={hourlyStats} />
            <ProductsChart data={productStats} />
            <PaymentMethodsChart data={paymentStats} />
            <UsersChart data={userStats} />
          </div>

          {/* Gráfico semanal em tela cheia */}
          <div className="mb-6">
            <WeeklyChart data={weeklyStats} />
          </div>
          
          {/* Tabelas detalhadas */}
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
                          <TableCell>{getPaymentMethodName(sale.paymentMethod)}</TableCell>
                          <TableCell>{user ? user.name : 'N/A'}</TableCell>
                          <TableCell>{formatCurrency(sale.subtotal)}</TableCell>
                        </TableRow>
                      );
                    })}
                    
                    {filteredSales.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
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
