
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Product } from '@/types';
import { formatCurrency, storage } from '@/lib/utils';
import AcaiProductModal from './AcaiProductModal';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, addOns?: any[], observation?: string) => void;
}

const ProductCard = ({ product, onAddToCart }: ProductCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const storeSettings = storage.getStoreSettings();
  
  // Verificar se é produto de açaí e se o tipo de negócio permite modal expandido
  const isAcaiProduct = product.name.toLowerCase().includes('açaí') || product.name.toLowerCase().includes('acai');
  const shouldShowAcaiModal = isAcaiProduct && storeSettings.businessType === 'acaiteria';

  const handleClick = () => {
    if (shouldShowAcaiModal) {
      setIsModalOpen(true);
    } else {
      // Para depósito de bebidas ou produtos que não são açaí, adicionar diretamente
      onAddToCart(product, [], '');
    }
  };

  const handleAddToCart = (addOns: any[] = [], observation: string = '') => {
    onAddToCart(product, addOns, observation);
    setIsModalOpen(false);
  };

  return (
    <>
      <Card className="interactive-card h-full">
        <CardContent className="p-4 h-full flex flex-col">
          {product.image && (
            <div className="w-full h-32 mb-3 overflow-hidden rounded-lg">
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div className="flex-1 flex flex-col">
            <h3 className="font-semibold text-sm mb-2 line-clamp-2">{product.name}</h3>
            
            {product.description && (
              <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                {product.description}
              </p>
            )}
            
            <div className="mt-auto space-y-3">
              <div className="text-lg font-bold text-primary">
                {formatCurrency(product.price)}
              </div>
              
              <Button 
                onClick={handleClick}
                className="w-full btn-primary"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-1" />
                {shouldShowAcaiModal ? 'Personalizar' : 'Adicionar'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {shouldShowAcaiModal && (
        <AcaiProductModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          product={product}
        />
      )}
    </>
  );
};

export default ProductCard;
