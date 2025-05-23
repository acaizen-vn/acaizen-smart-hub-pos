
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Cart, CartItem, Sale, StoreSettings, User } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Função para gerar ID único
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Simulação de criptografia - em um app real, usaríamos bcrypt ou similar
export function hashPassword(password: string): string {
  return btoa(password + "salt_simulado");
}

// Formata número para moeda brasileira
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

// Formata data para formato brasileiro
export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('pt-BR');
}

export function formatDateTime(date: string): string {
  return new Date(date).toLocaleString('pt-BR');
}

// Gerencia salvamento e carregamento do localStorage
export const storage = {
  // Funções para usuários
  getUsers: (): User[] => {
    const users = localStorage.getItem('users');
    return users ? JSON.parse(users) : [];
  },
  saveUsers: (users: User[]) => {
    localStorage.setItem('users', JSON.stringify(users));
  },
  
  // Funções para autenticação
  getAuth: () => {
    const auth = localStorage.getItem('auth');
    return auth ? JSON.parse(auth) : { user: null, isAuthenticated: false };
  },
  saveAuth: (auth: { user: User | null; isAuthenticated: boolean }) => {
    localStorage.setItem('auth', JSON.stringify(auth));
  },
  
  // Funções para produtos, categorias e adicionais
  getProducts: () => {
    const products = localStorage.getItem('products');
    return products ? JSON.parse(products) : [];
  },
  saveProducts: (products: any[]) => {
    localStorage.setItem('products', JSON.stringify(products));
  },
  
  getCategories: () => {
    const categories = localStorage.getItem('categories');
    return categories ? JSON.parse(categories) : [];
  },
  saveCategories: (categories: any[]) => {
    localStorage.setItem('categories', JSON.stringify(categories));
  },
  
  getAddOns: () => {
    const addOns = localStorage.getItem('addOns');
    return addOns ? JSON.parse(addOns) : [];
  },
  saveAddOns: (addOns: any[]) => {
    localStorage.setItem('addOns', JSON.stringify(addOns));
  },
  
  // Funções para carrinho
  getCart: (): Cart => {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : { items: [], totalItems: 0, subtotal: 0 };
  },
  saveCart: (cart: Cart) => {
    localStorage.setItem('cart', JSON.stringify(cart));
  },
  
  // Funções para vendas
  getSales: (): Sale[] => {
    const sales = localStorage.getItem('sales');
    return sales ? JSON.parse(sales) : [];
  },
  saveSales: (sales: Sale[]) => {
    localStorage.setItem('sales', JSON.stringify(sales));
  },
  
  // Função para configurações da loja
  getStoreSettings: (): StoreSettings => {
    const settings = localStorage.getItem('storeSettings');
    return settings ? JSON.parse(settings) : {
      name: 'Açaízen SmartHUB',
      phone: '(00) 00000-0000',
      address: 'Av. Exemplo, 123 - Cidade, UF',
      instagram: '@acaizen',
      facebook: 'facebook.com/acaizen'
    };
  },
  saveStoreSettings: (settings: StoreSettings) => {
    localStorage.setItem('storeSettings', JSON.stringify(settings));
  },
  
  // Função para exportar todos os dados
  exportData: () => {
    const data = {
      users: localStorage.getItem('users'),
      products: localStorage.getItem('products'),
      categories: localStorage.getItem('categories'),
      addOns: localStorage.getItem('addOns'),
      sales: localStorage.getItem('sales'),
      storeSettings: localStorage.getItem('storeSettings'),
    };
    return JSON.stringify(data);
  },
  
  // Função para importar todos os dados
  importData: (data: string) => {
    try {
      const parsed = JSON.parse(data);
      if (parsed.users) localStorage.setItem('users', parsed.users);
      if (parsed.products) localStorage.setItem('products', parsed.products);
      if (parsed.categories) localStorage.setItem('categories', parsed.categories);
      if (parsed.addOns) localStorage.setItem('addOns', parsed.addOns);
      if (parsed.sales) localStorage.setItem('sales', parsed.sales);
      if (parsed.storeSettings) localStorage.setItem('storeSettings', parsed.storeSettings);
      return true;
    } catch (e) {
      console.error("Erro ao importar dados:", e);
      return false;
    }
  }
};

