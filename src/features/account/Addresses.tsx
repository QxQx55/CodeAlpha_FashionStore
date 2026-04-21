import React, { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Plus, 
  Trash2, 
  Edit2
} from 'lucide-react';
import { cn } from '@/lib/utils';
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

export function Addresses() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);
  const [formData, setFormData] = useState({
    label: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'United States',
    isDefault: false
  });

  useEffect(() => {
    if (user) {
      const stored = localStorage.getItem(`addresses_${user.id}`);
      if (stored) {
        setAddresses(JSON.parse(stored));
      }
    }
  }, [user]);

  const saveAddresses = (newAddresses: any[]) => {
    if (user) {
      localStorage.setItem(`addresses_${user.id}`, JSON.stringify(newAddresses));
      setAddresses(newAddresses);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingAddress) {
      const updated = addresses.map(addr => 
        addr.id === editingAddress.id ? { ...formData, id: addr.id } : addr
      );
      if (formData.isDefault) {
        updated.forEach(addr => {
          if (addr.id !== editingAddress.id) addr.isDefault = false;
        });
      }
      saveAddresses(updated);
      toast.success('Address updated');
    } else {
      const newAddress = { ...formData, id: Date.now().toString() };
      let updated = [...addresses, newAddress];
      if (formData.isDefault || addresses.length === 0) {
        updated = updated.map(addr => ({
          ...addr,
          isDefault: addr.id === newAddress.id
        }));
      }
      saveAddresses(updated);
      toast.success('Address added');
    }
    
    setIsDialogOpen(false);
    setEditingAddress(null);
    setFormData({
      label: '',
      firstName: '',
      lastName: '',
      address: '',
      city: '',
      postalCode: '',
      country: 'United States',
      isDefault: false
    });
  };

  const handleEdit = (address: any) => {
    setEditingAddress(address);
    setFormData(address);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    const updated = addresses.filter(addr => addr.id !== id);
    if (updated.length > 0 && !updated.some(a => a.isDefault)) {
      updated[0].isDefault = true;
    }
    saveAddresses(updated);
    toast.success('Address removed');
  };

  const setAsDefault = (id: string) => {
    const updated = addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id
    }));
    saveAddresses(updated);
    toast.success('Default address updated');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-sm font-bold uppercase tracking-widest">Saved Addresses</h2>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingAddress(null);
            setFormData({
              label: '',
              firstName: '',
              lastName: '',
              address: '',
              city: '',
              postalCode: '',
              country: 'United States',
              isDefault: false
            });
          }
        }}>
          <DialogTrigger asChild>
            <Button size="sm" className="text-xs uppercase tracking-widest">
              <Plus className="mr-2 h-4 w-4" /> Add Address
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingAddress ? 'Edit Address' : 'Add New Address'}</DialogTitle>
              <DialogDescription>
                {editingAddress ? 'Update your address details below.' : 'Enter your shipping address details.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="label" className="text-xs uppercase tracking-widest">Label (e.g., Home, Work)</Label>
                <Input 
                  id="label" 
                  value={formData.label}
                  onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                  placeholder="Home"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-xs uppercase tracking-widest">First Name</Label>
                  <Input 
                    id="firstName" 
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-xs uppercase tracking-widest">Last Name</Label>
                  <Input 
                    id="lastName" 
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address" className="text-xs uppercase tracking-widest">Street Address</Label>
                <Input 
                  id="address" 
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-xs uppercase tracking-widest">City</Label>
                  <Input 
                    id="city" 
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode" className="text-xs uppercase tracking-widest">Postal Code</Label>
                  <Input 
                    id="postalCode" 
                    value={formData.postalCode}
                    onChange={(e) => setFormData(prev => ({ ...prev, postalCode: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
                  className="h-4 w-4"
                />
                <Label htmlFor="isDefault" className="text-xs">Set as default address</Label>
              </div>
              <Button type="submit" className="w-full">
                {editingAddress ? 'Update Address' : 'Save Address'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {addresses.length === 0 ? (
        <div className="text-center py-20 border rounded-sm space-y-4">
          <MapPin className="h-12 w-12 mx-auto text-muted-foreground/30" />
          <p className="text-muted-foreground">No addresses saved yet.</p>
          <p className="text-xs text-muted-foreground">Add an address for faster checkout.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <div 
              key={address.id} 
              className={cn(
                "p-6 border rounded-sm relative",
                address.isDefault && "border-accent"
              )}
            >
              {address.isDefault && (
                <Badge className="absolute top-4 right-4 text-[10px]">Default</Badge>
              )}
              <div className="space-y-2">
                <h3 className="font-bold text-sm">{address.label}</h3>
                <p className="text-sm">{address.firstName} {address.lastName}</p>
                <p className="text-xs text-muted-foreground">{address.address}</p>
                <p className="text-xs text-muted-foreground">{address.city}, {address.postalCode}</p>
                <p className="text-xs text-muted-foreground">{address.country}</p>
              </div>
              <div className="flex space-x-2 mt-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-[10px] h-8"
                  onClick={() => handleEdit(address)}
                >
                  <Edit2 className="h-3 w-3 mr-1" /> Edit
                </Button>
                {!address.isDefault && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-[10px] h-8"
                    onClick={() => setAsDefault(address.id)}
                  >
                    Set Default
                  </Button>
                )}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-[10px] h-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3 mr-1" /> Remove
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remove Address</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to remove this address?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(address.id)}>Remove</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
