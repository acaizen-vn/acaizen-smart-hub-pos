
import React, { useState } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import ReportsFilters, { ReportFilters } from '@/components/Reports/ReportsFilters';
import ReportsMetrics from '@/components/Reports/ReportsMetrics';
import ReportsCharts from '@/components/Reports/ReportsCharts';
import ReportsTables from '@/components/Reports/ReportsTables';
import ExportButtons from '@/components/Reports/ExportButtons';
import { Loader2 } from 'lucide-react';
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

  const ticketMedio = filteredSales.length > 0 ? totalRevenue / filteredSales.length : 0;

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
          <ReportsMetrics
            totalSales={filteredSales.length}
            totalRevenue={totalRevenue}
            ticketMedio={ticketMedio}
            activeUsers={userStats.length}
          />

          <ReportsCharts
            hourlyStats={hourlyStats}
            productStats={productStats}
            paymentStats={paymentStats}
            userStats={userStats}
            weeklyStats={weeklyStats}
          />
          
          <ReportsTables
            filteredSales={filteredSales}
            users={users}
            productStats={productStats}
            paymentStats={paymentStats}
            userStats={userStats}
            hourlyStats={hourlyStats}
          />
        </div>
      </div>
    </MainLayout>
  );
};

export default ReportsPage;
