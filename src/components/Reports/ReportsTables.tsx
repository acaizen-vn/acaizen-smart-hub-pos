
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { Sale, User } from '@/types';

interface ReportsTablesProps {
  filteredSales: Sale[];
  users: User[];
  productStats: Array<{name: string, quantity: number, total: number}>;
  paymentStats: Array<{method: string, count: number, total: number}>;
  userStats: Array<{name: string, sales: number, total: number}>;
  hourlyStats: Array<{hour: string, sales: number, total: number}>;
}

const ReportsTables: React.FC<ReportsTablesProps> = ({
  filteredSales,
  users,
  productStats,
  paymentStats,
  userStats,
  hourlyStats
}) => {
  const getPaymentMethodName = (method: string) => {
    switch (method) {
      case 'cash': return 'Dinheiro';
      case 'credit': return 'Cartão de Crédito';
      case 'debit': return 'Cartão de Débito';
      case 'pix': return 'Pix';
      default: return method;
    }
  };

  return (
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
  );
};

export default ReportsTables;
