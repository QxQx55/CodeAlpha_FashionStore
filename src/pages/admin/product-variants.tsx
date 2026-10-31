import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { storeApi } from '@/lib/store-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Edit2, Trash2, Package, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function ProductVariants() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [variants, setVariants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<any>(null);
  const [formData, setFormData] = useState({
    size: '',
    color: '',
    material: '',
    price: '',
    stock: '',
    sku: '',
    imageUrls: ''
  });

  const fetchData = async () => {
    if (!productId) return;
    try {
      const products = await (storeApi.db as any).products.list({ where: { id: productId } });
      if (products.length === 0) {
        navigate('/admin/products');
        return;
      }
      setProduct(products[0]);

      const variantData = await (storeApi.db as any).productVariants.list({ 
        where: { productId } 
      });
      setVariants(variantData);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const variantData = {
        productId,
        size: formData.size || null,
        color: formData.color || null,
        material: formData.material || null,
        price: formData.price ? parseFloat(formData.price) : product.basePrice,
        stock: parseInt(formData.stock) || 0,
        sku: formData.sku || null,
        imageUrls: formData.imageUrls || null
      };

      if (editingVariant) {
        await (storeApi.db as any).productVariants.update(editingVariant.id, variantData);
        toast.success('Variant updated');
      } else {
        await (storeApi.db as any).productVariants.create(variantData);
        toast.success('Variant created');
      }

      setIsDialogOpen(false);
      setEditingVariant(null);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error('Failed to save variant');
    }
  };

  const resetForm = () => {
    setFormData({
      size: '',
      color: '',
      material: '',
      price: '',
      stock: '',
      sku: '',
      imageUrls: ''
    });
  };

  const handleEdit = (variant: any) => {
    setEditingVariant(variant);
    setFormData({
      size: variant.size || '',
      color: variant.color || '',
      material: variant.material || '',
      price: variant.price ? String(variant.price) : '',
      stock: String(variant.stock || 0),
      sku: variant.sku || '',
      imageUrls: variant.imageUrls || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await (storeApi.db as any).productVariants.delete(id);
      toast.success('Variant deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete variant');
    }
  };

  const handleBulkCreate = async () => {
    const sizes = ['XS', 'S', 'M', 'L', 'XL'];
    try {
      for (const size of sizes) {
        await (storeApi.db as any).productVariants.create({
          productId,
          size,
          price: product.basePrice,
          stock: 10
        });
      }
      toast.success('Created variants for all sizes');
      fetchData();
    } catch (error) {
      toast.error('Failed to create variants');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-48 bg-secondary" />
        <div className="h-64 bg-secondary" />
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <button 
            onClick={() => navigate('/admin/products')}
            className="flex items-center text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Products
          </button>
          <h1 className="font-serif text-2xl font-bold uppercase tracking-tight mt-2">
            {product.name} — Variants
          </h1>
          <p className="text-xs text-muted-foreground">
            Base price: {Number(product.basePrice).toLocaleString()} ETB | {variants.length} variants
          </p>
        </div>

        <div className="flex space-x-2">
          {variants.length === 0 && (
            <Button variant="outline" onClick={handleBulkCreate} className="text-xs">
              <Package className="mr-2 h-4 w-4" /> Quick Add Sizes
            </Button>
          )}
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) { setEditingVariant(null); resetForm(); }
          }}>
            <DialogTrigger asChild>
              <Button className="text-xs uppercase tracking-widest font-bold">
                <Plus className="mr-2 h-4 w-4" /> Add Variant
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingVariant ? 'Edit Variant' : 'Add New Variant'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-widest">Size</Label>
                    <Input 
                      value={formData.size}
                      onChange={(e) => setFormData(prev => ({ ...prev, size: e.target.value }))}
                      placeholder="M, L, XL..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-widest">Color</Label>
                    <Input 
                      value={formData.color}
                      onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                      placeholder="Black, White..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-widest">Material</Label>
                    <Input 
                      value={formData.material}
                      onChange={(e) => setFormData(prev => ({ ...prev, material: e.target.value }))}
                      placeholder="Cotton, Linen..."
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-widest">Price Override</Label>
                    <Input 
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                      placeholder={String(product.basePrice)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-widest">Stock *</Label>
                    <Input 
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-widest">SKU</Label>
                    <Input 
                      value={formData.sku}
                      onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                      placeholder="SKU-001"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-widest">Image URLs (JSON array)</Label>
                  <Input 
                    value={formData.imageUrls}
                    onChange={(e) => setFormData(prev => ({ ...prev, imageUrls: e.target.value }))}
                    placeholder='["https://..."]'
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Enter as JSON array: ["url1", "url2"] or leave blank to use product image.
                  </p>
                </div>
                <Button type="submit" className="w-full">
                  {editingVariant ? 'Update Variant' : 'Create Variant'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {variants.length === 0 ? (
        <div className="text-center py-20 border rounded-sm space-y-4">
          <Package className="h-12 w-12 mx-auto text-muted-foreground/30" />
          <p className="text-muted-foreground">No variants created yet.</p>
          <p className="text-xs text-muted-foreground">
            Add variants to specify different sizes, colors, or materials.
          </p>
        </div>
      ) : (
        <div className="border rounded-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16"></TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Color</TableHead>
                <TableHead>Material</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-center">Stock</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead className="w-24"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {variants.map(variant => {
                let images: string[] = [];
                try {
                  images = JSON.parse(variant.imageUrls || '[]');
                } catch {
                  images = variant.imageUrls ? [variant.imageUrls] : [];
                }
                
                return (
                  <TableRow key={variant.id}>
                    <TableCell>
                      <div className="h-10 w-10 bg-secondary overflow-hidden rounded-sm flex items-center justify-center">
                        {images[0] ? (
                          <img src={images[0]} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <ImageIcon className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{variant.size || '-'}</TableCell>
                    <TableCell>{variant.color || '-'}</TableCell>
                    <TableCell>{variant.material || '-'}</TableCell>
                    <TableCell className="text-right font-bold">
                      {Number(variant.price || product.basePrice).toLocaleString()} ETB
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge 
                        variant={variant.stock > 10 ? "default" : variant.stock > 0 ? "secondary" : "destructive"}
                        className="text-[10px]"
                      >
                        {variant.stock}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{variant.sku || '-'}</TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          onClick={() => handleEdit(variant)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Variant</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure? This will remove this variant from the product.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(variant.id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Inventory Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 border rounded-sm space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Total Stock</p>
          <p className="text-2xl font-bold">{variants.reduce((sum, v) => sum + (v.stock || 0), 0)}</p>
        </div>
        <div className="p-4 border rounded-sm space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Low Stock</p>
          <p className="text-2xl font-bold text-orange-600">
            {variants.filter(v => v.stock > 0 && v.stock <= 5).length}
          </p>
        </div>
        <div className="p-4 border rounded-sm space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Out of Stock</p>
          <p className="text-2xl font-bold text-red-600">
            {variants.filter(v => v.stock === 0).length}
          </p>
        </div>
      </div>
    </div>
  );
}
