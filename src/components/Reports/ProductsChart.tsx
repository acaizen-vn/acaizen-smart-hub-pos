
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart } from 'lucide-react';

interface ProductsChartProps {
  data: Array<{
    name: string;
    quantity: number;
    total: number;
  }>;
}

const ProductsChart: React.FC<ProductsChartProps> = ({ data }) => {
  const chartConfig = {
    quantity: {
      label: "Quantidade",
      color: "hsl(var(--chart-2))",
    },
  };

  const topProducts = data.slice(0, 10);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <ShoppingCart className="mr-2 h-5 w-5" />
          Top 10 Produtos Mais Vendidos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topProducts} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="quantity" fill="var(--color-quantity)" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default ProductsChart;
