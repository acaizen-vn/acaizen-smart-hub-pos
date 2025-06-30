
import React from 'react';
import { SelectedAcaiAddOn } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface AcaiTotalSummaryProps {
  totalPrice: number;
  selectedAcaiAddOns: SelectedAcaiAddOn[];
}

const AcaiTotalSummary: React.FC<AcaiTotalSummaryProps> = ({ totalPrice, selectedAcaiAddOns }) => {
  return (
    <div className="pt-4 border-t border-purple-100">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-4 text-white">
        <div className="flex justify-between items-center">
          <span className="text-lg font-medium">Total do Item:</span>
          <span className="text-2xl font-bold">{formatCurrency(totalPrice)}</span>
        </div>
        {selectedAcaiAddOns.length > 0 && (
          <div className="text-sm opacity-90 mt-2">
            Inclui {selectedAcaiAddOns.length} complemento{selectedAcaiAddOns.length > 1 ? 's' : ''}:
            <div className="text-xs mt-1">
              {selectedAcaiAddOns.map(addon => addon.name).join(', ')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AcaiTotalSummary;
