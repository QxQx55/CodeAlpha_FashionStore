import React, { useEffect, useState } from 'react';
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
  Trash2
} from 'lucide-react';
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
import { Card, CardContent } from '@/components/ui/card';

export function AdminCollections() {
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
      const data = await (storeApi.db as any).collections.list();
      const enriched = await Promise.all(
        data.map(async (c: any) => {
          const products = await (storeApi.db as any).products.list({ where: { collectionId: c.id } });
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
        await (storeApi.db as any).collections.update(editingCollection.id, collData);
        toast.success('Collection updated');
      } else {
        await (storeApi.db as any).collections.create({ ...collData, userId: 'admin' });
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
      await (storeApi.db as any).collections.delete(id);
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
                src={coll.imageUrl || '/images/products/accessories-flatlay.jpg'}
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
