
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Minus } from 'lucide-react';

interface QuantitySelectorProps {
  quantity: number;
  onQuantityChange: (quantity: number) => void;
}

const QuantitySelector: React.FC<QuantitySelectorProps> = ({ quantity, onQuantityChange }) => {
  const incrementQuantity = () => onQuantityChange(quantity + 1);
  const decrementQuantity = () => onQuantityChange(quantity > 1 ? quantity - 1 : 1);

  return (
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
              onQuantityChange(value);
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
  );
};

export default QuantitySelector;
