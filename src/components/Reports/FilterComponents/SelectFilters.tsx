
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Product } from '@/types';
import { ReportFilters } from '../ReportsFilters';

interface SelectFiltersProps {
  filters: ReportFilters;
  onFiltersChange: (filters: ReportFilters) => void;
  users: User[];
  products: Product[];
}

const SelectFilters: React.FC<SelectFiltersProps> = ({ filters, onFiltersChange, users, products }) => {
  const updateFilter = (key: keyof ReportFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <>
      {/* Dia da Semana */}
      <div className="space-y-2">
        <Label>Dia da Semana</Label>
        <Select value={filters.weekDay} onValueChange={(value) => updateFilter('weekDay', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Todos os dias" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos os dias</SelectItem>
            <SelectItem value="0">Domingo</SelectItem>
            <SelectItem value="1">Segunda-feira</SelectItem>
            <SelectItem value="2">Terça-feira</SelectItem>
            <SelectItem value="3">Quarta-feira</SelectItem>
            <SelectItem value="4">Quinta-feira</SelectItem>
            <SelectItem value="5">Sexta-feira</SelectItem>
            <SelectItem value="6">Sábado</SelectItem>
          </SelectContent>
        </Select>
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
    </>
  );
};

export default SelectFilters;
