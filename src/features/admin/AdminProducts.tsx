import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { blink } from '@/lib/blink';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Plus,
  Edit2,
  Trash2,
  Eye,
  Search,
  MoreHorizontal,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [collections, setCollections] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    collectionId: '',
    basePrice: '',
    imageUrl: '',
    sizeGuide: '',
    fitNotes: '',
    active: true
  });

  const fetchProducts = async () => {
    try {
      const data = await (blink.db as any).products.list();
      const colls = await (blink.db as any).collections.list();
      setCollections(colls);
      
      // Enrich with variant counts
      const enriched = await Promise.all(
        data.map(async (p: any) => {
          const variants = await (blink.db as any).productVariants.list({ where: { productId: p.id } });
          const totalStock = variants.reduce((sum: number, v: any) => sum + Number(v.stock || 0), 0);
          return { ...p, variantCount: variants.length, totalStock };
        })
      );
      setProducts(enriched);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const productData = {
        name: formData.name,
        slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
        description: formData.description,
        collectionId: formData.collectionId || null,
        basePrice: parseFloat(formData.basePrice),
        imageUrl: formData.imageUrl,
        sizeGuide: formData.sizeGuide,
        fitNotes: formData.fitNotes,
        active: formData.active ? "1" : "0"
      };

      if (editingProduct) {
        await (blink.db as any).products.update(editingProduct.id, productData);
        toast.success('Product updated');
      } else {
        await (blink.db as any).products.create({
          ...productData,
          userId: 'admin'
        });
        toast.success('Product created');
      }

      setIsDialogOpen(false);
      setEditingProduct(null);
      resetForm();
      fetchProducts();
    } catch (error) {
      toast.error('Failed to save product');
      console.error(error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      collectionId: '',
      basePrice: '',
      imageUrl: '',
      sizeGuide: '',
      fitNotes: '',
      active: true
    });
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      slug: product.slug,
      description: product.description || '',
      collectionId: product.collectionId || '',
      basePrice: String(product.basePrice),
      imageUrl: product.imageUrl || '',
      sizeGuide: product.sizeGuide || '',
      fitNotes: product.fitNotes || '',
      active: product.active === "1"
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await (blink.db as any).products.delete(id);
      toast.success('Product deleted');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const toggleActive = async (product: any) => {
    try {
      await (blink.db as any).products.update(product.id, {
        active: product.active === "1" ? "0" : "1"
      });
      fetchProducts();
    } catch (error) {
      toast.error('Failed to update product');
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className="space-y-4 animate-pulse"><div className="h-12 bg-secondary" /><div className="h-64 bg-secondary" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="font-serif text-2xl font-bold uppercase tracking-tight">Products</h2>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) { setEditingProduct(null); resetForm(); }
        }}>
          <DialogTrigger asChild>
            <Button className="text-xs uppercase tracking-widest font-bold">
              <Plus className="mr-2 h-4 w-4" /> Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
              <DialogDescription>Fill in the product details below.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-widest">Product Name *</Label>
                  <Input 
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-widest">Slug</Label>
                  <Input 
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="auto-generated-if-empty"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest">Description</Label>
                <Textarea 
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-widest">Collection</Label>
                  <Select value={formData.collectionId} onValueChange={(v) => setFormData(prev => ({ ...prev, collectionId: v }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select collection" />
                    </SelectTrigger>
                    <SelectContent>
                      {collections.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-widest">Base Price (ETB) *</Label>
                  <Input 
                    type="number"
                    step="0.01"
                    value={formData.basePrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, basePrice: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest">Image URL</Label>
                <Input 
                  value={formData.imageUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                  placeholder="https://..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-widest">Size Guide</Label>
                  <Input 
                    value={formData.sizeGuide}
                    onChange={(e) => setFormData(prev => ({ ...prev, sizeGuide: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-widest">Fit Notes</Label>
                  <Input 
                    value={formData.fitNotes}
                    onChange={(e) => setFormData(prev => ({ ...prev, fitNotes: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, active: checked }))}
                />
                <Label className="text-xs">Active (visible on storefront)</Label>
              </div>
              <Button type="submit" className="w-full">{editingProduct ? 'Update Product' : 'Create Product'}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="border rounded-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16"></TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Collection</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-center">Variants</TableHead>
              <TableHead className="text-center">Stock</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No products found
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map(product => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="h-12 w-12 bg-secondary overflow-hidden rounded-sm">
                      <img 
                        src={product.imageUrl || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=100'}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-bold text-sm">{product.name}</p>
                      <p className="text-[10px] text-muted-foreground">{product.slug}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs">
                    {collections.find(c => c.id === product.collectionId)?.name || '-'}
                  </TableCell>
                  <TableCell className="text-right font-bold text-sm">
                    {Number(product.basePrice).toLocaleString()} ETB
                  </TableCell>
                  <TableCell className="text-center text-xs">{product.variantCount}</TableCell>
                  <TableCell className="text-center text-xs">{product.totalStock}</TableCell>
                  <TableCell className="text-center">
                    <button onClick={() => toggleActive(product)}>
                      <Badge variant={product.active === "1" ? "default" : "secondary"} className="text-[10px] cursor-pointer">
                        {product.active === "1" ? 'Active' : 'Draft'}
                      </Badge>
                    </button>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to={`/products/${product.slug}`}>
                            <Eye className="mr-2 h-4 w-4" /> View
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(product)}>
                          <Edit2 className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to={`/admin/products/${product.id}/variants`}>
                            <Settings className="mr-2 h-4 w-4" /> Manage Variants
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => handleDelete(product.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
