
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { User, Product, Category, Sale, StoreSettings, ColorSettings, CashRegister, CashMovement, AddOn, AuthState, Cart } from "@/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString('pt-BR');
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('pt-BR');
};

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export const hashPassword = (password: string): string => {
  // Simple encoding for demo purposes - in production use proper hashing
  return btoa(password + 'salt');
};

// Global cash register synchronization listeners
type CashRegisterListener = (cashRegister: CashRegister | null) => void;
const cashRegisterListeners: CashRegisterListener[] = [];

export const subscribeToCashRegister = (listener: CashRegisterListener) => {
  cashRegisterListeners.push(listener);
  return () => {
    const index = cashRegisterListeners.indexOf(listener);
    if (index > -1) {
      cashRegisterListeners.splice(index, 1);
    }
  };
};

const notifyCashRegisterChange = (cashRegister: CashRegister | null) => {
  cashRegisterListeners.forEach(listener => listener(cashRegister));
};

export const initializeDefaultData = () => {
  // Initialize default admin user if no users exist
  const users = storage.getUsers();
  if (users.length === 0) {
    const defaultAdmin: User = {
      id: generateId(),
      name: 'Administrador',
      email: 'pdvzen1@gmail.com',
      password: hashPassword('Zen2024'),
      role: 'admin',
      active: true,
      createdAt: new Date().toISOString()
    };
    storage.saveUser(defaultAdmin);
  }

  // Initialize default categories
  const categories = storage.getCategories();
  if (categories.length === 0) {
    const defaultCategories: Category[] = [
      {
        id: generateId(),
        name: 'Açaí',
        description: 'Produtos de açaí',
        active: true,
        createdAt: new Date().toISOString()
      },
      {
        id: generateId(),
        name: 'Bebidas',
        description: 'Bebidas diversas',
        active: true,
        createdAt: new Date().toISOString()
      },
      {
        id: generateId(),
        name: 'Complementos',
        description: 'Complementos para açaí (sem cobrança)',
        active: true,
        createdAt: new Date().toISOString()
      },
      {
        id: generateId(),
        name: 'Adicionais',
        description: 'Adicionais para produtos',
        active: true,
        createdAt: new Date().toISOString()
      },
      {
        id: generateId(),
        name: 'Coberturas',
        description: 'Coberturas para açaí (sem cobrança)',
        active: true,
        createdAt: new Date().toISOString()
      }
    ];
    defaultCategories.forEach(category => storage.saveCategory(category));
  }

  // Initialize default add-ons for açaí
  const addOns = storage.getAddOns();
  if (addOns.length === 0) {
    const defaultAddOns: AddOn[] = [
      // Complementos (gratuitos)
      { id: generateId(), name: 'Granola', price: 0, active: true, createdAt: new Date().toISOString() },
      { id: generateId(), name: 'Banana', price: 0, active: true, createdAt: new Date().toISOString() },
      { id: generateId(), name: 'Morango', price: 0, active: true, createdAt: new Date().toISOString() },
      { id: generateId(), name: 'Leite Condensado', price: 0, active: true, createdAt: new Date().toISOString() },
      // Adicionais (com cobrança)
      { id: generateId(), name: 'Whey Protein', price: 3.00, active: true, createdAt: new Date().toISOString() },
      { id: generateId(), name: 'Amendoim', price: 2.00, active: true, createdAt: new Date().toISOString() },
      { id: generateId(), name: 'Castanha', price: 2.50, active: true, createdAt: new Date().toISOString() },
    ];
    defaultAddOns.forEach(addOn => storage.saveAddOn(addOn));
  }
};

