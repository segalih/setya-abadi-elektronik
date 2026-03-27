import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Search, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  MoreVertical, 
  Loader2,
  CheckCircle2,
  XCircle,
   ExternalLink,
   ArrowLeft,
   Package,
   CreditCard,
   Hash,
   ChevronLeft,
   ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import api from '@/services/api';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent } from '@/components/ui/dialog';

export default function BackofficeCustomers() {
   const navigate = useNavigate();
  const [customers, setCustomers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
   const [page, setPage] = useState(1);
   const [totalPages, setTotalPages] = useState(1);
   const [totalRecords, setTotalRecords] = useState(0);

   const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
   const [customerDetail, setCustomerDetail] = useState<any>(null);
   const [isDetailLoading, setIsDetailLoading] = useState(false);

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/backoffice/customers', {
         params: { search: searchTerm, page }
      });
      setCustomers(response.data.data);
       setTotalPages(response.data.last_page);
       setTotalRecords(response.data.total);
    } catch (err) {
      console.error('Failed to fetch customers', err);
    } finally {
      setIsLoading(false);
    }
  };

   const fetchCustomerDetail = async (id: number) => {
      setIsDetailLoading(true);
      setSelectedCustomerId(id);
      try {
         const response = await api.get(`/backoffice/customers/${id}`);
         setCustomerDetail(response.data);
      } catch (err) {
         console.error('Failed to fetch customer detail', err);
      } finally {
         setIsDetailLoading(false);
      }
   };

  useEffect(() => {
    fetchCustomers();
  }, [page]);

   const handleSearch = (e: React.FormEvent) => {
      e.preventDefault();
      setPage(1);
      fetchCustomers();
   };

  return (
     <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
              <h1 className="text-3xl font-black italic tracking-tighter">Database Pelanggan</h1>
           <p className="text-muted-foreground font-medium">Kelola data profil dan histori interaksi pelanggan Setya Abadi.</p>
        </div>
           <Button size="lg" className="rounded-xl shadow-lg shadow-primary/20 bg-primary h-12 text-white font-black uppercase tracking-widest text-[10px]">
              Ekspor Data (.xlsx)
        </Button>
      </div>

        <Card className="border-none shadow-sm overflow-hidden rounded-2xl">
         <CardContent className="p-4 flex items-center gap-4">
              <form onSubmit={handleSearch} className="relative flex-1 group">
               <Search className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
               <Input 
                 placeholder="Cari Nama, Email, atau No. Telepon..." 
                    className="pl-12 h-12 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-primary/20 transition-all font-medium"
                 value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
               />
              </form>
              <Button onClick={fetchCustomers} className="h-12 px-8 rounded-xl bg-slate-900 border-none text-white hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 font-black uppercase tracking-widest text-[10px]">
                 {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search Query'}
            </Button>
         </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         <AnimatePresence>
            {isLoading ? (
                 <div className="col-span-full py-24 flex justify-center flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-primary opacity-20" />
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">Syncing Database...</p>
                 </div>
            ) : customers.length > 0 ? (
               customers.map((customer, i) => (
                  <motion.div
                    key={customer.id}
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                     <Card className="border-none shadow-sm hover:shadow-2xl transition-all duration-300 group overflow-hidden rounded-3xl cursor-pointer" onClick={() => fetchCustomerDetail(customer.id)}>
                        <div className="h-2 w-full bg-gradient-to-r from-primary to-slate-900" />
                        <CardContent className="p-8">
                           <div className="flex items-start justify-between mb-8">
                              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl font-black text-slate-400 group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-inner">
                                 {customer.name.charAt(0)}
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                 {customer.email_verified_at ? (
                                    <Badge className="bg-emerald-500 text-white border-none font-black text-[8px] px-2 py-0.5 rounded-full ring-4 ring-emerald-50">VERIFIED</Badge>
                                 ) : (
                                       <Badge variant="secondary" className="bg-slate-100 text-slate-400 font-black text-[8px] px-2 py-0.5 rounded-full">UNVERIFIED</Badge>
                                 )}
                                 <div className="p-2 text-slate-300 group-hover:text-primary transition-colors">
                                    <MoreVertical className="w-5 h-5" />
                                 </div>
                              </div>
                           </div>

                           <div className="space-y-6">
                              <div>
                                 <h3 className="font-black text-xl leading-tight group-hover:text-primary transition-colors tracking-tight">{customer.name}</h3>
                                 <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2 font-bold opacity-70">
                                    <Mail className="w-4 h-4 text-primary" />
                                    {customer.email}
                                 </div>
                              </div>

                              <div className="grid grid-cols-1 gap-3 border-t border-slate-50 pt-6">
                                 <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
                                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                                       <Phone className="w-4 h-4 shrink-0" />
                                    </div>
                                    {customer.phone || 'No Contact Info'}
                                 </div>
                                 <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
                                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                                       <MapPin className="w-4 h-4 shrink-0" />
                                    </div>
                                    <span className="truncate">{customer.city ? `${customer.city}, ${customer.province}` : 'No Registered Address'}</span>
                                 </div>
                              </div>
                           </div>

                           <div className="mt-8 pt-8 border-t border-slate-50 flex items-center justify-between">
                              <div className="flex flex-col">
                                 <span className="text-[9px] font-black uppercase text-slate-300 tracking-[0.15em] mb-1 leading-none">Activity Hub</span>
                                 <span className="font-black text-slate-900 group-hover:text-primary transition-colors">{customer.orders_count || 0} Project Filings</span>
                              </div>
                              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-primary group-hover:text-white transition-all">
                                 <ArrowLeft className="w-4 h-4 rotate-180" />
                              </div>
                           </div>
                        </CardContent>
                     </Card>
                  </motion.div>
               ))
            ) : (
               <div className="col-span-full py-24 text-center">
                          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                             <Users className="w-10 h-10 text-slate-200" />
                          </div>
                          <h3 className="font-black text-slate-800">Database Kosong</h3>
                          <p className="text-xs text-muted-foreground font-medium mt-2">Belum ada pelanggan terdaftar dalam database.</p>
               </div>
            )}
         </AnimatePresence>
      </div>

        {/* Pagination Controls */}
        <div className="p-8 bg-white border-2 border-slate-100 rounded-[2rem] flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
           <div className="text-xs font-black uppercase tracking-widest text-slate-400">
              Showing <span className="text-slate-900">{customers.length}</span> of <span className="text-slate-900">{totalRecords}</span> members
           </div>
           <div className="flex items-center gap-3">
              <Button
                 variant="outline"
                 size="icon"
                 disabled={page === 1}
                 onClick={() => setPage(p => p - 1)}
                 className="rounded-2xl border-2 h-12 w-12 hover:bg-primary hover:text-white transition-all"
              >
                 <ChevronLeft className="w-5 h-5" />
              </Button>
              <div className="px-6 h-12 bg-slate-50 flex items-center rounded-2xl border-2 border-slate-100 font-black text-xs tracking-widest">
                 PAGE {page} / {totalPages}
              </div>
              <Button
                 variant="outline"
                 size="icon"
                 disabled={page === totalPages}
                 onClick={() => setPage(p => p + 1)}
                 className="rounded-2xl border-2 h-12 w-12 hover:bg-primary hover:text-white transition-all"
              >
                 <ChevronRight className="w-5 h-5" />
              </Button>
           </div>
        </div>

        {/* Detail Dialog */}
        <Dialog open={selectedCustomerId !== null} onOpenChange={(open: boolean) => !open && setSelectedCustomerId(null)}>
           <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-4xl border-none shadow-2xl bg-slate-50/50">
              {isDetailLoading ? (
                 <div className="p-24 flex items-center justify-center flex-col gap-4">
                    <Loader2 className="w-12 h-12 animate-spin text-primary opacity-20" />
                    <p className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">Retrieving Full Profile...</p>
                 </div>
              ) : customerDetail && (
                 <div className="flex flex-col h-full max-h-[85vh]">
                    {/* Hero Header */}
                    <div className="p-10 bg-slate-900 text-white relative">
                       <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
                          <Users className="w-48 h-48 -mr-16 -mt-16" />
                       </div>
                       <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
                           <div className="w-12 h-12 rounded-full bg-linear-to-r from-emerald-50 to-teal-50 border border-emerald-100/50 flex items-center justify-center shrink-0">
                             {customerDetail.name.charAt(0)}
                          </div>
                          <div className="space-y-4 pt-2">
                             <div>
                                <h2 className="text-3xl font-black tracking-tight">{customerDetail.name}</h2>
                                <div className="flex flex-wrap gap-4 mt-3">
                                   <div className="flex items-center gap-2 text-sm font-bold text-slate-400 bg-white/5 py-1.5 px-3 rounded-full border border-white/10">
                                      <Mail className="w-4 h-4 text-primary" />
                                      {customerDetail.email}
                                   </div>
                                   <div className="flex items-center gap-2 text-sm font-bold text-slate-400 bg-white/5 py-1.5 px-3 rounded-full border border-white/10">
                                      <Phone className="w-4 h-4 text-primary" />
                                      {customerDetail.phone || 'No Phone'}
                                   </div>
                                   <div className="flex items-center gap-2 text-sm font-bold text-slate-400 bg-white/5 py-1.5 px-3 rounded-full border border-white/10">
                                      <Calendar className="w-4 h-4 text-primary" />
                                      Registered {new Date(customerDetail.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
                                   </div>
                                </div>
                             </div>
                          </div>
                       </div>
                    </div>

                    {/* Content Tabs area (Simulated with simple flex) */}
                    <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar bg-slate-50/50">
                       <div className="grid md:grid-cols-3 gap-8">
                          {/* Info Column */}
                          <div className="md:col-span-1 space-y-8">
                             <section className="space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Registered Address</h4>
                                <div className="bg-white rounded-4xl shadow-sm p-6 sm:p-10 relative overflow-hidden">
                                   
                                      <div className="flex gap-4">
                                         <MapPin className="w-5 h-5 text-primary shrink-0 mt-1" />
                                         <div className="text-sm font-medium text-slate-600 leading-relaxed">
                                            {customerDetail.address?.full_address || 'No specific address detail.'}
                                            <br />
                                            <span className="font-black text-slate-900">{customerDetail.address?.city}, {customerDetail.address?.province}</span>
                                            <br />
                                            {customerDetail.address?.postal_code}
                                         </div>
                                      </div>
                                   </div>
                             </section>

                             <section className="space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Business Stats</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                   <div className="p-4 bg-white rounded-2xl shadow-sm space-y-1">
                                      <span className="text-[9px] font-black uppercase text-slate-400">Total Filings</span>
                                      <div className="text-xl font-black text-primary">{customerDetail.orders_count || 0}</div>
                                   </div>
                                   <div className="p-4 bg-white rounded-2xl shadow-sm space-y-1">
                                      <span className="text-[9px] font-black uppercase text-slate-400">Total Spent</span>
                                      <div className="text-xl font-black text-emerald-600">
                                         {customerDetail.orders?.reduce((acc: number, curr: any) => acc + (curr.total_price || 0), 0)?.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })}
                                      </div>
                                   </div>
                                </div>
                             </section>
                          </div>

                          {/* Order History Column */}
                          <div className="md:col-span-2 space-y-4">
                             <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Engagement History</h4>
                             <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-white">
                                <div className="overflow-x-auto">
                                   <table className="w-full text-left">
                                      <thead className="bg-slate-50 border-b text-[9px] font-black uppercase tracking-widest text-slate-400">
                                         <tr>
                                            <th className="px-6 py-4">Order Ref</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4">Date</th>
                                            <th className="px-6 py-4 text-right">Price</th>
                                         </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-100">
                                         {customerDetail.orders?.length > 0 ? customerDetail.orders.map((order: any) => (
                                            <tr key={order.id} className="hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => navigate(`/backoffice/orders/${order.id}`)}>
                                               <td className="px-6 py-4">
                                                  <div className="flex items-center gap-2">
                                                     <Hash className="w-3 h-3 text-primary" />
                                                     <span className="font-bold text-xs text-slate-800 tracking-tight">{order.order_number || `ORD-${order.id}`}</span>
                                                  </div>
                                                  <div className="text-[10px] text-muted-foreground font-medium mt-0.5">{order.product_type}</div>
                                               </td>
                                               <td className="px-6 py-4">
                                                  <Badge variant="outline" className={cn(
                                                     "text-[8px] font-black uppercase px-2 py-0 rounded-md",
                                                     order.status === 'pending' ? "border-amber-200 text-amber-600" : "border-emerald-200 text-emerald-600"
                                                  )}>
                                                     {order.status}
                                                  </Badge>
                                               </td>
                                               <td className="px-6 py-4 text-[10px] font-bold text-slate-500">
                                                  {new Date(order.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                                               </td>
                                               <td className="px-6 py-4 text-right font-black text-xs text-slate-700">
                                                  {order.total_price?.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })}
                                               </td>
                                            </tr>
                                         )) : (
                                            <tr>
                                               <td colSpan={4} className="px-6 py-12 text-center text-xs text-muted-foreground font-medium italic">Customer yet to file their first project.</td>
                                            </tr>
                                         )}
                                      </tbody>
                                   </table>
                                </div>
                             </Card>
                          </div>
                       </div>
                    </div>
                 </div>
              )}
           </DialogContent>
        </Dialog>
    </div>
  );
}
