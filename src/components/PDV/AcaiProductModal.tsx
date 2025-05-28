
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Product, AcaiAddOn, SelectedAcaiAddOn } from '@/types';
import { formatCurrency, storage } from '@/lib/utils';
import { useCart } from '@/contexts/CartContext';
import { Plus, Minus, ShoppingCart, Coffee, Cookie, Apple } from 'lucide-react';

interface AcaiProductModalProps {
  product: Product;
  open: boolean;
  onClose: () => void;
}

const AcaiProductModal: React.FC<AcaiProductModalProps> = ({ product, open, onClose }) => {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedAcaiAddOns, setSelectedAcaiAddOns] = useState<SelectedAcaiAddOn[]>([]);
  const [observation, setObservation] = useState('');

  // Carregar adicionais específicos do açaí (simulando dados por enquanto)
  const acaiAddOns: AcaiAddOn[] = [
    // Caldas
    { id: '1', name: 'Calda de Chocolate', price: 2.50, categoryType: 'caldas', active: true, createdAt: new Date().toISOString() },
    { id: '2', name: 'Calda de Morango', price: 2.50, categoryType: 'caldas', active: true, createdAt: new Date().toISOString() },
    { id: '3', name: 'Leite Condensado', price: 2.00, categoryType: 'caldas', active: true, createdAt: new Date().toISOString() },
    { id: '4', name: 'Mel', price: 3.00, categoryType: 'caldas', active: true, createdAt: new Date().toISOString() },
    
    // Complementos
    { id: '5', name: 'Granola', price: 3.50, categoryType: 'complementos', active: true, createdAt: new Date().toISOString() },
    { id: '6', name: 'Aveia', price: 2.00, categoryType: 'complementos', active: true, createdAt: new Date().toISOString() },
    { id: '7', name: 'Coco Ralado', price: 2.50, categoryType: 'complementos', active: true, createdAt: new Date().toISOString() },
    { id: '8', name: 'Castanha do Pará', price: 4.00, categoryType: 'complementos', active: true, createdAt: new Date().toISOString() },
    { id: '9', name: 'Amendoim', price: 2.50, categoryType: 'complementos', active: true, createdAt: new Date().toISOString() },
    
    // Adicionais
    { id: '10', name: 'Banana', price: 1.50, categoryType: 'adicionais', active: true, createdAt: new Date().toISOString() },
    { id: '11', name: 'Morango', price: 3.00, categoryType: 'adicionais', active: true, createdAt: new Date().toISOString() },
    { id: '12', name: 'Manga', price: 2.50, categoryType: 'adicionais', active: true, createdAt: new Date().toISOString() },
    { id: '13', name: 'Kiwi', price: 3.50, categoryType: 'adicionais', active: true, createdAt: new Date().toISOString() },
    { id: '14', name: 'Paçoca', price: 2.00, categoryType: 'adicionais', active: true, createdAt: new Date().toISOString() },
    { id: '15', name: 'Bis', price: 2.50, categoryType: 'adicionais', active: true, createdAt: new Date().toISOString() },
  ];

  const caldasItems = acaiAddOns.filter(item => item.categoryType === 'caldas');
  const complementosItems = acaiAddOns.filter(item => item.categoryType === 'complementos');
  const adicionaisItems = acaiAddOns.filter(item => item.categoryType === 'adicionais');

  const handleAddToCart = () => {
    addToCart(product, quantity, [], observation, selectedAcaiAddOns);
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

  const incrementQuantity = () => setQuantity((prev) => prev + 1);
  const decrementQuantity = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const totalPrice = (product.price + selectedAcaiAddOns.reduce((sum, addon) => sum + addon.price, 0)) * quantity;

  const getCategoryIcon = (type: string) => {
    switch (type) {
      case 'caldas': return <Coffee className="h-4 w-4" />;
      case 'complementos': return <Cookie className="h-4 w-4" />;
      case 'adicionais': return <Apple className="h-4 w-4" />;
      default: return null;
    }
  };

  const renderAddOnsGrid = (items: AcaiAddOn[]) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
      {items.map((addon) => (
        <div key={addon.id} className="flex items-center space-x-3 rounded-lg border border-purple-100 p-3 bg-white/60 hover:bg-purple-50/50 transition-colors">
          <Checkbox
            id={`acai-addon-${addon.id}`}
            checked={selectedAcaiAddOns.some((item) => item.id === addon.id)}
            onCheckedChange={() => handleAcaiAddOnToggle(addon)}
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
                  <span>Caldas</span>
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
                  <p className="text-sm text-gray-600">Escolha suas caldas favoritas:</p>
                  {renderAddOnsGrid(caldasItems)}
                </div>
              </TabsContent>
              
              <TabsContent value="complementos" className="mt-4">
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">Adicione complementos nutritivos:</p>
                  {renderAddOnsGrid(complementosItems)}
                </div>
              </TabsContent>
              
              <TabsContent value="adicionais" className="mt-4">
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">Finalize com adicionais especiais:</p>
                  {renderAddOnsGrid(adicionaisItems)}
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
