import React, { useEffect, useState } from 'react';
import { blink } from '@/lib/blink';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RotateCcw, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AdminReturns() {
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
                      <span className="text-muted-foreground ml-2">{Number(ret.order.totalAmount).toLocaleString()} ETB</span>
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
