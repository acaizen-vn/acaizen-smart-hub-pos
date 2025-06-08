
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { User, Product, Category, Sale, StoreSettings, ColorSettings, CashRegister, CashMovement } from "@/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const storage = {
  // Usuários
  getUsers: (): User[] => {
    const users = localStorage.getItem('pdv_users');
    return users ? JSON.parse(users) : [];
  },
  
  saveUser: (user: User) => {
    const users = storage.getUsers();
    const existingIndex = users.findIndex(u => u.id === user.id);
    
    if (existingIndex >= 0) {
      users[existingIndex] = user;
    } else {
      users.push(user);
    }
    
    localStorage.setItem('pdv_users', JSON.stringify(users));
  },
  
  deleteUser: (userId: string) => {
    const users = storage.getUsers().filter(u => u.id !== userId);
    localStorage.setItem('pdv_users', JSON.stringify(users));
  },

  // Produtos
  getProducts: (): Product[] => {
    const products = localStorage.getItem('pdv_products');
    return products ? JSON.parse(products) : [];
  },
  
  saveProduct: (product: Product) => {
    const products = storage.getProducts();
    const existingIndex = products.findIndex(p => p.id === product.id);
    
    if (existingIndex >= 0) {
      products[existingIndex] = product;
    } else {
      products.push(product);
    }
    
    localStorage.setItem('pdv_products', JSON.stringify(products));
  },
  
  deleteProduct: (productId: string) => {
    const products = storage.getProducts().filter(p => p.id !== productId);
    localStorage.setItem('pdv_products', JSON.stringify(products));
  },

  // Categorias
  getCategories: (): Category[] => {
    const categories = localStorage.getItem('pdv_categories');
    return categories ? JSON.parse(categories) : [];
  },
  
  saveCategory: (category: Category) => {
    const categories = storage.getCategories();
    const existingIndex = categories.findIndex(c => c.id === category.id);
    
    if (existingIndex >= 0) {
      categories[existingIndex] = category;
    } else {
      categories.push(category);
    }
    
    localStorage.setItem('pdv_categories', JSON.stringify(categories));
  },
  
  deleteCategory: (categoryId: string) => {
    const categories = storage.getCategories().filter(c => c.id !== categoryId);
    localStorage.setItem('pdv_categories', JSON.stringify(categories));
  },

  // Vendas
  getSales: (): Sale[] => {
    const sales = localStorage.getItem('pdv_sales');
    return sales ? JSON.parse(sales) : [];
  },
  
  saveSale: (sale: Sale) => {
    const sales = storage.getSales();
    sales.push(sale);
    localStorage.setItem('pdv_sales', JSON.stringify(sales));
  },

  // Configurações da loja
  getStoreSettings: (): StoreSettings => {
    const settings = localStorage.getItem('pdv_store_settings');
    const defaultColors: ColorSettings = {
      primary: 'hsl(271, 81%, 56%)',
      secondary: 'hsl(210, 40%, 98%)',
      background: 'hsl(0, 0%, 100%)',
      foreground: 'hsl(222, 84%, 5%)',
      accent: 'hsl(210, 40%, 96%)',
      muted: 'hsl(210, 40%, 96%)',
      preset: 'acaiteria'
    };
    
    if (settings) {
      const parsed = JSON.parse(settings);
      return {
        ...parsed,
        colors: parsed.colors || defaultColors
      };
    }
    
    return {
      name: '',
      phone: '',
      address: '',
      instagram: '',
      facebook: '',
      businessType: 'acaiteria',
      colors: defaultColors,
      paymentGateways: [],
      whatsapp: {
        enabled: false,
        connected: false,
        botEnabled: false,
        welcomeMessage: '',
        autoReply: false,
        phoneNumber: ''
      },
      print: {
        autoprint: false,
        paperSize: '80mm',
        copies: 1
      }
    };
  },
  
  saveStoreSettings: (settings: StoreSettings) => {
    localStorage.setItem('pdv_store_settings', JSON.stringify(settings));
  },

  // Caixa
  getCashRegisters: (): CashRegister[] => {
    const cashRegisters = localStorage.getItem('pdv_cash_registers');
    return cashRegisters ? JSON.parse(cashRegisters) : [];
  },

  getCurrentCashRegister: (): CashRegister | null => {
    const cashRegisters = storage.getCashRegisters();
    return cashRegisters.find(cr => cr.isOpen) || null;
  },

  saveCashRegister: (cashRegister: CashRegister) => {
    const cashRegisters = storage.getCashRegisters();
    const existingIndex = cashRegisters.findIndex(cr => cr.id === cashRegister.id);
    
    if (existingIndex >= 0) {
      cashRegisters[existingIndex] = cashRegister;
    } else {
      cashRegisters.push(cashRegister);
    }
    
    localStorage.setItem('pdv_cash_registers', JSON.stringify(cashRegisters));
  },

  // Movimentações do caixa
  getCashMovements: (): CashMovement[] => {
    const movements = localStorage.getItem('pdv_cash_movements');
    return movements ? JSON.parse(movements) : [];
  },

  saveCashMovement: (movement: CashMovement) => {
    const movements = storage.getCashMovements();
    movements.push(movement);
    localStorage.setItem('pdv_cash_movements', JSON.stringify(movements));
  },

  getCashMovementsByCashRegister: (cashRegisterId: string): CashMovement[] => {
    return storage.getCashMovements().filter(m => m.cashRegisterId === cashRegisterId);
  }
};
