import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { storeApi } from '@/lib/store-api';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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

const audienceOptions = [
  { value: 'men', label: 'Men' },
  { value: 'women', label: 'Women' },
  { value: 'unisex', label: 'Unisex' },
  { value: 'kids', label: 'Kids' },
];

function defaultSizesForCategory(category?: { slug?: string }) {
  if (category?.slug === 'shoes') return '38, 39, 40, 41, 42, 43, 44';
  if (category?.slug === 'kids') return '2T, 3T, 4T, 5T, 6T';
  if (category?.slug === 'accessories') return 'One Size';
  return 'XS, S, M, L, XL';
}

function makeSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [collections, setCollections] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [productToDelete, setProductToDelete] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    collectionId: '',
    gender: 'unisex',
    sizes: 'XS, S, M, L, XL',
    basePrice: '',
    initialStock: '25',
    imageUrl: '',
    sizeGuide: '',
    fitNotes: '',
    active: true
  });

  const fetchProducts = async () => {
    try {
      const data = await (storeApi.db as any).products.list();
      const colls = await (storeApi.db as any).collections.list();
      setCollections(colls);
      
      // Enrich with variant counts
      const enriched = await Promise.all(
        data.map(async (p: any) => {
          const variants = await (storeApi.db as any).productVariants.list({ where: { productId: p.id } });
          const totalStock = variants.reduce((sum: number, v: any) => sum + Number(v.stock || 0), 0);
          return { ...p, variantCount: variants.length, totalStock };
        })
      );
      setProducts(enriched);
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to load products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.collectionId) {
      toast.error('Choose a product category before saving.');
      return;
    }

    const basePrice = Number(formData.basePrice);
    if (!Number.isFinite(basePrice) || basePrice <= 0) {
      toast.error('Enter a product price greater than zero.');
      return;
    }

    setSaving(true);
    try {
      const productData = {
        name: formData.name,
        slug: makeSlug(formData.slug || formData.name),
        description: formData.description,
        collectionId: formData.collectionId || null,
        gender: formData.gender,
        basePrice,
        imageUrl: formData.imageUrl,
        sizeGuide: formData.sizeGuide,
        fitNotes: formData.fitNotes,
        active: formData.active ? "1" : "0"
      };

      if (editingProduct) {
        await (storeApi.db as any).products.update(editingProduct.id, productData);
        toast.success('Product updated');
      } else {
        await (storeApi.db as any).products.create({
          ...productData,
          initialStock: Number(formData.initialStock),
          sizes: formData.sizes.split(',').map((size) => size.trim()).filter(Boolean),
        });
      }

      await fetchProducts();
      if (!editingProduct) toast.success('Product saved and published to the storefront.');
      setIsDialogOpen(false);
      setEditingProduct(null);
      resetForm();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save product.');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (file?: File) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Product photos must be 5 MB or smaller.');
      return;
    }

    setUploadingImage(true);
    try {
      const { imageUrl } = await storeApi.api.uploadProductImage(file);
      setFormData((previous) => ({ ...previous, imageUrl }));
      toast.success('Product photo uploaded.');
    } catch (error) {
      console.error('Failed to upload product photo:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload product photo.');
    } finally {
      setUploadingImage(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      collectionId: '',
      gender: 'unisex',
      sizes: 'XS, S, M, L, XL',
      basePrice: '',
      initialStock: '25',
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
      gender: product.gender || 'unisex',
      sizes: '',
      basePrice: String(product.basePrice),
      initialStock: '25',
      imageUrl: product.imageUrl || '',
      sizeGuide: product.sizeGuide || '',
      fitNotes: product.fitNotes || '',
      active: product.active === "1"
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      await (storeApi.db as any).products.delete(id);
      await fetchProducts();
      toast.success('Product deleted from the catalog.');
      setProductToDelete(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete product.');
    } finally {
      setDeleting(false);
    }
  };

  const toggleActive = async (product: any) => {
    try {
      await (storeApi.db as any).products.update(product.id, {
        active: product.active === "1" ? "0" : "1"
      });
      await fetchProducts();
      toast.success(product.active === "1" ? 'Product moved to drafts.' : 'Product published.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update product.');
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
              <DialogDescription>
                Add a product to a category and set its price. New active products appear in the storefront as soon as they are saved.
              </DialogDescription>
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
                  <Label className="text-xs uppercase tracking-widest">Category *</Label>
                  <Select
                    value={formData.collectionId}
                    onValueChange={(value) => setFormData((previous) => ({
                      ...previous,
                      collectionId: value,
                      ...(!editingProduct ? { sizes: defaultSizesForCategory(collections.find((collection) => collection.id === value)) } : {}),
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {collections.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-widest">Price (ETB) *</Label>
                  <Input 
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={formData.basePrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, basePrice: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-widest">For *</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(gender) => setFormData((previous) => ({ ...previous, gender }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select audience" />
                    </SelectTrigger>
                    <SelectContent>
                      {audienceOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-widest">Sizes *</Label>
                  <Input
                    value={formData.sizes}
                    onChange={(event) => setFormData((previous) => ({ ...previous, sizes: event.target.value }))}
                    placeholder="XS, S, M, L, XL"
                    disabled={Boolean(editingProduct)}
                    required={!editingProduct}
                  />
                  <p className="text-xs text-muted-foreground">
                    {editingProduct ? 'Manage existing sizes from the product’s Variants menu.' : 'Comma-separated sizes; each size gets its own stock option.'}
                  </p>
                </div>
              </div>
              {!editingProduct && (
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-widest">Starting stock</Label>
                  <Input
                    type="number"
                    min="0"
                    max="1000000"
                    step="1"
                    value={formData.initialStock}
                    onChange={(e) => setFormData(prev => ({ ...prev, initialStock: e.target.value }))}
                    required
                  />
                  <p className="text-xs text-muted-foreground">A default purchasable product option will be created with this stock.</p>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="product-photo-file" className="text-xs uppercase tracking-widest">Upload product photo</Label>
                <Input
                  id="product-photo-file"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={uploadingImage || saving}
                  onChange={(event) => {
                    void handleImageUpload(event.target.files?.[0]);
                    event.target.value = '';
                  }}
                />
                <p className="text-xs text-muted-foreground">Choose a JPEG, PNG, or WebP image up to 5 MB. It will be uploaded to the store server.</p>
                <Label htmlFor="product-photo-url" className="text-xs uppercase tracking-widest">Or enter a photo URL</Label>
                <Input 
                  id="product-photo-url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                  placeholder="https://... or /images/products/example.jpg"
                />
                {formData.imageUrl.trim() && (
                  <img
                    src={formData.imageUrl}
                    alt={`${formData.name || 'Product'} preview`}
                    className="h-32 w-24 rounded-sm border object-cover"
                    onError={(event) => {
                      event.currentTarget.src = '/images/products/men-model.jpg';
                    }}
                  />
                )}
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
              <Button type="submit" className="w-full" disabled={saving || uploadingImage}>
                {uploadingImage ? 'Uploading photo...' : saving ? 'Saving...' : editingProduct ? 'Update Product' : 'Save and Publish Product'}
              </Button>
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
              <TableHead>For</TableHead>
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
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  No products found
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map(product => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="h-12 w-12 bg-secondary overflow-hidden rounded-sm">
                      <img 
                        src={product.imageUrl || '/images/products/men-model.jpg'}
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
                  <TableCell className="text-xs capitalize">{product.gender || 'unisex'}</TableCell>
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
                            onClick={() => setProductToDelete(product)}
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

      <AlertDialog
        open={Boolean(productToDelete)}
        onOpenChange={(open) => {
          if (!open && !deleting) setProductToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete product?</AlertDialogTitle>
            <AlertDialogDescription>
              {productToDelete?.name} and its variants will be removed from the catalog. Products with order history cannot be deleted; deactivate those instead.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleting}
              onClick={(event) => {
                event.preventDefault();
                if (productToDelete) void handleDelete(productToDelete.id);
              }}
            >
              {deleting ? 'Deleting...' : 'Delete Product'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
