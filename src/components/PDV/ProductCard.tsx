
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Product, AddOn, SelectedAddOn } from '@/types';
import { formatCurrency, storage } from '@/lib/utils';
import { useCart } from '@/contexts/CartContext';
import { Plus, Minus } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedAddOns, setSelectedAddOns] = useState<SelectedAddOn[]>([]);
  const [observation, setObservation] = useState('');

  const allAddOns = storage.getAddOns().filter((addon: AddOn) => addon.active);

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedAddOns, observation);
    handleDialogClose();
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setQuantity(1);
    setSelectedAddOns([]);
    setObservation('');
  };

  const handleAddOnToggle = (addon: AddOn) => {
    setSelectedAddOns((prev) => {
      const isSelected = prev.some((item) => item.id === addon.id);
      if (isSelected) {
        return prev.filter((item) => item.id !== addon.id);
      } else {
        return [...prev, { id: addon.id, name: addon.name, price: addon.price }];
      }
    });
  };

  const incrementQuantity = () => setQuantity((prev) => prev + 1);
  const decrementQuantity = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const totalPrice = (product.price + selectedAddOns.reduce((sum, addon) => sum + addon.price, 0)) * quantity;

  return (
    <>
      <div
        className="glass rounded-lg overflow-hidden card-hover cursor-pointer"
        onClick={() => setIsDialogOpen(true)}
      >
        <div className="p-4 flex flex-col h-full">
          <h3 className="font-medium mb-1">{product.name}</h3>
          <p className="text-sm text-muted-foreground mb-2 flex-1">{product.description}</p>
          <p className="text-lg font-semibold">{formatCurrency(product.price)}</p>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md glass">
          <DialogHeader>
            <DialogTitle>{product.name}</DialogTitle>
          </DialogHeader>

          <div className="py-4 space-y-6">
            <div>
              <p className="text-sm text-muted-foreground">{product.description}</p>
              <p className="text-lg font-semibold mt-2">{formatCurrency(product.price)}</p>
            </div>

            {allAddOns.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Adicionais</h4>
                <div className="grid grid-cols-1 gap-3">
                  {allAddOns.map((addon) => (
                    <div key={addon.id} className="flex items-center space-x-2 rounded-md border p-2 bg-white/40">
                      <Checkbox
                        id={`addon-${addon.id}`}
                        checked={selectedAddOns.some((item) => item.id === addon.id)}
                        onCheckedChange={() => handleAddOnToggle(addon)}
                      />
                      <Label htmlFor={`addon-${addon.id}`} className="flex-1 cursor-pointer">
                        {addon.name}
                      </Label>
                      <span className="text-sm font-medium">{formatCurrency(addon.price)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="observation">Observação</Label>
              <Textarea
                id="observation"
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
                placeholder="Alguma observação sobre este item?"
                className="bg-white/40"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Quantidade</Label>
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  className="w-16 text-center bg-white/40"
                  value={quantity}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (!isNaN(value) && value > 0) {
                      setQuantity(value);
                    }
                  }}
                />
                <Button type="button" variant="outline" size="icon" onClick={incrementQuantity}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">Total:</span>
                <span className="text-lg font-semibold">{formatCurrency(totalPrice)}</span>
              </div>
            </div>
          </div>

          <DialogFooter className="sm:justify-between">
            <Button type="button" variant="outline" onClick={handleDialogClose}>
              Cancelar
            </Button>
            <Button onClick={handleAddToCart} className="btn-primary">
              Adicionar ao Pedido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductCard;
