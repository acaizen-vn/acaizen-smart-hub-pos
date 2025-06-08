
import React, { ReactNode, useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ShoppingCart, 
  User, 
  Package, 
  Settings, 
  BarChart4, 
  Menu, 
  LogOut, 
  X 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useCart } from '@/contexts/CartContext';
import { formatCurrency, storage } from '@/lib/utils';
import { applyTheme } from '@/lib/theme';
import { Toaster } from '@/components/ui/toaster';
import { StoreSettings } from '@/types';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const { authState, logout, isAdmin } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => storage.getStoreSettings());

  // Carregar configurações da loja e aplicar tema
  useEffect(() => {
    const settings = storage.getStoreSettings();
    setStoreSettings(settings);
    
    // Aplicar tema se existirem configurações de cor
    if (settings.colors) {
      applyTheme(settings.colors);
    }
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!authState.isAuthenticated) {
    navigate('/login');
    return null;
  }

  // Determinar logo e nome a serem exibidos
  const logoSrc = storeSettings.logoUrl || "/lovable-uploads/f02b49e9-b0fc-44fe-ac71-2116f14ccab8.png";
  const storeName = storeSettings.name || 'Açaízen SmartHUB';
  
  const menuItems = [
    { 
      name: 'PDV', 
      path: '/', 
      icon: <ShoppingCart className="h-5 w-5" />, 
      access: true 
    },
    { 
      name: 'Produtos', 
      path: '/products', 
      icon: <Package className="h-5 w-5" />, 
      access: isAdmin 
    },
    { 
      name: 'Funcionários', 
      path: '/users', 
      icon: <User className="h-5 w-5" />, 
      access: isAdmin 
    },
    { 
      name: 'Relatórios', 
      path: '/reports', 
      icon: <BarChart4 className="h-5 w-5" />, 
      access: isAdmin 
    },
    { 
      name: 'Configurações', 
      path: '/settings', 
      icon: <Settings className="h-5 w-5" />, 
      access: isAdmin 
    },
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar para desktop */}
      <aside className="hidden md:flex flex-col w-64 glass shadow-md">
        <div className="flex justify-center p-4 border-b border-primary/10">
          <img 
            src={logoSrc}
            alt={storeName}
            className="h-14 w-auto rounded-md"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "https://via.placeholder.com/150x60?text=A%C3%A7a%C3%ADzen";
            }}
          />
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          <nav className="space-y-2">
            {menuItems.filter(item => item.access).map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className="flex items-center px-4 py-3 text-sm text-primary rounded-md transition-colors hover:bg-accent group"
              >
                <span className="mr-3 text-primary group-hover:text-primary">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-primary/10">
          <div className="flex items-center mb-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{authState.user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{authState.user?.email}</p>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            onClick={handleLogout} 
            className="w-full flex items-center justify-center"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Mobile sidebar */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-200",
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setSidebarOpen(false)}
      />

      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 glass transform transition-transform duration-200 ease-in-out md:hidden",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex justify-between items-center p-4 border-b border-primary/10">
          <img 
            src={logoSrc}
            alt={storeName}
            className="h-10 w-auto rounded-md"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "https://via.placeholder.com/150x60?text=A%C3%A7a%C3%ADzen";
            }}
          />
          <button onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          <nav className="space-y-2">
            {menuItems.filter(item => item.access).map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className="flex items-center px-4 py-3 text-sm text-primary rounded-md transition-colors hover:bg-accent group"
                onClick={() => setSidebarOpen(false)}
              >
                <span className="mr-3 text-primary group-hover:text-primary">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-primary/10">
          <div className="flex items-center mb-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{authState.user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{authState.user?.email}</p>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            onClick={handleLogout} 
            className="w-full flex items-center justify-center"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Content area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top navigation */}
        <header className="glass shadow-sm flex h-16 items-center px-4 border-b border-primary/10">
          <button
            className="p-2 md:hidden hover:bg-accent rounded-md"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="ml-4 md:ml-0 flex-1">
            <h1 className="text-xl font-medium">{storeName}</h1>
          </div>
          <div className="flex items-center space-x-4">
            {window.location.pathname === '/' && (
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Carrinho:</div>
                <div className="text-lg font-semibold">{formatCurrency(cart.subtotal)}</div>
              </div>
            )}
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </main>
      </div>
      <Toaster />
    </div>
  );
};

export default MainLayout;
