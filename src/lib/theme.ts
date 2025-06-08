
import { ColorSettings } from "@/types";

// Paletas predefinidas
export const colorPresets: Record<string, ColorSettings> = {
  acaiteria: {
    primary: '#9333ea',
    secondary: '#db2777',
    background: '#fef7ff',
    foreground: '#1f172a',
    accent: '#f3e8ff',
    muted: '#f1f5f9',
    preset: 'acaiteria'
  },
  deposito: {
    primary: '#0ea5e9',
    secondary: '#10b981',
    background: '#f0f9ff',
    foreground: '#0c4a6e',
    accent: '#e0f2fe',
    muted: '#f1f5f9',
    preset: 'deposito'
  }
};

// Converte HEX para HSL
export function hexToHsl(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

// Aplica o tema dinamicamente
export function applyTheme(colors: ColorSettings) {
  const root = document.documentElement;
  
  root.style.setProperty('--primary', hexToHsl(colors.primary));
  root.style.setProperty('--secondary', hexToHsl(colors.secondary));
  root.style.setProperty('--background', hexToHsl(colors.background));
  root.style.setProperty('--foreground', hexToHsl(colors.foreground));
  root.style.setProperty('--accent', hexToHsl(colors.accent));
  root.style.setProperty('--muted', hexToHsl(colors.muted));
  
  // Atualizar cores relacionadas para manter a consistência
  root.style.setProperty('--primary-foreground', hexToHsl(colors.background));
  root.style.setProperty('--secondary-foreground', hexToHsl(colors.background));
  root.style.setProperty('--accent-foreground', hexToHsl(colors.foreground));
  root.style.setProperty('--muted-foreground', hexToHsl('#64748b'));
}

// Obtém o preset baseado no tipo de negócio
export function getPresetForBusinessType(businessType: 'acaiteria' | 'deposito_bebidas'): ColorSettings {
  return businessType === 'acaiteria' ? colorPresets.acaiteria : colorPresets.deposito;
}
