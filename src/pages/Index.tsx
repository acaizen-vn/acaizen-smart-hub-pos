
import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import ProductCard from '@/components/PDV/ProductCard';
import CartItem from '@/components/PDV/CartItem';
import CheckoutModal from '@/components/PDV/CheckoutModal';
import ReceiptModal from '@/components/PDV/ReceiptModal';
import CashStatus from '@/components/CashRegister/CashStatus';
import OpenCashModal from '@/components/CashRegister/OpenCashModal';
import CloseCashModal from '@/components/CashRegister/CloseCashModal';
import { useCart } from '@/contexts/CartContext';
import { Product, Category, Sale, CashRegister } from '@/types';
import { storage, formatCurrency, subscribeToCashRegister } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingCart, Trash, Package, Coffee, ChevronLeft, ChevronRight } from 'lucide-react';

const PDVPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);
  const [currentCashRegister, setCurrentCashRegister] = useState<CashRegister | null>(null);
  const [isOpenCashModalOpen, setIsOpenCashModalOpen] = useState(false);
  const [isCloseCashModalOpen, setIsCloseCashModalOpen] = useState(false);
  const [categoryScrollPosition, setCategoryScrollPosition] = useState(0);
  
  const { cart, clearCart, addToCart } = useCart();
  const storeSettings = storage.getStoreSettings();
  
  // Global cash register synchronization
  useEffect(() => {
    // Initial load
    const cashRegister = storage.getCurrentCashRegister();
    setCurrentCashRegister(cashRegister);
    
    // Subscribe to changes
    const unsubscribe = subscribeToCashRegister((cashRegister) => {
      setCurrentCashRegister(cashRegister);
    });
    
    return unsubscribe;
  }, []);
  
  // Carregar categorias e produtos
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

  const handleAddToCart = (product: Product, addOns: any[] = [], observation: string = '') => {
    // Verificar se o caixa está aberto
    if (!currentCashRegister?.isOpen) {
      return;
    }
    addToCart(product, 1, addOns, observation);
  };
    
  const handleCompleteSale = (sale: Sale) => {
    // Atualizar dados do caixa após venda
    if (currentCashRegister) {
      const updatedCashRegister: CashRegister = {
        ...currentCashRegister,
        totalSales: currentCashRegister.totalSales + sale.subtotal,
        salesCount: currentCashRegister.salesCount + 1,
        totalCashSales: currentCashRegister.totalCashSales + (sale.paymentMethod === 'cash' ? sale.subtotal : 0),
        totalCardSales: currentCashRegister.totalCardSales + (['credit', 'debit'].includes(sale.paymentMethod) ? sale.subtotal : 0),
        totalPixSales: currentCashRegister.totalPixSales + (sale.paymentMethod === 'pix' ? sale.subtotal : 0)
      };
      
      storage.saveCashRegister(updatedCashRegister);
    }

    setCompletedSale(sale);
    setIsCheckoutModalOpen(false);
    setIsReceiptModalOpen(true);
  };

  const handleCashOpened = (cashRegister: CashRegister) => {
    setCurrentCashRegister(cashRegister);
  };

  const handleCashClosed = () => {
    setCurrentCashRegister(null);
  };

  // Category navigation functions
  const scrollCategories = (direction: 'left' | 'right') => {
    const container = document.querySelector('[data-category-scroll]');
    if (container) {
      const scrollAmount = 200;
      const currentScroll = container.scrollLeft;
      const newPosition = direction === 'left' 
        ? Math.max(0, currentScroll - scrollAmount)
        : currentScroll + scrollAmount;
      
      container.scrollTo({ left: newPosition, behavior: 'smooth' });
      setCategoryScrollPosition(newPosition);
    }
  };

  const canScrollLeft = categoryScrollPosition > 0;
  const canScrollRight = categories.length > 4; // Approximate check

  // Definir ícones e textos baseados no tipo de negócio
  const businessTypeConfig = {
    acaiteria: {
      productIcon: <Coffee className="mr-2 h-5 w-5" />,
      productTitle: "Açaís e Produtos",
      cartTitle: "Pedido",
      emptyMessage: "Carrinho vazio. Adicione produtos ao pedido."
    },
    deposito_bebidas: {
      productIcon: <Package className="mr-2 h-5 w-5" />,
      productTitle: "Bebidas e Produtos", 
      cartTitle: "Venda",
      emptyMessage: "Nenhum item selecionado. Adicione produtos à venda."
    }
  };

  const config = businessTypeConfig[storeSettings.businessType] || businessTypeConfig.deposito_bebidas;
  
  return (
    <MainLayout>
      <div className="flex flex-col lg:flex-row h-full gap-6">
        {/* Seção de produtos */}
        <div className="lg:w-2/3 space-y-4">
          <div className="glass rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              {config.productIcon}
              {config.productTitle}
            </h2>
            
            {!currentCashRegister?.isOpen && (
              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⚠️ Caixa fechado. Abra o caixa para começar as vendas.
                </p>
              </div>
            )}
            
            <Tabs 
              value={selectedCategory || ''} 
              onValueChange={setSelectedCategory}
              className="w-full"
            >
              {/* Responsive category navigation */}
              <div className="relative mb-4">
                {canScrollLeft && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white shadow-md h-8 w-8 p-0"
                    onClick={() => scrollCategories('left')}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                )}
                
                <div 
                  data-category-scroll
                  className="overflow-x-auto scrollbar-hide px-8"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  <TabsList className="flex w-max min-w-full justify-start gap-2 bg-transparent p-0">
                    {categories.map((category) => (
                      <TabsTrigger 
                        key={category.id} 
                        value={category.id}
                        className="flex-shrink-0 px-4 py-2 whitespace-nowrap data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                      >
                        {category.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>
                
                {canScrollRight && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white shadow-md h-8 w-8 p-0"
                    onClick={() => scrollCategories('right')}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              {categories.map((category) => (
                <TabsContent key={category.id} value={category.id} className="mt-4 relative min-h-[300px]">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredProducts.map((product) => (
                      <ProductCard 
                        key={product.id} 
                        product={product} 
                        onAddToCart={handleAddToCart}
                        disabled={!currentCashRegister?.isOpen}
                      />
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
        
        {/* Seção do carrinho e caixa */}
        <div className="lg:w-1/3 space-y-4">
          {/* Status do Caixa */}
          <CashStatus
            cashRegister={currentCashRegister}
            onOpenCash={() => setIsOpenCashModalOpen(true)}
            onCloseCash={() => setIsCloseCashModalOpen(true)}
          />

          {/* Carrinho */}
          <div className="glass rounded-lg p-4 sticky top-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center">
                <ShoppingCart className="mr-2 h-5 w-5" />
                {config.cartTitle}
              </h2>
              
              {cart.items.length > 0 && (
                <Button variant="outline" size="sm" onClick={clearCart} className="text-destructive">
                  <Trash className="h-4 w-4 mr-1" />
                  Limpar
                </Button>
              )}
            </div>
            
            <div className="space-y-3 mb-4 overflow-y-auto" style={{ maxHeight: '300px' }}>
              {cart.items.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
              
              {cart.items.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  {config.emptyMessage}
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
                  disabled={cart.items.length === 0 || !currentCashRegister?.isOpen}
                  className="w-full h-12 text-lg btn-secondary"
                >
                  {storeSettings.businessType === 'deposito_bebidas' ? 'Finalizar Venda' : 'Finalizar Pedido'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modals */}
      <OpenCashModal
        open={isOpenCashModalOpen}
        onClose={() => setIsOpenCashModalOpen(false)}
        onCashOpened={handleCashOpened}
      />

      {currentCashRegister && (
        <CloseCashModal
          open={isCloseCashModalOpen}
          onClose={() => setIsCloseCashModalOpen(false)}
          cashRegister={currentCashRegister}
          onCashClosed={handleCashClosed}
        />
      )}
      
      <CheckoutModal
        open={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        onFinalized={handleCompleteSale}
      />
      
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
