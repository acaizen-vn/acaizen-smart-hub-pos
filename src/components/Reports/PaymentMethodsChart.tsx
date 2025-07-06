
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface PaymentMethodsChartProps {
  data: Array<{
    method: string;
    count: number;
    total: number;
  }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const PaymentMethodsChart: React.FC<PaymentMethodsChartProps> = ({ data }) => {
  const chartConfig = {
    total: {
      label: "Total",
      color: "hsl(var(--chart-3))",
    },
  };

  const pieData = data.map((item, index) => ({
    ...item,
    fill: COLORS[index % COLORS.length]
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CreditCard className="mr-2 h-5 w-5" />
          Formas de Pagamento
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ method, percent }) => `${method} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="total"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <ChartTooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-background border rounded p-2 shadow">
                        <p className="font-semibold">{data.method}</p>
                        <p>Vendas: {data.count}</p>
                        <p>Total: {formatCurrency(data.total)}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default PaymentMethodsChart;
