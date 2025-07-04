
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

// Novos tipos para categorias específicas do açaí
export interface AcaiCategory {
  id: string;
  name: string;
  type: 'caldas' | 'complementos' | 'adicionais';
  active: boolean;
  createdAt: string;
}

export interface AcaiAddOn {
  id: string;
  name: string;
  price: number;
  categoryType: 'caldas' | 'complementos' | 'adicionais';
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
  acaiAddOns?: SelectedAcaiAddOn[];
  observation: string;
  subtotal: number;
}

export interface SelectedAddOn {
  id: string;
  name: string;
  price: number;
}

export interface SelectedAcaiAddOn {
  id: string;
  name: string;
  price: number;
  categoryType: 'caldas' | 'complementos' | 'adicionais';
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
  pixQrCode?: string; // QR Code do Pix
  createdAt: string;
  createdBy: string; // ID do usuário que realizou a venda
}

// Novos tipos para controle de caixa
export interface CashRegister {
  id: string;
  openedBy: string;
  openedAt: string;
  closedBy?: string;
  closedAt?: string;
  initialAmount: number;
  finalAmount?: number;
  totalSales: number;
  totalCashSales: number;
  totalCardSales: number;
  totalPixSales: number;
  salesCount: number;
  isOpen: boolean;
  observations?: string;
}

export interface CashMovement {
  id: string;
  cashRegisterId: string;
  type: 'opening' | 'sale' | 'withdrawal' | 'deposit' | 'closing';
  amount: number;
  description: string;
  createdBy: string;
  createdAt: string;
  paymentMethod?: PaymentMethod;
  saleId?: string;
}

// Novos tipos para gateways de pagamento
export interface PaymentGateway {
  id: string;
  name: string;
  active: boolean;
  apiKey: string;
  apiSecret?: string;
  environment: 'sandbox' | 'production';
  type: 'mercadopago' | 'pagseguro' | 'stripe' | 'paypal';
}

// Tipos para WhatsApp
export interface WhatsAppSettings {
  enabled: boolean;
  qrCode?: string;
  connected: boolean;
  botEnabled: boolean;
  welcomeMessage: string;
  autoReply: boolean;
  phoneNumber: string;
}

// Tipos para configurações de impressão
export interface PrintSettings {
  autoprint: boolean;
  printerName?: string;
  paperSize: '58mm' | '80mm';
  copies: number;
}

// Tipos para configurações de cores
export interface ColorSettings {
  primary: string;
  secondary: string;
  background: string;
  foreground: string;
  accent: string;
  muted: string;
  preset: 'acaiteria' | 'deposito' | 'custom';
}

export interface StoreSettings {
  name: string;
  phone: string;
  address: string;
  instagram: string;
  facebook: string;
  logoUrl?: string;
  systemTitle?: string;
  businessType: 'acaiteria' | 'deposito_bebidas';
  colors: ColorSettings;
  paymentGateways: PaymentGateway[];
  whatsapp: WhatsAppSettings;
  print: PrintSettings;
}
