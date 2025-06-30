
import { Product, AcaiAddOn } from '@/types';
import { storage } from '@/lib/utils';

export const getAcaiAddOns = () => {
  const products = storage.getProducts();
  const categories = storage.getCategories();
  
  // Helper function to get category name by ID
  const getCategoryName = (categoryId: string): string => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name.toLowerCase() : '';
  };

  // Complementos (valor 0,00) - produtos da categoria "complementos"
  const complementos = products.filter(p => {
    const categoryName = getCategoryName(p.categoryId);
    return categoryName.includes('complemento');
  }).map(p => ({
    id: p.id,
    name: p.name,
    price: 0.00, // Preço 0 para complementos
    categoryType: 'complementos' as const,
    active: true,
    createdAt: new Date().toISOString()
  }));

  // Coberturas (valor 0,00) - produtos da categoria "coberturas"
  const coberturas = products.filter(p => {
    const categoryName = getCategoryName(p.categoryId);
    return categoryName.includes('cobertura');
  }).map(p => ({
    id: p.id,
    name: p.name,
    price: 0.00, // Preço 0 para coberturas
    categoryType: 'caldas' as const,
    active: true,
    createdAt: new Date().toISOString()
  }));

  // Adicionais (produtos da categoria "adicionais" com preço normal)
  const adicionais = products.filter(p => {
    const categoryName = getCategoryName(p.categoryId);
    return categoryName.includes('adicional');
  }).map(p => ({
    id: p.id,
    name: p.name,
    price: p.price, // Preço normal para adicionais
    categoryType: 'adicionais' as const,
    active: true,
    createdAt: new Date().toISOString()
  }));

  // Fallback data if no real products found
  const fallbackData: AcaiAddOn[] = [
    // Coberturas (0,00)
    { id: '1', name: 'Calda de Chocolate', price: 0.00, categoryType: 'caldas', active: true, createdAt: new Date().toISOString() },
    { id: '2', name: 'Calda de Morango', price: 0.00, categoryType: 'caldas', active: true, createdAt: new Date().toISOString() },
    { id: '3', name: 'Leite Condensado', price: 0.00, categoryType: 'caldas', active: true, createdAt: new Date().toISOString() },
    { id: '4', name: 'Mel', price: 0.00, categoryType: 'caldas', active: true, createdAt: new Date().toISOString() },
    
    // Complementos (0,00)
    { id: '5', name: 'Granola', price: 0.00, categoryType: 'complementos', active: true, createdAt: new Date().toISOString() },
    { id: '6', name: 'Aveia', price: 0.00, categoryType: 'complementos', active: true, createdAt: new Date().toISOString() },
    { id: '7', name: 'Coco Ralado', price: 0.00, categoryType: 'complementos', active: true, createdAt: new Date().toISOString() },
    { id: '8', name: 'Castanha do Pará', price: 0.00, categoryType: 'complementos', active: true, createdAt: new Date().toISOString() },
    { id: '9', name: 'Amendoim', price: 0.00, categoryType: 'complementos', active: true, createdAt: new Date().toISOString() },
    
    // Adicionais
    { id: '10', name: 'Banana', price: 1.50, categoryType: 'adicionais', active: true, createdAt: new Date().toISOString() },
    { id: '11', name: 'Morango', price: 3.00, categoryType: 'adicionais', active: true, createdAt: new Date().toISOString() },
    { id: '12', name: 'Manga', price: 2.50, categoryType: 'adicionais', active: true, createdAt: new Date().toISOString() },
    { id: '13', name: 'Kiwi', price: 3.50, categoryType: 'adicionais', active: true, createdAt: new Date().toISOString() },
    { id: '14', name: 'Paçoca', price: 2.00, categoryType: 'adicionais', active: true, createdAt: new Date().toISOString() },
    { id: '15', name: 'Bis', price: 2.50, categoryType: 'adicionais', active: true, createdAt: new Date().toISOString() },
  ];

  // Combine real data with fallback
  const allAddOns = [
    ...coberturas,
    ...complementos,
    ...adicionais,
    ...(coberturas.length === 0 && complementos.length === 0 && adicionais.length === 0 ? fallbackData : [])
  ];

  return {
    caldasItems: allAddOns.filter(item => item.categoryType === 'caldas'),
    complementosItems: allAddOns.filter(item => item.categoryType === 'complementos'),
    adicionaisItems: allAddOns.filter(item => item.categoryType === 'adicionais')
  };
};
