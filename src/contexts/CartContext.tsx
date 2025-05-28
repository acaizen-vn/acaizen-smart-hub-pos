import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Cart, CartItem, SelectedAddOn, SelectedAcaiAddOn, Product, AddOn, Sale, PaymentMethod } from '@/types';
import { generateId, storage } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from './AuthContext';

interface CartContextType {
  cart: Cart;
  addToCart: (product: Product, quantity: number, addOns: SelectedAddOn[], observation: string, acaiAddOns?: SelectedAcaiAddOn[]) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  finalizeSale: (customerName: string, paymentMethod: PaymentMethod, cashAmount?: number, pixQrCode?: string) => Promise<Sale | null>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<Cart>({ items: [], totalItems: 0, subtotal: 0 });
  const { toast } = useToast();
  const { authState } = useAuth();
  
  // Carregar o carrinho do localStorage quando o componente for montado
  useEffect(() => {
    const savedCart = storage.getCart();
    setCart(savedCart);
  }, []);
  
  // Salvar o carrinho no localStorage sempre que ele mudar
  useEffect(() => {
    storage.saveCart(cart);
  }, [cart]);
  
  // Calcular o subtotal de um item
  const calculateItemSubtotal = (
    price: number, 
    quantity: number, 
    addOns: SelectedAddOn[], 
    acaiAddOns?: SelectedAcaiAddOn[]
  ): number => {
    const addOnsTotal = addOns.reduce((sum, addon) => sum + addon.price, 0);
    const acaiAddOnsTotal = acaiAddOns?.reduce((sum, addon) => sum + addon.price, 0) || 0;
    return (price + addOnsTotal + acaiAddOnsTotal) * quantity;
  };
  
  // Adicionar um produto ao carrinho
  const addToCart = (
    product: Product,
    quantity: number,
    addOns: SelectedAddOn[],
    observation: string,
    acaiAddOns?: SelectedAcaiAddOn[]
  ) => {
    if (quantity <= 0) {
      toast({
        title: "Quantidade inválida",
        description: "A quantidade deve ser maior que zero",
        variant: "destructive",
      });
      return;
    }
    
    const itemSubtotal = calculateItemSubtotal(product.price, quantity, addOns, acaiAddOns);
    
    const newItem: CartItem = {
      id: generateId(),
      productId: product.id,
      productName: product.name,
      price: product.price,
      quantity,
      addOns,
      acaiAddOns,
      observation,
      subtotal: itemSubtotal,
    };
    
    setCart((prevCart) => {
      const updatedItems = [...prevCart.items, newItem];
      const updatedTotalItems = prevCart.totalItems + quantity;
      const updatedSubtotal = prevCart.subtotal + itemSubtotal;
      
      return {
        items: updatedItems,
        totalItems: updatedTotalItems,
        subtotal: updatedSubtotal,
      };
    });
    
    toast({
      title: "Produto adicionado",
      description: `${product.name} foi adicionado ao carrinho`,
    });
  };
  
  // Remover um item do carrinho
  const removeFromCart = (itemId: string) => {
    setCart((prevCart) => {
      const itemToRemove = prevCart.items.find((item) => item.id === itemId);
      
      if (!itemToRemove) {
        return prevCart;
      }
      
      const updatedItems = prevCart.items.filter((item) => item.id !== itemId);
      const updatedTotalItems = prevCart.totalItems - itemToRemove.quantity;
      const updatedSubtotal = prevCart.subtotal - itemToRemove.subtotal;
      
      toast({
        title: "Produto removido",
        description: `${itemToRemove.productName} foi removido do carrinho`,
      });
      
      return {
        items: updatedItems,
        totalItems: updatedTotalItems,
        subtotal: updatedSubtotal,
      };
    });
  };
  
  // Atualizar a quantidade de um item
  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    
    setCart((prevCart) => {
      const itemIndex = prevCart.items.findIndex((item) => item.id === itemId);
      
      if (itemIndex === -1) {
        return prevCart;
      }
      
      const item = prevCart.items[itemIndex];
      const oldQuantity = item.quantity;
      const oldSubtotal = item.subtotal;
      
      const addOnsTotal = item.addOns.reduce((sum, addon) => sum + addon.price, 0);
      const acaiAddOnsTotal = item.acaiAddOns?.reduce((sum, addon) => sum + addon.price, 0) || 0;
      const newSubtotal = (item.price + addOnsTotal + acaiAddOnsTotal) * quantity;
      
      const updatedItems = [...prevCart.items];
      updatedItems[itemIndex] = {
        ...item,
        quantity,
        subtotal: newSubtotal,
      };
      
      const updatedTotalItems = prevCart.totalItems - oldQuantity + quantity;
      const updatedSubtotal = prevCart.subtotal - oldSubtotal + newSubtotal;
      
      return {
        items: updatedItems,
        totalItems: updatedTotalItems,
        subtotal: updatedSubtotal,
      };
    });
  };
  
  // Limpar o carrinho
  const clearCart = () => {
    setCart({ items: [], totalItems: 0, subtotal: 0 });
  };
  
  // Finalizar a venda
  const finalizeSale = async (
    customerName: string,
    paymentMethod: PaymentMethod,
    cashAmount?: number,
    pixQrCode?: string
  ): Promise<Sale | null> => {
    try {
      if (cart.items.length === 0) {
        toast({
          title: "Carrinho vazio",
          description: "Adicione produtos ao carrinho antes de finalizar a venda",
          variant: "destructive",
        });
        return null;
      }
      
      if (!customerName) {
        toast({
          title: "Nome do cliente obrigatório",
          description: "Informe o nome do cliente para finalizar a venda",
          variant: "destructive",
        });
        return null;
      }
      
      // Verificar se é pagamento em dinheiro e se o valor recebido é suficiente
      if (paymentMethod === 'cash' && cashAmount !== undefined) {
        if (cashAmount < cart.subtotal) {
          toast({
            title: "Valor insuficiente",
            description: "O valor recebido é menor que o valor total da venda",
            variant: "destructive",
          });
          return null;
        }
      }
      
      // Calcular o troco (apenas para pagamento em dinheiro)
      const change = paymentMethod === 'cash' && cashAmount !== undefined
        ? cashAmount - cart.subtotal
        : undefined;
      
      // Criar a venda
      const sale: Sale = {
        id: generateId(),
        items: [...cart.items],
        customerName,
        paymentMethod,
        subtotal: cart.subtotal,
        cashAmount,
        change,
        pixQrCode,
        createdAt: new Date().toISOString(),
        createdBy: authState.user?.id || 'unknown',
      };
      
      // Salvar a venda no histórico
      const sales = storage.getSales();
      sales.push(sale);
      storage.saveSales(sales);
      
      // Limpar o carrinho
      clearCart();
      
      toast({
        title: "Venda finalizada",
        description: `Venda finalizada com sucesso para ${customerName}`,
      });
      
      return sale;
    } catch (error) {
      console.error('Erro ao finalizar venda:', error);
      toast({
        title: 'Erro ao finalizar venda',
        description: 'Ocorreu um erro ao processar sua solicitação.',
        variant: 'destructive',
      });
      return null;
    }
  };
  
  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, finalizeSale }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart deve ser usado dentro de um CartProvider');
  }
  return context;
};
