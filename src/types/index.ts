
// Tipos para autenticação
export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // Em um sistema real, nunca armazenaríamos senhas em texto puro
  role: 'admin' | 'cashier';
  active: boolean;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

// Tipos para produtos e categorias
export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  categoryId: string;
  image?: string;
  active: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  createdAt: string;
}

export interface AddOn {
  id: string;
  name: string;
  price: number;
  active: boolean;
  createdAt: string;
}

// Tipos para carrinho e vendas
export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  addOns: SelectedAddOn[];
  observation: string;
  subtotal: number;
}

export interface SelectedAddOn {
  id: string;
  name: string;
  price: number;
}

export interface Cart {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
}

export type PaymentMethod = 'cash' | 'credit' | 'debit' | 'pix';

export interface Sale {
  id: string;
  items: CartItem[];
  customerName: string;
  paymentMethod: PaymentMethod;
  subtotal: number;
  cashAmount?: number; // Valor recebido em dinheiro
  change?: number; // Troco
  createdAt: string;
  createdBy: string; // ID do usuário que realizou a venda
}

export interface StoreSettings {
  name: string;
  phone: string;
  address: string;
  instagram: string;
  facebook: string;
}
