
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { PaymentMethod, Sale } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { useCart } from '@/contexts/CartContext';
import { X } from 'lucide-react';
import PixQRCode from './PixQRCode';

interface CheckoutModalProps {
  open: boolean;
  onClose: () => void;
  onFinalized: (sale: Sale) => void;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ open, onClose, onFinalized }) => {
  const { cart, finalizeSale } = useCart();
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [cashAmount, setCashAmount] = useState<string>('');
  const [pixQrCode, setPixQrCode] = useState<string>('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const sale = await finalizeSale(
      customerName,
      paymentMethod,
      paymentMethod === 'cash' ? parseFloat(cashAmount) : undefined,
      paymentMethod === 'pix' ? pixQrCode : undefined
    );
    
    if (sale) {
      onFinalized(sale);
    }
  };
  
  const change = paymentMethod === 'cash' && Number(cashAmount) > 0
    ? Number(cashAmount) - cart.subtotal
    : 0;
  
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-lg glass max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-semibold">Finalizar Venda</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Nome do Cliente</Label>
              <Input 
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Digite o nome do cliente"
                required
                className="bg-white/40"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Forma de Pagamento</Label>
              <RadioGroup 
                value={paymentMethod} 
                onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2 rounded-md border p-2 bg-white/40">
                  <RadioGroupItem value="cash" id="payment-cash" />
                  <Label htmlFor="payment-cash" className="flex-1 cursor-pointer">Dinheiro</Label>
                </div>
                <div className="flex items-center space-x-2 rounded-md border p-2 bg-white/40">
                  <RadioGroupItem value="credit" id="payment-credit" />
                  <Label htmlFor="payment-credit" className="flex-1 cursor-pointer">Cartão de Crédito</Label>
                </div>
                <div className="flex items-center space-x-2 rounded-md border p-2 bg-white/40">
                  <RadioGroupItem value="debit" id="payment-debit" />
                  <Label htmlFor="payment-debit" className="flex-1 cursor-pointer">Cartão de Débito</Label>
                </div>
                <div className="flex items-center space-x-2 rounded-md border p-2 bg-white/40">
                  <RadioGroupItem value="pix" id="payment-pix" />
                  <Label htmlFor="payment-pix" className="flex-1 cursor-pointer">Pix</Label>
                </div>
              </RadioGroup>
            </div>
            
            {paymentMethod === 'cash' && (
              <div className="space-y-2">
                <Label htmlFor="cashAmount">Valor Recebido</Label>
                <Input 
                  id="cashAmount"
                  type="number"
                  step="0.01"
                  min={cart.subtotal}
                  value={cashAmount}
                  onChange={(e) => setCashAmount(e.target.value)}
                  placeholder="Digite o valor recebido"
                  required
                  className="bg-white/40"
                />
                
                {Number(cashAmount) >= cart.subtotal && (
                  <div className="mt-2 p-2 border rounded bg-green-50">
                    <p className="text-sm font-medium text-green-800">Troco: {formatCurrency(change)}</p>
                  </div>
                )}
              </div>
            )}

            {paymentMethod === 'pix' && (
              <div className="space-y-4">
                <div className="bg-white/60 rounded-lg border border-purple-100">
                  <PixQRCode 
                    amount={cart.subtotal}
                    onQRCodeGenerated={setPixQrCode}
                  />
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">
                    Aguardando confirmação do pagamento...
                  </p>
                  <p className="text-xs text-gray-500">
                    Após o pagamento, clique em "Finalizar Venda"
                  </p>
                </div>
              </div>
            )}
            
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center text-lg font-medium">
                <span>Total:</span>
                <span>{formatCurrency(cart.subtotal)}</span>
              </div>
            </div>
          </div>
          
          <DialogFooter className="sm:justify-between">
            <Button type="button" variant="outline" onClick={onClose}>
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
            <Button type="submit" className="btn-primary">
              Finalizar Venda
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutModal;
