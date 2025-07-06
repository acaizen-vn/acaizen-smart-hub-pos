
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ReportFilters } from '../ReportsFilters';

interface QuickFiltersProps {
  filters: ReportFilters;
  onFiltersChange: (filters: ReportFilters) => void;
}

const QuickFilters: React.FC<QuickFiltersProps> = ({ filters, onFiltersChange }) => {
  const setQuickFilter = (days: number) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    onFiltersChange({
      ...filters,
      startDate,
      endDate
    });
  };

  return (
    <div className="mb-4">
      <Label className="text-sm font-medium mb-2 block">Filtros Rápidos</Label>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => setQuickFilter(0)}>
          Hoje
        </Button>
        <Button variant="outline" size="sm" onClick={() => setQuickFilter(7)}>
          Últimos 7 dias
        </Button>
        <Button variant="outline" size="sm" onClick={() => setQuickFilter(30)}>
          Últimos 30 dias
        </Button>
        <Button variant="outline" size="sm" onClick={() => setQuickFilter(90)}>
          Últimos 90 dias
        </Button>
      </div>
    </div>
  );
};

export default QuickFilters;
