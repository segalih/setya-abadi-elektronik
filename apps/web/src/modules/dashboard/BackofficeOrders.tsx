import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  ExternalLink, 
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  Package,
  CheckCircle2,
  Clock,
  AlertCircle,
  Truck,
  Box,
   Eye,
   RefreshCw
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import MotionPage from '@/components/shared/MotionWrapper';
import { Badge } from '@/components/ui/badge';
import api from '@/services/api';
import { cn, formatCurrency } from '@/lib/utils';

export default function BackofficeOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
   const [paymentFilter, setPaymentFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
   const [totalRecords, setTotalRecords] = useState(0);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/backoffice/orders', {
        params: { 
          page, 
          search: searchTerm, 
            status: statusFilter === 'all' ? undefined : statusFilter,
            payment_status: paymentFilter === 'all' ? undefined : paymentFilter
        }
      });
      setOrders(response.data.data);
      setTotalPages(response.data.last_page);
       setTotalRecords(response.data.total);
    } catch (err) {
      console.error('Failed to fetch backoffice orders', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter, paymentFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchOrders();
  };

  const getStatusBadge = (status: string) => {
    const variants: any = {
      pending: "bg-amber-100 text-amber-700 border-amber-200",
      reviewed: "bg-blue-100 text-blue-700 border-blue-200",
      in_production: "bg-primary/20 text-primary border-primary/30",
      ready_to_ship: "bg-secondary/20 text-secondary border-secondary/30",
      shipped: "bg-slate-100 text-slate-700 border-slate-200",
    };
    return <Badge className={cn("font-black uppercase text-[10px] px-3", variants[status])}>{status}</Badge>;
  };

  return (
    <div className="space-y-8  ">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h1 className="text-3xl font-black">Manajemen Pesanan</h1>
           <p className="text-muted-foreground font-medium">Pantau dan proses semua pesanan PCB pelanggan.</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="p-3 bg-white border rounded-xl flex items-center gap-4 text-xs font-bold shadow-sm">
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-amber-500" />
                 <span>{orders.filter(o => o.status === 'pending').length} Baru</span>
              </div>
              <div className="w-px h-4 bg-slate-200" />
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-primary" />
                 <span>{orders.filter(o => o.status === 'in_production').length} Produksi</span>
              </div>
           </div>
        </div>
      </div>

      {/* Filters & Search */}
      <Card className="border-none shadow-sm overflow-hidden">
         <CardContent className="p-4 flex flex-col md:flex-row items-center gap-4">
            <form onSubmit={handleSearch} className="relative flex-1 group w-full">
               <Search className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
               <Input 
                 placeholder="Cari Order ID atau Nama Pelanggan..." 
                 className="pl-12 h-12 rounded-md bg-slate-50 border-transparent focus:bg-white focus:border-primary/20 transition-none"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
            </form>
              <div className="flex items-center gap-2 w-full md:w-auto mt-4 md:mt-0">
                 <div className="relative w-full md:min-w-[140px]">
                    <Filter className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <select
                       className="w-full h-12 pl-10 pr-4 bg-slate-50 border-none rounded-md text-sm font-bold text-slate-700 focus:ring-2 focus:ring-primary/20"
                       value={statusFilter}
                       onChange={(e) => setStatusFilter(e.target.value)}
                    >
                       <option value="all">Status</option>
                       <option value="pending">Pending</option>
                       <option value="reviewed">Ditinjau</option>
                       <option value="in_production">Produksi</option>
                       <option value="ready_to_ship">Siap Kirim</option>
                       <option value="shipped">Dikirim</option>
                    </select>
                 </div>
                 <div className="relative w-full md:min-w-[140px]">
                    <Clock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <select
                       className="w-full h-12 pl-10 pr-4 bg-slate-50 border-none rounded-md text-sm font-bold text-slate-700 focus:ring-2 focus:ring-primary/20"
                       value={paymentFilter}
                       onChange={(e) => setPaymentFilter(e.target.value)}
                    >
                       <option value="all">Bayar</option>
                       <option value="waiting">Waiting</option>
                       <option value="success">Success</option>
                       <option value="expired">Expired</option>
                    </select>
                 </div>
                 <Button
                    size="icon"
                    onClick={fetchOrders}
                    className="h-12 w-12 shrink-0 rounded-md bg-white border-2 border-slate-200 text-slate-400 hover:text-primary hover:border-primary/20 transition-all shadow-none hover:bg-white-100"
                 >
                    <RefreshCw className={cn("w-6 h-6", isLoading && "animate-spin")} />
                 </Button>
              </div>
         </CardContent>
      </Card>

      {/* Orders Table */}
      <Card className="border-none shadow-sm overflow-hidden">
         <CardContent className="p-0">
            {isLoading ? (
               <div className="p-24 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : orders.length > 0 ? (
               <div className="overflow-x-auto pb-4">
                  <table className="w-full text-left whitespace-nowrap">
                     <thead>
                        <tr className="bg-slate-50/50 border-b text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                           <th className="p-6">ID Pesanan</th>
                                <th className="p-6 text-center">Tgl Order</th>
                                <th className="p-6 text-center">Tgl Bayar</th>
                           <th className="p-6">Pelanggan</th>
                           <th className="p-6">Produk / Specs</th>
                                <th className="p-6 text-right">Total Tagihan</th>
                           <th className="p-6">Status</th>
                           <th className="p-6 text-right">Aksi</th>
                        </tr>
                     </thead>
                     <tbody className="text-sm">
                        {orders.map((order, i) => (
                           <motion.tr 
                             key={order.id}
                             initial={{ opacity: 0, y: 10 }}
                             animate={{ opacity: 1, y: 0 }}
                             transition={{ delay: i * 0.05 }}
                             onClick={() => navigate(`/backoffice/orders/${order.id}`)}
                             className={cn(
                               "border-b last:border-0 hover:bg-slate-50/80 transition-none cursor-pointer group",
                               order.status === 'pending' && "bg-amber-50/20"
                             )}
                           >
                              <td className="p-6">
                                 <div className="font-black text-slate-900 group-hover:text-primary transition-colors">#{order.order_number}</div>
                              </td>
                              <td className="p-6 text-center">
                                 <div className="text-[11px] font-black text-slate-600 uppercase">{new Date(order.created_at).toLocaleDateString()}</div>
                                 <div className="text-[9px] font-bold text-slate-400">{new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                              </td>
                              <td className="p-6 text-center">
                                 {order.payment_at ? (
                                    <>
                                       <div className="text-[11px] font-black text-emerald-600 uppercase">{new Date(order.payment_at).toLocaleDateString()}</div>
                                       <div className="text-[9px] font-bold text-emerald-400">{new Date(order.payment_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                    </>
                                 ) : (
                                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-tighter">— BELUM —</span>
                                 )}
                              </td>
                              <td className="p-6">
                                 <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-black text-slate-500">
                                       {order.user?.name.charAt(0)}
                                    </div>
                                    <div className="min-w-0">
                                       <div className="font-bold truncate max-w-[120px]">{order.user?.name}</div>
                                       <div className="text-[10px] text-muted-foreground">{order.user?.email}</div>
                                    </div>
                                 </div>
                              </td>
                              <td className="p-6">
                                 <div className="font-bold text-slate-700">{order.product_type}</div>
                                 <div className="text-[10px] text-muted-foreground font-medium">
                                    {order.detail?.data_json?.width}x{order.detail?.data_json?.height}cm • {order.detail?.data_json?.layers}L
                                 </div>
                              </td>
                              <td className="p-6">
                                 <div className="font-black text-slate-900">{formatCurrency(order.total_price || 0)}</div>
                                 <Badge variant="outline" className={cn(
                                   "text-[9px] font-black uppercase tracking-tighter mt-1",
                                   order.payment_status === 'success' ? "text-emerald-500 border-emerald-100" : "text-amber-500 border-amber-100"
                                 )}>
                                    Pay: {order.payment_status}
                                 </Badge>
                              </td>
                              <td className="p-6">
                                 {getStatusBadge(order.status)}
                              </td>
                              <td className="p-6 text-right">
                                 <Link to={`/backoffice/orders/${order.id}`}>
                                    <Button variant="ghost" size="icon" className="rounded-xl hover:bg-primary/10 hover:text-primary">
                                       <Eye className="w-5 h-5" />
                                    </Button>
                                 </Link>
                                 <Button variant="ghost" size="icon" className="rounded-xl hover:bg-slate-100">
                                    <MoreVertical className="w-5 h-5" />
                                 </Button>
                              </td>
                           </motion.tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            ) : (
               <div className="p-24 text-center">
                  <Package className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground font-medium">Tidak ada pesanan yang sesuai kriteria.</p>
               </div>
            )}
            
            {/* Pagination */}
            <div className="p-6 bg-slate-50/50 border-t flex items-center justify-between">
                 <span className="text-xs text-muted-foreground font-bold">Showing {orders.length} of {totalRecords} overall records</span>
               <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    className="rounded-xl border-2 h-10 w-10"
                  >
                     <ChevronLeft className="w-5 h-5" />
                  </Button>
                  <div className="px-4 text-xs font-black bg-white h-10 flex items-center rounded-xl border-2">
                     PAGE {page} / {totalPages}
                  </div>
                  <Button 
                    variant="outline" 
                    size="icon"
                    disabled={page === totalPages}
                    onClick={() => setPage(p => p + 1)}
                    className="rounded-xl border-2 h-10 w-10"
                  >
                     <ChevronRight className="w-5 h-5" />
                  </Button>
               </div>
            </div>
         </CardContent>
      </Card>
    </div>
  );
}