// Função para inicializar dados padrão se não existirem
export function initializeDefaultData() {
  // Verificar se já existem usuários
  const users = storage.getUsers();
  if (users.length === 0) {
    // Criar usuário administrador padrão
    const adminUser: User = {
      id: generateId(),
      name: 'Administrador',
      email: 'pdvzen1@gmail.com',
      password: hashPassword('Zen2024'),
      role: 'admin',
      active: true,
      createdAt: new Date().toISOString(),
    };
    storage.saveUsers([adminUser]);
  }
  
  // Verificar se já existem categorias
  const categories = storage.getCategories();
  if (categories.length === 0) {
    // Criar categorias padrão
    const defaultCategories = [
      {
        id: generateId(),
        name: 'Açaí',
        description: 'Produtos de açaí',
        active: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: generateId(),
        name: 'Bebidas',
        description: 'Sucos, refrigerantes e outras bebidas',
        active: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: generateId(),
        name: 'Lanches',
        description: 'Lanches e salgados',
        active: true,
        createdAt: new Date().toISOString(),
      },
    ];
    storage.saveCategories(defaultCategories);
    
    // Adicionar produtos para cada categoria
    const acaiCategoryId = defaultCategories[0].id;
    const bebidasCategoryId = defaultCategories[1].id;
    const lanchesCategoryId = defaultCategories[2].id;
    
    const defaultProducts = [
      {
        id: generateId(),
        name: 'Açaí Tradicional 300ml',
        price: 15.90,
        description: 'Açaí puro na tigela (300ml)',
        categoryId: acaiCategoryId,
        active: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: generateId(),
        name: 'Açaí Tradicional 500ml',
        price: 22.90,
        description: 'Açaí puro na tigela (500ml)',
        categoryId: acaiCategoryId,
        active: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: generateId(),
        name: 'Açaí com Banana 300ml',
        price: 18.90,
        description: 'Açaí com banana na tigela (300ml)',
        categoryId: acaiCategoryId,
        active: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: generateId(),
        name: 'Refrigerante Lata',
        price: 5.00,
        description: 'Refrigerante em lata 350ml',
        categoryId: bebidasCategoryId,
        active: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: generateId(),
        name: 'Suco Natural',
        price: 8.00,
        description: 'Suco natural de frutas',
        categoryId: bebidasCategoryId,
        active: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: generateId(),
        name: 'Coxinha',
        price: 6.00,
        description: 'Coxinha de frango',
        categoryId: lanchesCategoryId,
        active: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: generateId(),
        name: 'Pão de Queijo',
        price: 4.50,
        description: 'Pão de queijo tradicional',
        categoryId: lanchesCategoryId,
        active: true,
        createdAt: new Date().toISOString(),
      },
    ];
    storage.saveProducts(defaultProducts);
  }
  
  // Verificar se já existem adicionais
  const addOns = storage.getAddOns();
  if (addOns.length === 0) {
    // Criar adicionais padrão
    const defaultAddOns = [
      {
        id: generateId(),
        name: 'Granola',
        price: 2.00,
        active: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: generateId(),
        name: 'Leite Condensado',
        price: 2.50,
        active: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: generateId(),
        name: 'Leite Ninho',
        price: 3.00,
        active: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: generateId(),
        name: 'Banana',
        price: 2.00,
        active: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: generateId(),
        name: 'Morango',
        price: 3.50,
        active: true,
        createdAt: new Date().toISOString(),
      },
    ];
    storage.saveAddOns(defaultAddOns);
  }
  
  // Verificar se já existem configurações da loja
  const storeSettings = storage.getStoreSettings();
  if (!storeSettings.name || storeSettings.name === 'Açaízen SmartHUB') {
    // Criar configurações padrão
    const defaultSettings: StoreSettings = {
      name: 'Açaízen SmartHUB',
      phone: '(00) 00000-0000',
      address: 'Av. Exemplo, 123 - Cidade, UF',
      instagram: '@acaizen',
      facebook: 'facebook.com/acaizen',
    };
    storage.saveStoreSettings(defaultSettings);
  }
}
