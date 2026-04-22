import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { blink } from '@/lib/blink';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ProductVariants } from './product-variants';
import { 
  LayoutDashboard, 
  Package, 
  Layers, 
  ShoppingBag, 
  RotateCcw, 
  TrendingUp,
  Plus,
  ArrowUpRight,
  Edit2,
  Trash2,
  Eye,
  Search,
  MoreHorizontal,
  Check,
  X,
  Truck,
  Clock,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  AlertDialogTrigger,
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

export function AdminDashboard() {
  const location = useLocation();

  const navItems = [
    { label: 'Overview', path: '/admin', icon: LayoutDashboard },
    { label: 'Products', path: '/admin/products', icon: Package },
    { label: 'Collections', path: '/admin/collections', icon: Layers },
    { label: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { label: 'Returns', path: '/admin/returns', icon: RotateCcw },
  ];

  return (
    <div className="container mx-auto px-4 py-32 lg:px-8">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Admin Sidebar */}
        <aside className="w-full lg:w-64 space-y-8">
          <div className="space-y-1">
            <h1 className="font-serif text-2xl font-bold uppercase tracking-tight">Admin Portal</h1>
            <p className="text-xs text-muted-foreground">Manage your boutique</p>
          </div>

          <nav className="flex lg:flex-col overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 space-x-4 lg:space-x-0 lg:space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center space-x-3 px-4 py-3 text-sm font-medium transition-colors border-b-2 lg:border-b-0 lg:border-l-2 whitespace-nowrap",
                  location.pathname === item.path
                    ? "border-accent text-foreground bg-accent/5"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-h-[600px]">
          <Routes>
            <Route index element={<AdminOverview />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="products/:productId/variants" element={<ProductVariants />} />
            <Route path="collections" element={<AdminCollections />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="returns" element={<AdminReturns />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function AdminOverview() {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    activeProducts: 0,
    activeCollections: 0
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [collectionSales, setCollectionSales] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const orders = await (blink.db as any).orders.list();
        const products = await (blink.db as any).products.list({ where: { active: "1" } });
        const collections = await (blink.db as any).collections.list({ where: { active: "1" } });

        const totalSales = (orders as any[]).reduce((sum, order) => sum + Number(order.totalAmount), 0);
        setRecentOrders(orders.slice(0, 5));

        // Calculate sales by collection
        const salesByCollection: Record<string, number> = {};
        for (const order of orders) {
          const orderItems = await (blink.db as any).orderItems.list({ where: { orderId: order.id } });
          for (const item of orderItems) {
            const variants = await (blink.db as any).productVariants.list({ where: { id: item.variantId } });
            if (variants[0]) {
              const prods = await (blink.db as any).products.list({ where: { id: variants[0].productId } });
              if (prods[0]) {
                const collId = prods[0].collectionId || 'uncategorized';
                salesByCollection[collId] = (salesByCollection[collId] || 0) + Number(item.price) * item.quantity;
              }
            }
          }
        }

        const collSalesArr = await Promise.all(
          Object.entries(salesByCollection).map(async ([collId, amount]) => {
            const coll = await (blink.db as any).collections.list({ where: { id: collId } });
            return {
              id: collId,
              name: coll[0]?.name || 'Uncategorized',
              amount
            };
          })
        );
        setCollectionSales(collSalesArr.sort((a, b) => b.amount - a.amount).slice(0, 5));

        setStats({
          totalSales,
          totalOrders: orders.length,
          activeProducts: products.length,
          activeCollections: collections.length
        });
      } catch (error) {
        console.error(error);
      }
    };
    fetchStats();
  }, []);

  const maxSales = Math.max(...collectionSales.map(c => c.amount), 1);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Sales" value={`${stats.totalSales.toLocaleString()} ETB`} icon={TrendingUp} trend="+12%" />
        <StatCard title="Orders" value={stats.totalOrders} icon={ShoppingBag} trend="+5%" />
        <StatCard title="Products" value={stats.activeProducts} icon={Package} />
        <StatCard title="Collections" value={stats.activeCollections} icon={Layers} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="rounded-sm border-none shadow-elegant">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center justify-between">
              Recent Orders
              <Button variant="ghost" size="sm" className="text-[10px] h-6 px-2" asChild>
                <Link to="/admin/orders">View All</Link>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">No orders yet</p>
              ) : (
                recentOrders.map(order => (
                  <div key={order.id} className="flex items-center justify-between text-xs py-2 border-b last:border-0">
                    <div className="space-y-1">
                      <p className="font-bold">Order #{order.id.slice(-8)}</p>
                      <p className="text-muted-foreground">${Number(order.totalAmount).toFixed(2)}</p>
                    </div>
                    <Badge variant="secondary" className="text-[10px]">{order.status}</Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-sm border-none shadow-elegant">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-widest">
              Sales by Collection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {collectionSales.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">No sales data yet</p>
              ) : (
                collectionSales.map((c, idx) => (
                  <div key={c.id} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>{c.name}</span>
                      <span className="font-bold">${c.amount.toFixed(2)}</span>
                    </div>
                    <div className="w-full h-1 bg-secondary overflow-hidden">
                      <div 
                        className={cn("h-full", idx === 0 ? "bg-accent" : "bg-primary")} 
                        style={{ width: `${(c.amount / maxSales) * 100}%` }} 
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, trend }: any) {
  return (
    <Card className="rounded-sm border-none shadow-elegant overflow-hidden">
      <CardContent className="p-6 space-y-2">
        <div className="flex justify-between items-start">
          <div className="p-2 bg-secondary rounded-sm">
            <Icon className="h-4 w-4 text-accent" />
          </div>
          {trend && (
            <span className="text-[10px] font-bold text-green-600 flex items-center">
              {trend} <ArrowUpRight className="h-2 w-2 ml-1" />
            </span>
          )}
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function AdminProducts() {
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
                  <Label className="text-xs uppercase tracking-widest">Base Price *</Label>
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
                    ${Number(product.basePrice).toFixed(2)}
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

function AdminCollections() {
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    imageUrl: '',
    active: true
  });

  const fetchCollections = async () => {
    try {
      const data = await (blink.db as any).collections.list();
      const enriched = await Promise.all(
        data.map(async (c: any) => {
          const products = await (blink.db as any).products.list({ where: { collectionId: c.id } });
          return { ...c, productCount: products.length };
        })
      );
      setCollections(enriched);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const collData = {
        name: formData.name,
        slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
        description: formData.description,
        imageUrl: formData.imageUrl,
        active: formData.active ? "1" : "0"
      };

      if (editingCollection) {
        await (blink.db as any).collections.update(editingCollection.id, collData);
        toast.success('Collection updated');
      } else {
        await (blink.db as any).collections.create({ ...collData, userId: 'admin' });
        toast.success('Collection created');
      }

      setIsDialogOpen(false);
      setEditingCollection(null);
      resetForm();
      fetchCollections();
    } catch (error) {
      toast.error('Failed to save collection');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', slug: '', description: '', imageUrl: '', active: true });
  };

  const handleEdit = (coll: any) => {
    setEditingCollection(coll);
    setFormData({
      name: coll.name,
      slug: coll.slug,
      description: coll.description || '',
      imageUrl: coll.imageUrl || '',
      active: coll.active === "1"
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await (blink.db as any).collections.delete(id);
      toast.success('Collection deleted');
      fetchCollections();
    } catch (error) {
      toast.error('Failed to delete collection');
    }
  };

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-12 bg-secondary" /><div className="h-64 bg-secondary" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="font-serif text-2xl font-bold uppercase tracking-tight">Collections</h2>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) { setEditingCollection(null); resetForm(); }
        }}>
          <DialogTrigger asChild>
            <Button className="text-xs uppercase tracking-widest font-bold">
              <Plus className="mr-2 h-4 w-4" /> Add Collection
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCollection ? 'Edit Collection' : 'Add New Collection'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest">Name *</Label>
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
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest">Description</Label>
                <Textarea 
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest">Image URL</Label>
                <Input 
                  value={formData.imageUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, active: checked }))}
                />
                <Label className="text-xs">Active</Label>
              </div>
              <Button type="submit" className="w-full">{editingCollection ? 'Update' : 'Create'}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {collections.map(coll => (
          <Card key={coll.id} className="overflow-hidden rounded-sm">
            <div className="aspect-video bg-secondary overflow-hidden">
              <img 
                src={coll.imageUrl || 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=400'}
                alt={coll.name}
                className="h-full w-full object-cover"
              />
            </div>
            <CardContent className="p-4 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold">{coll.name}</h3>
                  <p className="text-xs text-muted-foreground">{coll.productCount} products</p>
                </div>
                <Badge variant={coll.active === "1" ? "default" : "secondary"} className="text-[10px]">
                  {coll.active === "1" ? 'Active' : 'Draft'}
                </Badge>
              </div>
              <div className="flex space-x-2">
                <Button variant="ghost" size="sm" className="text-xs h-8" onClick={() => handleEdit(coll)}>
                  <Edit2 className="h-3 w-3 mr-1" /> Edit
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-xs h-8 text-destructive hover:text-destructive">
                      <Trash2 className="h-3 w-3 mr-1" /> Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Collection</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure? Products in this collection will become uncategorized.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(coll.id)}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchOrders = async () => {
    try {
      const data = await (blink.db as any).orders.list({ orderBy: { createdAt: 'desc' } });
      setOrders(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      await (blink.db as any).orders.update(orderId, { status: newStatus });
      toast.success(`Order status updated to ${newStatus}`);
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <Check className="h-4 w-4 text-green-600" />;
      case 'shipped': return <Truck className="h-4 w-4 text-blue-600" />;
      case 'processing': return <Clock className="h-4 w-4 text-orange-600" />;
      case 'cancelled': return <X className="h-4 w-4 text-red-600" />;
      default: return <Package className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const filteredOrders = statusFilter === 'all' 
    ? orders 
    : orders.filter(o => o.status === statusFilter);

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-12 bg-secondary" /><div className="h-64 bg-secondary" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="font-serif text-2xl font-bold uppercase tracking-tight">Orders</h2>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Orders</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No orders found
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map(order => {
                const address = order.shippingAddress ? JSON.parse(order.shippingAddress) : {};
                return (
                  <TableRow key={order.id}>
                    <TableCell className="font-bold text-sm">#{order.id.slice(-8)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="text-xs">
                        <p className="font-medium">{address.firstName} {address.lastName}</p>
                        <p className="text-muted-foreground">{address.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-bold">${Number(order.totalAmount).toFixed(2)}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center space-x-2">
                        {getStatusIcon(order.status)}
                        <Badge variant="secondary" className="text-[10px]">{order.status}</Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => updateStatus(order.id, 'processing')}>
                            Mark Processing
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateStatus(order.id, 'shipped')}>
                            Mark Shipped
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateStatus(order.id, 'delivered')}>
                            Mark Delivered
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => updateStatus(order.id, 'cancelled')}
                          >
                            Cancel Order
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function AdminReturns() {
  const [returns, setReturns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReturns = async () => {
    try {
      const data = await (blink.db as any).returns.list({ orderBy: { createdAt: 'desc' } });
      const enriched = await Promise.all(
        data.map(async (ret: any) => {
          const orders = await (blink.db as any).orders.list({ where: { id: ret.orderId } });
          return { ...ret, order: orders[0] };
        })
      );
      setReturns(enriched);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, []);

  const updateStatus = async (returnId: string, newStatus: string) => {
    try {
      await (blink.db as any).returns.update(returnId, { status: newStatus });
      toast.success(`Return status updated to ${newStatus}`);
      fetchReturns();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-12 bg-secondary" /><div className="h-64 bg-secondary" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="font-serif text-2xl font-bold uppercase tracking-tight">Returns & Exchanges</h2>

      {returns.length === 0 ? (
        <div className="text-center py-20 border rounded-sm space-y-4">
          <RotateCcw className="h-12 w-12 mx-auto text-muted-foreground/30" />
          <p className="text-muted-foreground">No return requests yet.</p>
        </div>
      ) : (
        <div className="border rounded-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Return ID</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {returns.map(ret => (
                <TableRow key={ret.id}>
                  <TableCell className="font-bold text-sm">#{ret.id.slice(-8)}</TableCell>
                  <TableCell className="text-xs">
                    Order #{ret.orderId.slice(-8)}
                    {ret.order && (
                      <span className="text-muted-foreground ml-2">${Number(ret.order.totalAmount).toFixed(2)}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(ret.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-xs max-w-xs truncate">{ret.reason || 'No reason provided'}</TableCell>
                  <TableCell className="text-center">
                    <Badge 
                      variant="secondary" 
                      className={cn(
                        "text-[10px]",
                        ret.status === 'approved' && "bg-green-100 text-green-800",
                        ret.status === 'rejected' && "bg-red-100 text-red-800",
                        ret.status === 'processing' && "bg-orange-100 text-orange-800"
                      )}
                    >
                      {ret.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => updateStatus(ret.id, 'processing')}>
                          Mark Processing
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateStatus(ret.id, 'approved')}>
                          Approve Return
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => updateStatus(ret.id, 'rejected')}
                        >
                          Reject Return
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