export const storage = {
  // Auth
  getAuth: (): AuthState => {
    const auth = localStorage.getItem('pdv_auth');
    return auth ? JSON.parse(auth) : { user: null, isAuthenticated: false };
  },

  saveAuth: (authState: AuthState) => {
    localStorage.setItem('pdv_auth', JSON.stringify(authState));
  },

  // Users
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

  saveUsers: (users: User[]) => {
    localStorage.setItem('pdv_users', JSON.stringify(users));
  },
  
  deleteUser: (userId: string) => {
    const users = storage.getUsers().filter(u => u.id !== userId);
    localStorage.setItem('pdv_users', JSON.stringify(users));
  },

  // Products
  getProducts: (): Product[] => {
    const products = localStorage.getItem('pdv_products');
    return products ? JSON.parse(products) : [];
  },

  getProductsByCategory: (categoryName: string): Product[] => {
    const products = storage.getProducts();
    const categories = storage.getCategories();
    const category = categories.find(c => c.name.toLowerCase() === categoryName.toLowerCase());
    if (!category) return [];
    return products.filter(p => p.categoryId === category.id && p.active);
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

  saveProducts: (products: Product[]) => {
    localStorage.setItem('pdv_products', JSON.stringify(products));
  },
  
  deleteProduct: (productId: string) => {
    const products = storage.getProducts().filter(p => p.id !== productId);
    localStorage.setItem('pdv_products', JSON.stringify(products));
  },

  // Categories
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

  saveCategories: (categories: Category[]) => {
    localStorage.setItem('pdv_categories', JSON.stringify(categories));
  },
  
  deleteCategory: (categoryId: string) => {
    const categories = storage.getCategories().filter(c => c.id !== categoryId);
    localStorage.setItem('pdv_categories', JSON.stringify(categories));
  },

  // AddOns
  getAddOns: (): AddOn[] => {
    const addOns = localStorage.getItem('pdv_addons');
    return addOns ? JSON.parse(addOns) : [];
  },

  saveAddOn: (addOn: AddOn) => {
    const addOns = storage.getAddOns();
    const existingIndex = addOns.findIndex(a => a.id === addOn.id);
    
    if (existingIndex >= 0) {
      addOns[existingIndex] = addOn;
    } else {
      addOns.push(addOn);
    }
    
    localStorage.setItem('pdv_addons', JSON.stringify(addOns));
  },

  saveAddOns: (addOns: AddOn[]) => {
    localStorage.setItem('pdv_addons', JSON.stringify(addOns));
  },

  // Cart
  getCart: (): Cart => {
    const cart = localStorage.getItem('pdv_cart');
    return cart ? JSON.parse(cart) : { items: [], totalItems: 0, subtotal: 0 };
  },

  saveCart: (cart: Cart) => {
    localStorage.setItem('pdv_cart', JSON.stringify(cart));
  },

  // Sales
  getSales: (): Sale[] => {
    const sales = localStorage.getItem('pdv_sales');
    return sales ? JSON.parse(sales) : [];
  },
  
  saveSale: (sale: Sale) => {
    const sales = storage.getSales();
    sales.push(sale);
    localStorage.setItem('pdv_sales', JSON.stringify(sales));
  },

  saveSales: (sales: Sale[]) => {
    localStorage.setItem('pdv_sales', JSON.stringify(sales));
  },

  // Store Settings
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

  // Cash Registers with global sync
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
    
    // Notify all listeners about cash register change
    const currentCashRegister = cashRegister.isOpen ? cashRegister : null;
    notifyCashRegisterChange(currentCashRegister);
  },

  // Cash Movements
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
  },

  // Data Import/Export
  exportData: (): string => {
    const data = {
      users: storage.getUsers(),
      products: storage.getProducts(),
      categories: storage.getCategories(),
      addOns: storage.getAddOns(),
      sales: storage.getSales(),
      storeSettings: storage.getStoreSettings(),
      cashRegisters: storage.getCashRegisters(),
      cashMovements: storage.getCashMovements()
    };
    
    return JSON.stringify(data, null, 2);
  },

  downloadBackup: () => {
    const data = storage.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pdv_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  importData: (dataString: string) => {
    try {
      const data = JSON.parse(dataString);
      if (data.users) storage.saveUsers(data.users);
      if (data.products) storage.saveProducts(data.products);
      if (data.categories) storage.saveCategories(data.categories);
      if (data.addOns) storage.saveAddOns(data.addOns);
      if (data.sales) storage.saveSales(data.sales);
      if (data.storeSettings) storage.saveStoreSettings(data.storeSettings);
      if (data.cashRegisters) {
        data.cashRegisters.forEach((cr: CashRegister) => storage.saveCashRegister(cr));
      }
      if (data.cashMovements) {
        data.cashMovements.forEach((cm: CashMovement) => storage.saveCashMovement(cm));
      }
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }
};
