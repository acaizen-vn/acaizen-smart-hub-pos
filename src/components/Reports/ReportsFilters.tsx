
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Filter, X } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { User, Product } from '@/types';

export interface ReportFilters {
  startDate?: Date;
  endDate?: Date;
  paymentMethod: string;
  userId: string;
  productId: string;
  minAmount: string;
  maxAmount: string;
  timeOfDay: string;
  customerName: string;
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
  const updateFilter = (key: keyof ReportFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* Período */}
          <div className="space-y-2">
            <Label>Data Inicial</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.startDate ? format(filters.startDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.startDate}
                  onSelect={(date) => updateFilter('startDate', date)}
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Data Final</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.endDate ? format(filters.endDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.endDate}
                  onSelect={(date) => updateFilter('endDate', date)}
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Método de Pagamento */}
          <div className="space-y-2">
            <Label>Método de Pagamento</Label>
            <Select value={filters.paymentMethod} onValueChange={(value) => updateFilter('paymentMethod', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                <SelectItem value="cash">Dinheiro</SelectItem>
                <SelectItem value="credit">Cartão de Crédito</SelectItem>
                <SelectItem value="debit">Cartão de Débito</SelectItem>
                <SelectItem value="pix">Pix</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Usuário */}
          <div className="space-y-2">
            <Label>Usuário</Label>
            <Select value={filters.userId} onValueChange={(value) => updateFilter('userId', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Produto */}
          <div className="space-y-2">
            <Label>Produto</Label>
            <Select value={filters.productId} onValueChange={(value) => updateFilter('productId', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Valor Mínimo */}
          <div className="space-y-2">
            <Label>Valor Mínimo (R$)</Label>
            <Input
              type="number"
              step="0.01"
              placeholder="0,00"
              value={filters.minAmount}
              onChange={(e) => updateFilter('minAmount', e.target.value)}
            />
          </div>

          {/* Valor Máximo */}
          <div className="space-y-2">
            <Label>Valor Máximo (R$)</Label>
            <Input
              type="number"
              step="0.01"
              placeholder="0,00"
              value={filters.maxAmount}
              onChange={(e) => updateFilter('maxAmount', e.target.value)}
            />
          </div>

          {/* Período do Dia */}
          <div className="space-y-2">
            <Label>Período do Dia</Label>
            <Select value={filters.timeOfDay} onValueChange={(value) => updateFilter('timeOfDay', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Todo o dia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todo o dia</SelectItem>
                <SelectItem value="morning">Manhã (06:00 - 11:59)</SelectItem>
                <SelectItem value="afternoon">Tarde (12:00 - 17:59)</SelectItem>
                <SelectItem value="evening">Noite (18:00 - 23:59)</SelectItem>
                <SelectItem value="dawn">Madrugada (00:00 - 05:59)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Nome do Cliente */}
          <div className="space-y-2">
            <Label>Nome do Cliente</Label>
            <Input
              placeholder="Digite o nome..."
              value={filters.customerName}
              onChange={(e) => updateFilter('customerName', e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportsFilters;
