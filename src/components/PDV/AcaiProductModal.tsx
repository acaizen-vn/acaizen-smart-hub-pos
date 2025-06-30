
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Product, AcaiAddOn, SelectedAcaiAddOn } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { Plus, ShoppingCart, Coffee, Cookie, Apple } from 'lucide-react';
import { getAcaiAddOns } from '@/utils/acaiAddOns';
import AcaiAddOnsGrid from './AcaiAddOnsGrid';
import QuantitySelector from './QuantitySelector';
import AcaiTotalSummary from './AcaiTotalSummary';

interface AcaiProductModalProps {
  product: Product;
  open: boolean;
  onClose: () => void;
  onAddToCart: (addOns?: any[], observation?: string) => void;
}

const AcaiProductModal: React.FC<AcaiProductModalProps> = ({ product, open, onClose, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedAcaiAddOns, setSelectedAcaiAddOns] = useState<SelectedAcaiAddOn[]>([]);
  const [observation, setObservation] = useState('');

  const { caldasItems, complementosItems, adicionaisItems } = getAcaiAddOns();

  const handleAddToCart = () => {
    onAddToCart(selectedAcaiAddOns, observation);
    handleClose();
  };

  const handleClose = () => {
    onClose();
    setQuantity(1);
    setSelectedAcaiAddOns([]);
    setObservation('');
  };

  const handleAcaiAddOnToggle = (addon: AcaiAddOn) => {
    setSelectedAcaiAddOns((prev) => {
      const isSelected = prev.some((item) => item.id === addon.id);
      if (isSelected) {
        return prev.filter((item) => item.id !== addon.id);
      } else {
        return [...prev, { 
          id: addon.id, 
          name: addon.name, 
          price: addon.price,
          categoryType: addon.categoryType 
        }];
      }
    });
  };

  const totalPrice = (product.price + selectedAcaiAddOns.reduce((sum, addon) => sum + addon.price, 0)) * quantity;

  const getCategoryIcon = (type: string) => {
    switch (type) {
      case 'caldas': return <Coffee className="h-4 w-4" />;
      case 'complementos': return <Cookie className="h-4 w-4" />;
      case 'adicionais': return <Apple className="h-4 w-4" />;
      default: return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl glass border-white/30 shadow-2xl max-h-[90vh] overflow-y-auto">
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

          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-700 flex items-center">
              <Plus className="h-5 w-5 mr-2 text-purple-600" />
              Personalize seu Açaí
            </h4>
            
            <Tabs defaultValue="caldas" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="caldas" className="flex items-center space-x-2">
                  {getCategoryIcon('caldas')}
                  <span>Coberturas</span>
                </TabsTrigger>
                <TabsTrigger value="complementos" className="flex items-center space-x-2">
                  {getCategoryIcon('complementos')}
                  <span>Complementos</span>
                </TabsTrigger>
                <TabsTrigger value="adicionais" className="flex items-center space-x-2">
                  {getCategoryIcon('adicionais')}
                  <span>Adicionais</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="caldas" className="mt-4">
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">Escolha suas coberturas favoritas (gratuito):</p>
                  <AcaiAddOnsGrid 
                    items={caldasItems} 
                    selectedAcaiAddOns={selectedAcaiAddOns}
                    onToggle={handleAcaiAddOnToggle}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="complementos" className="mt-4">
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">Adicione complementos nutritivos (gratuito):</p>
                  <AcaiAddOnsGrid 
                    items={complementosItems} 
                    selectedAcaiAddOns={selectedAcaiAddOns}
                    onToggle={handleAcaiAddOnToggle}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="adicionais" className="mt-4">
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">Finalize com adicionais especiais:</p>
                  <AcaiAddOnsGrid 
                    items={adicionaisItems} 
                    selectedAcaiAddOns={selectedAcaiAddOns}
                    onToggle={handleAcaiAddOnToggle}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-3">
            <Label htmlFor="observation" className="text-sm font-semibold text-gray-700">Observações</Label>
            <Textarea
              id="observation"
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              placeholder="Alguma observação especial para este açaí?"
              className="bg-white/60 border-purple-100 focus:border-purple-400 focus:ring-purple-400 rounded-lg resize-none"
              rows={3}
            />
          </div>

          <QuantitySelector quantity={quantity} onQuantityChange={setQuantity} />

          <AcaiTotalSummary totalPrice={totalPrice} selectedAcaiAddOns={selectedAcaiAddOns} />
        </div>

        <DialogFooter className="sm:justify-between">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleClose}
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
  );
};

export default AcaiProductModal;
