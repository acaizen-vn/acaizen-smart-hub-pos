
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Clock, TrendingUp } from 'lucide-react';
import { CashRegister } from '@/types';
import { formatCurrency, subscribeToCashRegister } from '@/lib/utils';

interface CashStatusProps {
  cashRegister: CashRegister | null;
  onOpenCash: () => void;
  onCloseCash: () => void;
}

const CashStatus = ({ cashRegister: initialCashRegister, onOpenCash, onCloseCash }: CashStatusProps) => {
  const [cashRegister, setCashRegister] = useState<CashRegister | null>(initialCashRegister);

  // Subscribe to cash register changes for real-time sync
  useEffect(() => {
    const unsubscribe = subscribeToCashRegister((updatedCashRegister) => {
      setCashRegister(updatedCashRegister);
    });
    
    return unsubscribe;
  }, []);

  // Update local state when prop changes
  useEffect(() => {
    setCashRegister(initialCashRegister);
  }, [initialCashRegister]);

  if (!cashRegister || !cashRegister.isOpen) {
    return (
      <div className="glass rounded-lg p-4 text-center">
        <div className="mb-4">
          <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
          <h3 className="text-lg font-semibold">Caixa Fechado</h3>
          <p className="text-sm text-muted-foreground">
            Abra o caixa para começar as vendas
          </p>
        </div>
        <Button onClick={onOpenCash} className="w-full">
          Abrir Caixa
        </Button>
      </div>
    );
  }

  const openedAt = new Date(cashRegister.openedAt);
  const duration = Math.floor((Date.now() - openedAt.getTime()) / (1000 * 60 * 60));
  const expectedAmount = cashRegister.initialAmount + cashRegister.totalCashSales;

  return (
    <div className="glass rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center">
          <DollarSign className="mr-2 h-5 w-5" />
          Status do Caixa
        </h3>
        <Badge variant="default" className="bg-green-500">
          Aberto
        </Badge>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          Aberto há {duration}h - {openedAt.toLocaleTimeString()}
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Vendas</p>
            <p className="text-lg font-semibold">{cashRegister.salesCount}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Total</p>
            <p className="text-lg font-semibold text-primary">
              {formatCurrency(cashRegister.totalSales)}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Dinheiro:</span>
            <span className="font-semibold">{formatCurrency(cashRegister.totalCashSales)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Cartão:</span>
            <span className="font-semibold">{formatCurrency(cashRegister.totalCardSales)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Pix:</span>
            <span className="font-semibold">{formatCurrency(cashRegister.totalPixSales)}</span>
          </div>
        </div>

        <div className="pt-2 border-t">
          <div className="flex justify-between font-semibold">
            <span>Esperado no Caixa:</span>
            <span className="text-primary">{formatCurrency(expectedAmount)}</span>
          </div>
        </div>
      </div>

      <Button 
        onClick={onCloseCash} 
        variant="outline" 
        className="w-full"
      >
        Fechar Caixa
      </Button>
    </div>
  );
};

export default CashStatus;
