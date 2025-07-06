
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Filter, X } from 'lucide-react';
import { User, Product } from '@/types';
import QuickFilters from './FilterComponents/QuickFilters';
import DateFilters from './FilterComponents/DateFilters';
import SelectFilters from './FilterComponents/SelectFilters';

export interface ReportFilters {
  startDate?: Date;
  endDate?: Date;
  paymentMethod: string;
  userId: string;
  productId: string;
  minAmount: string;
  maxAmount: string;
  timeOfDay: string;
  weekDay: string;
}

interface ReportsFiltersProps {
  filters: ReportFilters;
  onFiltersChange: (filters: ReportFilters) => void;
  users: User[];
  products: Product[];
  onClearFilters: () => void;
}

const ReportsFilters: React.FC<ReportsFiltersProps> = ({
  filters,
  onFiltersChange,
  users,
  products,
  onClearFilters
}) => {
  const hasActiveFilters = Object.values(filters).some(value => 
    value !== '' && value !== undefined && value !== null
  );

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Filter className="mr-2 h-5 w-5" />
            Filtros Avançados
          </CardTitle>
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={onClearFilters}>
              <X className="h-4 w-4 mr-1" />
              Limpar Filtros
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <QuickFilters filters={filters} onFiltersChange={onFiltersChange} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <DateFilters filters={filters} onFiltersChange={onFiltersChange} />
          <SelectFilters 
            filters={filters} 
            onFiltersChange={onFiltersChange} 
            users={users} 
            products={products} 
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportsFilters;
