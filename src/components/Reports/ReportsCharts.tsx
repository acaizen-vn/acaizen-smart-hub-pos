
import React from 'react';
import SalesChart from './SalesChart';
import ProductsChart from './ProductsChart';
import PaymentMethodsChart from './PaymentMethodsChart';
import UsersChart from './UsersChart';
import WeeklyChart from './WeeklyChart';

interface ReportsChartsProps {
  hourlyStats: Array<{hour: string, sales: number, total: number}>;
  productStats: Array<{name: string, quantity: number, total: number}>;
  paymentStats: Array<{method: string, count: number, total: number}>;
  userStats: Array<{name: string, sales: number, total: number}>;
  weeklyStats: Array<{day: string, sales: number, total: number}>;
}

const ReportsCharts: React.FC<ReportsChartsProps> = ({
  hourlyStats,
  productStats,
  paymentStats,
  userStats,
  weeklyStats
}) => {
  return (
    <>
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
    </>
  );
};

export default ReportsCharts;
