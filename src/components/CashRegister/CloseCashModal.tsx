
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { DollarSign, Clock, TrendingUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { storage, formatCurrency } from '@/lib/utils';
import { CashRegister, CashMovement } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface CloseCashModalProps {
  open: boolean;
  onClose: () => void;
  cashRegister: CashRegister;
  onCashClosed: () => void;
}

const CloseCashModal = ({ open, onClose, cashRegister, onCashClosed }: CloseCashModalProps) => {
  const [finalAmount, setFinalAmount] = useState('');
  const [observations, setObservations] = useState('');
  const { authState } = useAuth();
  const { toast } = useToast();

  const expectedAmount = cashRegister.initialAmount + cashRegister.totalCashSales;
  const difference = (parseFloat(finalAmount) || 0) - expectedAmount;

  const handleCloseCash = () => {
    if (!authState.user) return;

    const amount = parseFloat(finalAmount) || 0;
    
    const updatedCashRegister: CashRegister = {
      ...cashRegister,
      closedBy: authState.user.id,
      closedAt: new Date().toISOString(),
      finalAmount: amount,
      isOpen: false,
      observations: observations || cashRegister.observations
    };

    const movement: CashMovement = {
      id: Date.now().toString(),
      cashRegisterId: cashRegister.id,
      type: 'closing',
      amount: amount,
      description: `Fechamento de caixa - ${observations || 'Sem observações'}`,
      createdBy: authState.user.id,
      createdAt: new Date().toISOString()
    };

    // Salvar no localStorage
    storage.saveCashRegister(updatedCashRegister);
    storage.saveCashMovement(movement);

    toast({
      title: "Caixa Fechado",
      description: `Caixa fechado com valor final de ${formatCurrency(amount)}`
    });

    onCashClosed();
    onClose();
    setFinalAmount('');
    setObservations('');
  };

  const openedAt = new Date(cashRegister.openedAt);
  const duration = Math.floor((Date.now() - openedAt.getTime()) / (1000 * 60 * 60));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <DollarSign className="mr-2 h-5 w-5" />
            Fechamento de Caixa
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Resumo do Caixa */}
          <div className="glass rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Aberto há {duration}h - {openedAt.toLocaleDateString()} {openedAt.toLocaleTimeString()}
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Valor Inicial</p>
                <p className="font-semibold">{formatCurrency(cashRegister.initialAmount)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Vendas</p>
                <p className="font-semibold">{cashRegister.salesCount}</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Vendas em Dinheiro:</span>
                <span className="font-semibold">{formatCurrency(cashRegister.totalCashSales)}</span>
              </div>
              <div className="flex justify-between">
                <span>Vendas no Cartão:</span>
                <span className="font-semibold">{formatCurrency(cashRegister.totalCardSales)}</span>
              </div>
              <div className="flex justify-between">
                <span>Vendas no Pix:</span>
                <span className="font-semibold">{formatCurrency(cashRegister.totalPixSales)}</span>
              </div>
            </div>

            <Separator />

            <div className="flex justify-between font-semibold">
              <span>Total de Vendas:</span>
              <span className="text-primary">{formatCurrency(cashRegister.totalSales)}</span>
            </div>

            <div className="flex justify-between text-lg font-bold">
              <span>Valor Esperado no Caixa:</span>
              <span className="text-primary">{formatCurrency(expectedAmount)}</span>
            </div>
          </div>

          <div>
            <Label htmlFor="finalAmount">Valor Final no Caixa (R$)*</Label>
            <Input
              id="finalAmount"
              type="number"
              step="0.01"
              placeholder="0,00"
              value={finalAmount}
              onChange={(e) => setFinalAmount(e.target.value)}
              required
            />
            {finalAmount && (
              <p className={`text-sm mt-1 ${difference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {difference >= 0 ? 'Sobra' : 'Falta'}: {formatCurrency(Math.abs(difference))}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="observations">Observações</Label>
            <Textarea
              id="observations"
              placeholder="Observações sobre o fechamento do caixa..."
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button 
              onClick={handleCloseCash} 
              className="flex-1"
              disabled={!finalAmount}
            >
              Fechar Caixa
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CloseCashModal;
