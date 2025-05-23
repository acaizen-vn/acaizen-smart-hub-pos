
import React from 'react';
import { CartItem as CartItemType } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { X, Minus, Plus } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

interface CartItemProps {
  item: CartItemType;
}

const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const { removeFromCart, updateQuantity } = useCart();
  
  const handleIncrement = () => {
    updateQuantity(item.id, item.quantity + 1);
  };
  
  const handleDecrement = () => {
    if (item.quantity > 1) {
      updateQuantity(item.id, item.quantity - 1);
    } else {
      removeFromCart(item.id);
    }
  };
  
  // Calcular o preço total do item (incluindo adicionais)
  const basePrice = item.price;
  const addOnsTotal = item.addOns.reduce((sum, addon) => sum + addon.price, 0);
  const itemUnitPrice = basePrice + addOnsTotal;
  
  return (
    <div className="bg-white/60 rounded-lg p-3 mb-2 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium">{item.productName}</h4>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => removeFromCart(item.id)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      {item.addOns.length > 0 && (
        <div className="mb-2">
          {item.addOns.map((addon, index) => (
            <div key={index} className="text-sm text-muted-foreground flex justify-between">
              <span>+ {addon.name}</span>
              <span>{formatCurrency(addon.price)}</span>
            </div>
          ))}
        </div>
      )}
      
      {item.observation && (
        <p className="text-xs italic text-muted-foreground mb-2">Obs: {item.observation}</p>
      )}
      
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" className="h-6 w-6" onClick={handleDecrement}>
            <Minus className="h-3 w-3" />
          </Button>
          <span className="w-8 text-center">{item.quantity}</span>
          <Button variant="outline" size="icon" className="h-6 w-6" onClick={handleIncrement}>
            <Plus className="h-3 w-3" />
          </Button>
        </div>
        
        <div className="text-right">
          <div className="text-xs text-muted-foreground">
            {formatCurrency(itemUnitPrice)} x {item.quantity}
          </div>
          <div className="font-medium">{formatCurrency(item.subtotal)}</div>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
