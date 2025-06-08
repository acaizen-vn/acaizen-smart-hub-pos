
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DollarSign } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { storage } from '@/lib/utils';
import { CashRegister, CashMovement } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface OpenCashModalProps {
  open: boolean;
  onClose: () => void;
  onCashOpened: (cashRegister: CashRegister) => void;
}

const OpenCashModal = ({ open, onClose, onCashOpened }: OpenCashModalProps) => {
  const [initialAmount, setInitialAmount] = useState('');
  const [observations, setObservations] = useState('');
  const { authState } = useAuth();
  const { toast } = useToast();

  const handleOpenCash = () => {
    if (!authState.user) return;

    const amount = parseFloat(initialAmount) || 0;
    
    const cashRegister: CashRegister = {
      id: Date.now().toString(),
      openedBy: authState.user.id,
      openedAt: new Date().toISOString(),
      initialAmount: amount,
      totalSales: 0,
      totalCashSales: 0,
      totalCardSales: 0,
      totalPixSales: 0,
      salesCount: 0,
      isOpen: true,
      observations
    };

    const movement: CashMovement = {
      id: Date.now().toString(),
      cashRegisterId: cashRegister.id,
      type: 'opening',
      amount: amount,
      description: `Abertura de caixa - ${observations || 'Sem observações'}`,
      createdBy: authState.user.id,
      createdAt: new Date().toISOString()
    };

    // Salvar no localStorage
    storage.saveCashRegister(cashRegister);
    storage.saveCashMovement(movement);

    toast({
      title: "Caixa Aberto",
      description: `Caixa aberto com valor inicial de R$ ${amount.toFixed(2)}`
    });

    onCashOpened(cashRegister);
    onClose();
    setInitialAmount('');
    setObservations('');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <DollarSign className="mr-2 h-5 w-5" />
            Abertura de Caixa
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="initialAmount">Valor Inicial (R$)</Label>
            <Input
              id="initialAmount"
              type="number"
              step="0.01"
              placeholder="0,00"
              value={initialAmount}
              onChange={(e) => setInitialAmount(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="observations">Observações</Label>
            <Textarea
              id="observations"
              placeholder="Observações sobre a abertura do caixa..."
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleOpenCash} className="flex-1">
              Abrir Caixa
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OpenCashModal;
