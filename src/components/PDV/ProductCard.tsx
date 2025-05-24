
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
import { Plus, Minus, ShoppingCart } from 'lucide-react';

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
        className="group relative glass rounded-xl overflow-hidden card-hover cursor-pointer border border-white/30 shadow-lg backdrop-blur-md transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
        onClick={() => setIsDialogOpen(true)}
      >
        {/* Gradiente de fundo sutil */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50/30 via-pink-50/20 to-white/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        <div className="relative p-5 flex flex-col h-full">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-2 text-gray-800 group-hover:text-purple-700 transition-colors">
              {product.name}
            </h3>
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {formatCurrency(product.price)}
            </span>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <ShoppingCart className="h-5 w-5 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md glass border-white/30 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-800">{product.name}</DialogTitle>
          </DialogHeader>

          <div className="py-4 space-y-6">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100">
              <p className="text-sm text-gray-600 mb-3 leading-relaxed">{product.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Preço unitário:</span>
                <span className="text-lg font-bold text-purple-600">{formatCurrency(product.price)}</span>
              </div>
            </div>

            {allAddOns.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-700 flex items-center">
                  <Plus className="h-4 w-4 mr-1 text-purple-600" />
                  Adicionais Disponíveis
                </h4>
                <div className="grid grid-cols-1 gap-3 max-h-48 overflow-y-auto">
                  {allAddOns.map((addon) => (
                    <div key={addon.id} className="flex items-center space-x-3 rounded-lg border border-purple-100 p-3 bg-white/60 hover:bg-purple-50/50 transition-colors">
                      <Checkbox
                        id={`addon-${addon.id}`}
                        checked={selectedAddOns.some((item) => item.id === addon.id)}
                        onCheckedChange={() => handleAddOnToggle(addon)}
                        className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                      />
                      <Label htmlFor={`addon-${addon.id}`} className="flex-1 cursor-pointer text-sm font-medium">
                        {addon.name}
                      </Label>
                      <span className="text-sm font-semibold text-purple-600">{formatCurrency(addon.price)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3">
              <Label htmlFor="observation" className="text-sm font-semibold text-gray-700">Observações</Label>
              <Textarea
                id="observation"
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
                placeholder="Alguma observação especial para este item?"
                className="bg-white/60 border-purple-100 focus:border-purple-400 focus:ring-purple-400 rounded-lg resize-none"
                rows={3}
              />
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700">Quantidade</Label>
              <div className="flex items-center justify-center space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                  className="h-10 w-10 rounded-full border-purple-200 hover:bg-purple-50"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  className="w-20 text-center bg-white/60 border-purple-100 focus:border-purple-400 focus:ring-purple-400 rounded-lg font-semibold text-lg"
                  value={quantity}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (!isNaN(value) && value > 0) {
                      setQuantity(value);
                    }
                  }}
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="icon" 
                  onClick={incrementQuantity}
                  className="h-10 w-10 rounded-full border-purple-200 hover:bg-purple-50"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="pt-4 border-t border-purple-100">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-4 text-white">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium">Total do Item:</span>
                  <span className="text-2xl font-bold">{formatCurrency(totalPrice)}</span>
                </div>
                {selectedAddOns.length > 0 && (
                  <div className="text-sm opacity-90 mt-1">
                    Inclui {selectedAddOns.length} adicional{selectedAddOns.length > 1 ? 'is' : ''}
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="sm:justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleDialogClose}
              className="hover:bg-gray-50"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleAddToCart} 
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg"
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Adicionar ao Pedido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductCard;
