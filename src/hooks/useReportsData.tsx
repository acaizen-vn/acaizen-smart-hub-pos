
import { useState, useEffect, useMemo } from 'react';
import { Sale, User, Product } from '@/types';
import { storage } from '@/lib/utils';
import { ReportFilters } from '@/components/Reports/ReportsFilters';

export const useReportsData = (filters: ReportFilters) => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar dados iniciais
  useEffect(() => {
    const loadedSales = storage.getSales();
    const loadedUsers = storage.getUsers();
    const loadedProducts = storage.getProducts();
    
    setSales(loadedSales);
    setUsers(loadedUsers);
    setProducts(loadedProducts);
    setLoading(false);
  }, []);

  // Aplicar filtros
  const filteredSales = useMemo(() => {
    if (!sales.length) return [];
    
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

    // Filtrar por dia da semana
    if (filters.weekDay) {
      filtered = filtered.filter(sale => {
        const dayOfWeek = new Date(sale.createdAt).getDay();
        return dayOfWeek.toString() === filters.weekDay;
      });
    }
    
    return filtered;
  }, [sales, filters]);

  // Calcular estatísticas
  const stats = useMemo(() => {
    const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.subtotal, 0);
    
    // Estatísticas de produtos
    const productMap: Record<string, {name: string, quantity: number, total: number}> = {};
    filteredSales.forEach(sale => {
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
    const productStats = Object.values(productMap).sort((a, b) => b.quantity - a.quantity);
    
    // Estatísticas de pagamento
    const paymentMap: Record<string, {method: string, count: number, total: number}> = {
      cash: { method: 'Dinheiro', count: 0, total: 0 },
      credit: { method: 'Cartão de Crédito', count: 0, total: 0 },
      debit: { method: 'Cartão de Débito', count: 0, total: 0 },
      pix: { method: 'Pix', count: 0, total: 0 },
    };
    
    filteredSales.forEach(sale => {
      const method = sale.paymentMethod;
      if (paymentMap[method]) {
        paymentMap[method].count += 1;
        paymentMap[method].total += sale.subtotal;
      }
    });
    const paymentStats = Object.values(paymentMap).filter(p => p.count > 0);
    
    // Estatísticas por usuário
    const userMap: Record<string, {name: string, sales: number, total: number}> = {};
    filteredSales.forEach(sale => {
      const user = users.find(u => u.id === sale.createdBy);
      const userName = user ? user.name : 'Usuário Desconhecido';
      
      if (!userMap[sale.createdBy]) {
        userMap[sale.createdBy] = { name: userName, sales: 0, total: 0 };
      }
      userMap[sale.createdBy].sales += 1;
      userMap[sale.createdBy].total += sale.subtotal;
    });
    const userStats = Object.values(userMap).sort((a, b) => b.total - a.total);
    
    // Estatísticas por hora
    const hourMap: Record<string, {hour: string, sales: number, total: number}> = {};
    filteredSales.forEach(sale => {
      const hour = new Date(sale.createdAt).getHours();
      const hourKey = `${hour.toString().padStart(2, '0')}:00`;
      
      if (!hourMap[hourKey]) {
        hourMap[hourKey] = { hour: hourKey, sales: 0, total: 0 };
      }
      hourMap[hourKey].sales += 1;
      hourMap[hourKey].total += sale.subtotal;
    });
    const hourlyStats = Object.values(hourMap).sort((a, b) => a.hour.localeCompare(b.hour));
    
    // Estatísticas por dia da semana
    const weekDayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const weeklyMap: Record<number, {day: string, sales: number, total: number}> = {};
    
    filteredSales.forEach(sale => {
      const dayOfWeek = new Date(sale.createdAt).getDay();
      if (!weeklyMap[dayOfWeek]) {
        weeklyMap[dayOfWeek] = {
          day: weekDayNames[dayOfWeek],
          sales: 0,
          total: 0
        };
      }
      weeklyMap[dayOfWeek].sales += 1;
      weeklyMap[dayOfWeek].total += sale.subtotal;
    });
    const weeklyStats = Object.values(weeklyMap).sort((a, b) => 
      weekDayNames.indexOf(a.day) - weekDayNames.indexOf(b.day)
    );
    
    return {
      totalRevenue,
      productStats,
      paymentStats,
      userStats,
      hourlyStats,
      weeklyStats,
    };
  }, [filteredSales, users]);

  return {
    sales,
    users,
    products,
    filteredSales,
    loading,
    ...stats,
  };
};
