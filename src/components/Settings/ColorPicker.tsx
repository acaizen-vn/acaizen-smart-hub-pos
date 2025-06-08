
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ColorSettings } from '@/types';
import { colorPresets } from '@/lib/theme';

interface ColorPickerProps {
  colors: ColorSettings;
  onColorsChange: (colors: ColorSettings) => void;
}

export const ColorPicker = ({ colors, onColorsChange }: ColorPickerProps) => {
  const handlePresetSelect = (presetKey: string) => {
    const preset = colorPresets[presetKey];
    if (preset) {
      onColorsChange(preset);
    }
  };

  const handleColorChange = (colorKey: keyof ColorSettings, value: string) => {
    if (colorKey === 'preset') return;
    
    onColorsChange({
      ...colors,
      [colorKey]: value,
      preset: 'custom'
    });
  };

  return (
    <div className="space-y-6">
      {/* Presets */}
      <div>
        <Label className="text-base font-medium">Paletas Predefinidas</Label>
        <div className="grid grid-cols-2 gap-4 mt-3">
          <Card 
            className={`cursor-pointer transition-all hover:shadow-md ${colors.preset === 'acaiteria' ? 'ring-2 ring-primary' : ''}`}
            onClick={() => handlePresetSelect('acaiteria')}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Açaiteria</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex space-x-2">
                <div className="w-6 h-6 rounded-full" style={{ backgroundColor: colorPresets.acaiteria.primary }}></div>
                <div className="w-6 h-6 rounded-full" style={{ backgroundColor: colorPresets.acaiteria.secondary }}></div>
                <div className="w-6 h-6 rounded-full border" style={{ backgroundColor: colorPresets.acaiteria.background }}></div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all hover:shadow-md ${colors.preset === 'deposito' ? 'ring-2 ring-primary' : ''}`}
            onClick={() => handlePresetSelect('deposito')}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Depósito de Bebidas</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex space-x-2">
                <div className="w-6 h-6 rounded-full" style={{ backgroundColor: colorPresets.deposito.primary }}></div>
                <div className="w-6 h-6 rounded-full" style={{ backgroundColor: colorPresets.deposito.secondary }}></div>
                <div className="w-6 h-6 rounded-full border" style={{ backgroundColor: colorPresets.deposito.background }}></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Cores Personalizadas */}
      <div>
        <Label className="text-base font-medium">Cores Personalizadas</Label>
        <div className="grid grid-cols-2 gap-4 mt-3">
          <div>
            <Label htmlFor="primary-color">Cor Primária</Label>
            <div className="flex space-x-2">
              <Input
                id="primary-color"
                type="color"
                value={colors.primary}
                onChange={(e) => handleColorChange('primary', e.target.value)}
                className="w-16 h-10 p-1 rounded border"
              />
              <Input
                value={colors.primary}
                onChange={(e) => handleColorChange('primary', e.target.value)}
                placeholder="#9333ea"
                className="flex-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="secondary-color">Cor Secundária</Label>
            <div className="flex space-x-2">
              <Input
                id="secondary-color"
                type="color"
                value={colors.secondary}
                onChange={(e) => handleColorChange('secondary', e.target.value)}
                className="w-16 h-10 p-1 rounded border"
              />
              <Input
                value={colors.secondary}
                onChange={(e) => handleColorChange('secondary', e.target.value)}
                placeholder="#db2777"
                className="flex-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="background-color">Cor de Fundo</Label>
            <div className="flex space-x-2">
              <Input
                id="background-color"
                type="color"
                value={colors.background}
                onChange={(e) => handleColorChange('background', e.target.value)}
                className="w-16 h-10 p-1 rounded border"
              />
              <Input
                value={colors.background}
                onChange={(e) => handleColorChange('background', e.target.value)}
                placeholder="#fef7ff"
                className="flex-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="accent-color">Cor de Destaque</Label>
            <div className="flex space-x-2">
              <Input
                id="accent-color"
                type="color"
                value={colors.accent}
                onChange={(e) => handleColorChange('accent', e.target.value)}
                className="w-16 h-10 p-1 rounded border"
              />
              <Input
                value={colors.accent}
                onChange={(e) => handleColorChange('accent', e.target.value)}
                placeholder="#f3e8ff"
                className="flex-1"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div>
        <Label className="text-base font-medium">Preview</Label>
        <Card className="mt-3">
          <CardHeader>
            <CardTitle style={{ color: colors.primary }}>Exemplo de Título</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button 
                style={{ 
                  backgroundColor: colors.primary, 
                  color: colors.background 
                }}
                className="mr-2"
              >
                Botão Primário
              </Button>
              <Button 
                variant="outline"
                style={{ 
                  borderColor: colors.secondary,
                  color: colors.secondary
                }}
              >
                Botão Secundário
              </Button>
              <div 
                className="p-3 rounded"
                style={{ backgroundColor: colors.accent, color: colors.foreground }}
              >
                Área de destaque com as cores escolhidas
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
