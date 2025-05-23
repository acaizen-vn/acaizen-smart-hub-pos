
import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import ProductCard from '@/components/PDV/ProductCard';
import CartItem from '@/components/PDV/CartItem';
import CheckoutModal from '@/components/PDV/CheckoutModal';
import ReceiptModal from '@/components/PDV/ReceiptModal';
import { useCart } from '@/contexts/CartContext';
import { Product, Category, Sale } from '@/types';
import { storage, formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingCart, Trash } from 'lucide-react';

const PDVPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);
  
  const { cart, clearCart } = useCart();
  
  // Carregar categorias e produtos do localStorage
  useEffect(() => {
    const loadedCategories = storage.getCategories().filter((cat: Category) => cat.active);
    const loadedProducts = storage.getProducts().filter((prod: Product) => prod.active);
    
    setCategories(loadedCategories);
    setProducts(loadedProducts);
    
    if (loadedCategories.length > 0) {
      setSelectedCategory(loadedCategories[0].id);
    }
  }, []);
  
  // Filtrar produtos pela categoria selecionada
  const filteredProducts = selectedCategory
    ? products.filter((product) => product.categoryId === selectedCategory)
    : products;
    
  const handleCompleteSale = (sale: Sale) => {
    setCompletedSale(sale);
    setIsCheckoutModalOpen(false);
    setIsReceiptModalOpen(true);
  };
  
  return (
    <MainLayout>
      <div className="flex flex-col md:flex-row h-full gap-6">
        {/* Seção de produtos */}
        <div className="md:w-3/5 lg:w-2/3 space-y-4">
          <div className="glass rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-4">Produtos</h2>
            
            <Tabs 
              value={selectedCategory || ''} 
              onValueChange={setSelectedCategory}
              className="w-full"
            >
              <TabsList className="w-full overflow-x-auto flex whitespace-nowrap">
                {categories.map((category) => (
                  <TabsTrigger 
                    key={category.id} 
                    value={category.id}
                    className="px-4 flex-shrink-0"
                  >
                    {category.name}
                  </TabsTrigger>
                ))}
              </TabsList>
              {categories.map((category) => (
                <TabsContent key={category.id} value={category.id} className="mt-4 relative min-h-[300px]">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                  
                  {filteredProducts.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhum produto disponível nesta categoria.
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>
        
        {/* Seção do carrinho */}
        <div className="md:w-2/5 lg:w-1/3">
          <div className="glass rounded-lg p-4 sticky top-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center">
                <ShoppingCart className="mr-2 h-5 w-5" />
                Pedido
              </h2>
              
              {cart.items.length > 0 && (
                <Button variant="outline" size="sm" onClick={clearCart} className="text-destructive">
                  <Trash className="h-4 w-4 mr-1" />
                  Limpar
                </Button>
              )}
            </div>
            
            <div className="space-y-3 mb-4 overflow-y-auto" style={{ maxHeight: '400px' }}>
              {cart.items.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
              
              {cart.items.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Carrinho vazio. Adicione produtos ao pedido.
                </div>
              )}
            </div>
            
            <div className="border-t pt-4">
              <div className="flex justify-between text-lg font-medium mb-2">
                <span>Total</span>
                <span>{formatCurrency(cart.subtotal)}</span>
              </div>
              
              <div className="mt-6">
                <Button
                  onClick={() => setIsCheckoutModalOpen(true)}
                  disabled={cart.items.length === 0}
                  className="w-full h-12 text-lg btn-secondary"
                >
                  Finalizar Pedido
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modal de checkout */}
      <CheckoutModal
        open={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        onFinalized={handleCompleteSale}
      />
      
      {/* Modal de comprovante */}
      {completedSale && (
        <ReceiptModal
          open={isReceiptModalOpen}
          onClose={() => setIsReceiptModalOpen(false)}
          sale={completedSale}
        />
      )}
    </MainLayout>
  );
};

export default PDVPage;
