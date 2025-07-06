
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';
import { Sale, User, Product } from '@/types';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface ExportButtonsProps {
  filteredSales: Sale[];
  users: User[];
  products: Product[];
  productStats: Array<{name: string, quantity: number, total: number}>;
  paymentStats: Array<{method: string, count: number, total: number}>;
  userStats: Array<{name: string, sales: number, total: number}>;
  totalRevenue: number;
}

const ExportButtons: React.FC<ExportButtonsProps> = ({
  filteredSales,
  users,
  products,
  productStats,
  paymentStats,
  userStats,
  totalRevenue
}) => {
  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Título
      doc.setFontSize(20);
      doc.text("Relatório Completo de Vendas", 15, 20);
      
      doc.setFontSize(12);
      doc.text(`Data: ${formatDate(new Date().toISOString())}`, 15, 30);
      doc.text(`Total de vendas: ${filteredSales.length}`, 15, 37);
      doc.text(`Receita total: ${formatCurrency(totalRevenue)}`, 15, 44);
      doc.text(`Ticket médio: ${filteredSales.length > 0 ? formatCurrency(totalRevenue / filteredSales.length) : 'R$ 0,00'}`, 15, 51);
      
      // Tabela de vendas
      const salesData = filteredSales.slice(0, 50).map(sale => {
        const user = users.find(u => u.id === sale.createdBy);
        return [
          sale.id.substring(0, 8),
          formatDateTime(sale.createdAt),
          getPaymentMethodName(sale.paymentMethod),
          user ? user.name : 'N/A',
          formatCurrency(sale.subtotal),
        ];
      });
      
      doc.autoTable({
        startY: 60,
        head: [["ID", "Data/Hora", "Pagamento", "Vendedor", "Total"]],
        body: salesData,
        styles: { fontSize: 8 }
      });
      
      // Nova página para estatísticas de produtos
      doc.addPage();
      doc.setFontSize(16);
      doc.text("Top Produtos", 15, 20);
      
      const productData = productStats.slice(0, 20).map(product => [
        product.name,
        product.quantity.toString(),
        formatCurrency(product.total)
      ]);
      
      doc.autoTable({
        startY: 30,
        head: [["Produto", "Quantidade", "Total"]],
        body: productData,
        styles: { fontSize: 10 }
      });
      
      doc.save(`relatorio_completo_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
    }
  };

  const exportToExcel = () => {
    try {
      const workbook = XLSX.utils.book_new();
      
      // Aba de vendas
      const salesData = filteredSales.map(sale => {
        const user = users.find(u => u.id === sale.createdBy);
        return {
          'ID': sale.id,
          'Data/Hora': formatDateTime(sale.createdAt),
          'Forma de Pagamento': getPaymentMethodName(sale.paymentMethod),
          'Vendedor': user ? user.name : 'N/A',
          'Total': sale.subtotal,
          'Itens': sale.items.length
        };
      });
      
      const salesSheet = XLSX.utils.json_to_sheet(salesData);
      XLSX.utils.book_append_sheet(workbook, salesSheet, 'Vendas');
      
      // Aba de produtos
      const productsData = productStats.map(product => ({
        'Produto': product.name,
        'Quantidade Vendida': product.quantity,
        'Total Vendas': product.total
      }));
      
      const productsSheet = XLSX.utils.json_to_sheet(productsData);
      XLSX.utils.book_append_sheet(workbook, productsSheet, 'Produtos');
      
      // Aba de vendedores
      const usersData = userStats.map(user => ({
        'Vendedor': user.name,
        'Número de Vendas': user.sales,
        'Total Vendas': user.total,
        'Ticket Médio': user.total / user.sales
      }));
      
      const usersSheet = XLSX.utils.json_to_sheet(usersData);
      XLSX.utils.book_append_sheet(workbook, usersSheet, 'Vendedores');
      
      // Aba de formas de pagamento
      const paymentData = paymentStats.map(payment => ({
        'Forma de Pagamento': payment.method,
        'Quantidade': payment.count,
        'Total': payment.total
      }));
      
      const paymentSheet = XLSX.utils.json_to_sheet(paymentData);
      XLSX.utils.book_append_sheet(workbook, paymentSheet, 'Formas de Pagamento');
      
      // Aba de resumo
      const summaryData = [
        { 'Métrica': 'Total de Vendas', 'Valor': filteredSales.length },
        { 'Métrica': 'Receita Total', 'Valor': formatCurrency(totalRevenue) },
        { 'Métrica': 'Ticket Médio', 'Valor': filteredSales.length > 0 ? formatCurrency(totalRevenue / filteredSales.length) : 'R$ 0,00' },
        { 'Métrica': 'Vendedores Ativos', 'Valor': userStats.length }
      ];
      
      const summarySheet = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumo');
      
      XLSX.writeFile(workbook, `relatorio_vendas_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
      console.error('Erro ao exportar Excel:', error);
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

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" onClick={exportToPDF} className="flex items-center">
        <FileText className="h-4 w-4 mr-2" />
        Exportar PDF
      </Button>
      <Button variant="outline" onClick={exportToExcel} className="flex items-center">
        <Download className="h-4 w-4 mr-2" />
        Exportar Excel
      </Button>
    </div>
  );
};

export default ExportButtons;
