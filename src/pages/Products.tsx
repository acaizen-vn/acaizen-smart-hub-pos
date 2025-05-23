
import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Category, Product, AddOn } from '@/types';
import { storage, formatCurrency, generateId } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Package, Tag, Plus, Pencil, Download, Upload } from 'lucide-react';

const ProductsPage = () => {
  const [activeTab, setActiveTab] = useState("products");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [addOns, setAddOns] = useState<AddOn[]>([]);
  
  // Estado para diálogos
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isAddOnDialogOpen, setIsAddOnDialogOpen] = useState(false);
  
  // Estado para o item atual sendo editado
  const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({});
  const [currentCategory, setCurrentCategory] = useState<Partial<Category>>({});
  const [currentAddOn, setCurrentAddOn] = useState<Partial<AddOn>>({});
  
  // Estado para importação/exportação
  const [importText, setImportText] = useState('');
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  
  const { toast } = useToast();
  
  // Carregar dados do localStorage
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = () => {
    setProducts(storage.getProducts());
    setCategories(storage.getCategories());
    setAddOns(storage.getAddOns());
  };
  
  // Funções para produtos
  const openProductDialog = (product?: Product) => {
    if (product) {
      setCurrentProduct({ ...product });
    } else {
      setCurrentProduct({
        name: '',
        price: 0,
        description: '',
        categoryId: categories.length > 0 ? categories[0].id : '',
        active: true
      });
    }
    setIsProductDialogOpen(true);
  };
  
  const saveProduct = () => {
    if (!currentProduct.name || !currentProduct.categoryId || currentProduct.price === undefined) {
      toast({
        title: "Erro ao salvar produto",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }
    
    const allProducts = storage.getProducts();
    
    if (currentProduct.id) {
      // Editar produto existente
      const index = allProducts.findIndex((p: Product) => p.id === currentProduct.id);
      if (index !== -1) {
        allProducts[index] = {
          ...allProducts[index],
          ...currentProduct,
        } as Product;
      }
    } else {
      // Criar novo produto
      const newProduct: Product = {
        id: generateId(),
        name: currentProduct.name || '',
        price: currentProduct.price || 0,
        description: currentProduct.description || '',
        categoryId: currentProduct.categoryId || '',
        active: currentProduct.active !== undefined ? currentProduct.active : true,
        createdAt: new Date().toISOString()
      };
      allProducts.push(newProduct);
    }
    
    storage.saveProducts(allProducts);
    setProducts(allProducts);
    setIsProductDialogOpen(false);
    toast({
      title: "Produto salvo",
      description: "Produto salvo com sucesso"
    });
  };
  
  // Funções para categorias
  const openCategoryDialog = (category?: Category) => {
    if (category) {
      setCurrentCategory({ ...category });
    } else {
      setCurrentCategory({
        name: '',
        description: '',
        active: true
      });
    }
    setIsCategoryDialogOpen(true);
  };
  
  const saveCategory = () => {
    if (!currentCategory.name) {
      toast({
        title: "Erro ao salvar categoria",
        description: "O nome da categoria é obrigatório",
        variant: "destructive"
      });
      return;
    }
    
    const allCategories = storage.getCategories();
    
    if (currentCategory.id) {
      // Editar categoria existente
      const index = allCategories.findIndex((c: Category) => c.id === currentCategory.id);
      if (index !== -1) {
        allCategories[index] = {
          ...allCategories[index],
          ...currentCategory,
        } as Category;
      }
    } else {
      // Criar nova categoria
      const newCategory: Category = {
        id: generateId(),
        name: currentCategory.name || '',
        description: currentCategory.description || '',
        active: currentCategory.active !== undefined ? currentCategory.active : true,
        createdAt: new Date().toISOString()
      };
      allCategories.push(newCategory);
    }
    
    storage.saveCategories(allCategories);
    setCategories(allCategories);
    setIsCategoryDialogOpen(false);
    toast({
      title: "Categoria salva",
      description: "Categoria salva com sucesso"
    });
  };
  
  // Funções para adicionais
  const openAddOnDialog = (addOn?: AddOn) => {
    if (addOn) {
      setCurrentAddOn({ ...addOn });
    } else {
      setCurrentAddOn({
        name: '',
        price: 0,
        active: true
      });
    }
    setIsAddOnDialogOpen(true);
  };
  
  const saveAddOn = () => {
    if (!currentAddOn.name || currentAddOn.price === undefined) {
      toast({
        title: "Erro ao salvar adicional",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }
    
    const allAddOns = storage.getAddOns();
    
    if (currentAddOn.id) {
      // Editar adicional existente
      const index = allAddOns.findIndex((a: AddOn) => a.id === currentAddOn.id);
      if (index !== -1) {
        allAddOns[index] = {
          ...allAddOns[index],
          ...currentAddOn,
        } as AddOn;
      }
    } else {
      // Criar novo adicional
      const newAddOn: AddOn = {
        id: generateId(),
        name: currentAddOn.name || '',
        price: currentAddOn.price || 0,
        active: currentAddOn.active !== undefined ? currentAddOn.active : true,
        createdAt: new Date().toISOString()
      };
      allAddOns.push(newAddOn);
    }
    
    storage.saveAddOns(allAddOns);
    setAddOns(allAddOns);
    setIsAddOnDialogOpen(false);
    toast({
      title: "Adicional salvo",
      description: "Adicional salvo com sucesso"
    });
  };
  
  // Funções para importação/exportação
  const getCategoryName = (id: string) => {
    const category = categories.find(c => c.id === id);
    return category ? category.name : 'Sem categoria';
  };
  
  const exportToCSV = (type: 'products' | 'categories' | 'addons') => {
    try {
      let csvContent = '';
      let fileName = '';
      
      if (type === 'products') {
        csvContent = 'Nome,Preço,Descrição,Categoria,Ativo\n';
        products.forEach(product => {
          const categoryName = getCategoryName(product.categoryId);
          csvContent += `"${product.name}",${product.price},"${product.description}","${categoryName}",${product.active}\n`;
        });
        fileName = 'produtos.csv';
      } else if (type === 'categories') {
        csvContent = 'Nome,Descrição,Ativo\n';
        categories.forEach(category => {
          csvContent += `"${category.name}","${category.description || ''}",${category.active}\n`;
        });
        fileName = 'categorias.csv';
      } else if (type === 'addons') {
        csvContent = 'Nome,Preço,Ativo\n';
        addOns.forEach(addon => {
          csvContent += `"${addon.name}",${addon.price},${addon.active}\n`;
        });
        fileName = 'adicionais.csv';
      }
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Exportação concluída",
        description: `Dados exportados para ${fileName}`
      });
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      toast({
        title: "Erro na exportação",
        description: "Não foi possível exportar os dados",
        variant: "destructive"
      });
    }
  };
  
  const openImportDialog = () => {
    setImportText('');
    setIsImportDialogOpen(true);
  };
  
  const importFromCSV = () => {
    try {
      if (!importText.trim()) {
        toast({
          title: "Erro na importação",
          description: "Nenhum dado para importar",
          variant: "destructive"
        });
        return;
      }
      
      const lines = importText.trim().split('\n');
      const header = lines[0].toLowerCase();
      const dataLines = lines.slice(1);
      
      if (header.includes('preço') && header.includes('categoria')) {
        // Importar produtos
        const newProducts: Product[] = [];
        const existingProducts = storage.getProducts();
        
        dataLines.forEach(line => {
          const columns = line.split(',');
          if (columns.length >= 5) {
            const name = columns[0].replace(/"/g, '').trim();
            const price = parseFloat(columns[1]);
            const description = columns[2].replace(/"/g, '').trim();
            const categoryName = columns[3].replace(/"/g, '').trim();
            const active = columns[4].trim().toLowerCase() === 'true';
            
            // Encontrar a categoria pelo nome
            const category = categories.find(c => c.name.toLowerCase() === categoryName.toLowerCase());
            
            if (category) {
              newProducts.push({
                id: generateId(),
                name,
                price,
                description,
                categoryId: category.id,
                active,
                createdAt: new Date().toISOString()
              });
            }
          }
        });
        
        if (newProducts.length > 0) {
          storage.saveProducts([...existingProducts, ...newProducts]);
          setProducts([...existingProducts, ...newProducts]);
          toast({
            title: "Importação concluída",
            description: `${newProducts.length} produtos importados com sucesso`
          });
        } else {
          toast({
            title: "Importação concluída",
            description: "Nenhum produto foi importado"
          });
        }
      } else if (header.includes('nome') && header.includes('descrição') && !header.includes('preço')) {
        // Importar categorias
        const newCategories: Category[] = [];
        const existingCategories = storage.getCategories();
        
        dataLines.forEach(line => {
          const columns = line.split(',');
          if (columns.length >= 3) {
            const name = columns[0].replace(/"/g, '').trim();
            const description = columns[1].replace(/"/g, '').trim();
            const active = columns[2].trim().toLowerCase() === 'true';
            
            newCategories.push({
              id: generateId(),
              name,
              description,
              active,
              createdAt: new Date().toISOString()
            });
          }
        });
        
        if (newCategories.length > 0) {
          storage.saveCategories([...existingCategories, ...newCategories]);
          setCategories([...existingCategories, ...newCategories]);
          toast({
            title: "Importação concluída",
            description: `${newCategories.length} categorias importadas com sucesso`
          });
        } else {
          toast({
            title: "Importação concluída",
            description: "Nenhuma categoria foi importada"
          });
        }
      } else if (header.includes('nome') && header.includes('preço') && !header.includes('categoria')) {
        // Importar adicionais
        const newAddOns: AddOn[] = [];
        const existingAddOns = storage.getAddOns();
        
        dataLines.forEach(line => {
          const columns = line.split(',');
          if (columns.length >= 3) {
            const name = columns[0].replace(/"/g, '').trim();
            const price = parseFloat(columns[1]);
            const active = columns[2].trim().toLowerCase() === 'true';
            
            newAddOns.push({
              id: generateId(),
              name,
              price,
              active,
              createdAt: new Date().toISOString()
            });
          }
        });
        
        if (newAddOns.length > 0) {
          storage.saveAddOns([...existingAddOns, ...newAddOns]);
          setAddOns([...existingAddOns, ...newAddOns]);
          toast({
            title: "Importação concluída",
            description: `${newAddOns.length} adicionais importados com sucesso`
          });
        } else {
          toast({
            title: "Importação concluída",
            description: "Nenhum adicional foi importado"
          });
        }
      } else {
        toast({
          title: "Erro na importação",
          description: "Formato de arquivo inválido",
          variant: "destructive"
        });
      }
      
      setIsImportDialogOpen(false);
    } catch (error) {
      console.error('Erro ao importar dados:', error);
      toast({
        title: "Erro na importação",
        description: "Não foi possível importar os dados",
        variant: "destructive"
      });
    }
  };
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">Gerenciamento de Produtos</h1>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={openImportDialog} className="flex items-center">
              <Upload className="h-4 w-4 mr-2" />
              Importar
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="products" value={activeTab} onValueChange={setActiveTab} className="glass rounded-lg p-6">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="products" className="flex items-center">
              <Package className="h-4 w-4 mr-2" />
              Produtos
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center">
              <Tag className="h-4 w-4 mr-2" />
              Categorias
            </TabsTrigger>
            <TabsTrigger value="addons" className="flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Adicionais
            </TabsTrigger>
          </TabsList>
          
          {/* Tab de Produtos */}
          <TabsContent value="products" className="space-y-4">
            <div className="flex justify-between">
              <Button onClick={() => openProductDialog()} className="btn-primary">
                <Plus className="h-4 w-4 mr-2" /> Novo Produto
              </Button>
              <Button variant="outline" onClick={() => exportToCSV('products')} className="flex items-center">
                <Download className="h-4 w-4 mr-2" /> Exportar CSV
              </Button>
            </div>
            
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{formatCurrency(product.price)}</TableCell>
                      <TableCell>{getCategoryName(product.categoryId)}</TableCell>
                      <TableCell>{product.active ? 'Ativo' : 'Inativo'}</TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => openProductDialog(product)}
                          className="flex items-center"
                        >
                          <Pencil className="h-4 w-4 mr-2" /> Editar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  
                  {products.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                        Nenhum produto cadastrado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          
          {/* Tab de Categorias */}
          <TabsContent value="categories" className="space-y-4">
            <div className="flex justify-between">
              <Button onClick={() => openCategoryDialog()} className="btn-primary">
                <Plus className="h-4 w-4 mr-2" /> Nova Categoria
              </Button>
              <Button variant="outline" onClick={() => exportToCSV('categories')} className="flex items-center">
                <Download className="h-4 w-4 mr-2" /> Exportar CSV
              </Button>
            </div>
            
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell>{category.name}</TableCell>
                      <TableCell>{category.description}</TableCell>
                      <TableCell>{category.active ? 'Ativo' : 'Inativo'}</TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => openCategoryDialog(category)}
                          className="flex items-center"
                        >
                          <Pencil className="h-4 w-4 mr-2" /> Editar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  
                  {categories.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                        Nenhuma categoria cadastrada
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          
          {/* Tab de Adicionais */}
          <TabsContent value="addons" className="space-y-4">
            <div className="flex justify-between">
              <Button onClick={() => openAddOnDialog()} className="btn-primary">
                <Plus className="h-4 w-4 mr-2" /> Novo Adicional
              </Button>
              <Button variant="outline" onClick={() => exportToCSV('addons')} className="flex items-center">
                <Download className="h-4 w-4 mr-2" /> Exportar CSV
              </Button>
            </div>
            
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {addOns.map((addon) => (
                    <TableRow key={addon.id}>
                      <TableCell>{addon.name}</TableCell>
                      <TableCell>{formatCurrency(addon.price)}</TableCell>
                      <TableCell>{addon.active ? 'Ativo' : 'Inativo'}</TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => openAddOnDialog(addon)}
                          className="flex items-center"
                        >
                          <Pencil className="h-4 w-4 mr-2" /> Editar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  
                  {addOns.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                        Nenhum adicional cadastrado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Dialog para edição/criação de produtos */}
      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent className="max-w-md glass">
          <DialogHeader>
            <DialogTitle>{currentProduct.id ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="product-name">Nome*</Label>
              <Input 
                id="product-name"
                value={currentProduct.name || ''}
                onChange={(e) => setCurrentProduct({ ...currentProduct, name: e.target.value })}
                placeholder="Nome do produto"
                className="bg-white/40"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="product-price">Preço*</Label>
              <Input 
                id="product-price"
                type="number"
                step="0.01"
                min="0"
                value={currentProduct.price || ''}
                onChange={(e) => setCurrentProduct({ ...currentProduct, price: parseFloat(e.target.value) })}
                placeholder="0,00"
                className="bg-white/40"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="product-description">Descrição</Label>
              <Textarea 
                id="product-description"
                value={currentProduct.description || ''}
                onChange={(e) => setCurrentProduct({ ...currentProduct, description: e.target.value })}
                placeholder="Descreva o produto"
                className="bg-white/40"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="product-category">Categoria*</Label>
              <Select 
                value={currentProduct.categoryId} 
                onValueChange={(value) => setCurrentProduct({ ...currentProduct, categoryId: value })}
              >
                <SelectTrigger id="product-category" className="bg-white/40">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="product-active"
                checked={currentProduct.active}
                onCheckedChange={(checked) => setCurrentProduct({ ...currentProduct, active: checked })}
              />
              <Label htmlFor="product-active">Ativo</Label>
            </div>
          </div>
          
          <DialogFooter className="sm:justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsProductDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={saveProduct} className="btn-primary">
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog para edição/criação de categorias */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent className="max-w-md glass">
          <DialogHeader>
            <DialogTitle>{currentCategory.id ? 'Editar Categoria' : 'Nova Categoria'}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="category-name">Nome*</Label>
              <Input 
                id="category-name"
                value={currentCategory.name || ''}
                onChange={(e) => setCurrentCategory({ ...currentCategory, name: e.target.value })}
                placeholder="Nome da categoria"
                className="bg-white/40"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category-description">Descrição</Label>
              <Textarea 
                id="category-description"
                value={currentCategory.description || ''}
                onChange={(e) => setCurrentCategory({ ...currentCategory, description: e.target.value })}
                placeholder="Descreva a categoria"
                className="bg-white/40"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="category-active"
                checked={currentCategory.active}
                onCheckedChange={(checked) => setCurrentCategory({ ...currentCategory, active: checked })}
              />
              <Label htmlFor="category-active">Ativa</Label>
            </div>
          </div>
          
          <DialogFooter className="sm:justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsCategoryDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={saveCategory} className="btn-primary">
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog para edição/criação de adicionais */}
      <Dialog open={isAddOnDialogOpen} onOpenChange={setIsAddOnDialogOpen}>
        <DialogContent className="max-w-md glass">
          <DialogHeader>
            <DialogTitle>{currentAddOn.id ? 'Editar Adicional' : 'Novo Adicional'}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="addon-name">Nome*</Label>
              <Input 
                id="addon-name"
                value={currentAddOn.name || ''}
                onChange={(e) => setCurrentAddOn({ ...currentAddOn, name: e.target.value })}
                placeholder="Nome do adicional"
                className="bg-white/40"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="addon-price">Preço*</Label>
              <Input 
                id="addon-price"
                type="number"
                step="0.01"
                min="0"
                value={currentAddOn.price || ''}
                onChange={(e) => setCurrentAddOn({ ...currentAddOn, price: parseFloat(e.target.value) })}
                placeholder="0,00"
                className="bg-white/40"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="addon-active"
                checked={currentAddOn.active}
                onCheckedChange={(checked) => setCurrentAddOn({ ...currentAddOn, active: checked })}
              />
              <Label htmlFor="addon-active">Ativo</Label>
            </div>
          </div>
          
          <DialogFooter className="sm:justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsAddOnDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={saveAddOn} className="btn-primary">
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog para importação de dados */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="max-w-md glass">
          <DialogHeader>
            <DialogTitle>Importar Dados</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Cole os dados do CSV abaixo. A primeira linha deve conter os cabeçalhos.
            </p>
            
            <div className="space-y-2">
              <Label htmlFor="import-data">Dados CSV</Label>
              <Textarea 
                id="import-data"
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="Nome,Preço,Descrição,Categoria,Ativo"
                rows={10}
                className="bg-white/40"
              />
            </div>
          </div>
          
          <DialogFooter className="sm:justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsImportDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={importFromCSV} className="btn-primary">
              Importar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default ProductsPage;
