
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { AcaiAddOn, SelectedAcaiAddOn } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface AcaiAddOnsGridProps {
  items: AcaiAddOn[];
  selectedAcaiAddOns: SelectedAcaiAddOn[];
  onToggle: (addon: AcaiAddOn) => void;
}

const AcaiAddOnsGrid: React.FC<AcaiAddOnsGridProps> = ({ items, selectedAcaiAddOns, onToggle }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
      {items.map((addon) => (
        <div key={addon.id} className="flex items-center space-x-3 rounded-lg border border-purple-100 p-3 bg-white/60 hover:bg-purple-50/50 transition-colors">
          <Checkbox
            id={`acai-addon-${addon.id}`}
            checked={selectedAcaiAddOns.some((item) => item.id === addon.id)}
            onCheckedChange={() => onToggle(addon)}
            className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
          />
          <Label htmlFor={`acai-addon-${addon.id}`} className="flex-1 cursor-pointer text-sm font-medium">
            {addon.name}
          </Label>
          <span className="text-sm font-semibold text-purple-600">{formatCurrency(addon.price)}</span>
        </div>
      ))}
    </div>
  );
};

export default AcaiAddOnsGrid;
