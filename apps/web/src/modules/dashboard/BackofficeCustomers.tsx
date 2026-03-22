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
  ExternalLink
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import api from '@/services/api';
import { cn } from '@/lib/utils';

export default function BackofficeCustomers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/backoffice/customers', {
        params: { search: searchTerm }
      });
      setCustomers(response.data.data);
    } catch (err) {
      console.error('Failed to fetch customers', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return (
    <div className="space-y-8  ">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h1 className="text-3xl font-black">Database Pelanggan</h1>
           <p className="text-muted-foreground font-medium">Kelola data profil dan histori interaksi pelanggan Setya Abadi.</p>
        </div>
        <Button size="lg" className="rounded-xl shadow-lg shadow-primary/20 bg-primary h-12">
            Ekspor Data (CSV)
        </Button>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
         <CardContent className="p-4 flex items-center gap-4">
            <div className="relative flex-1 group">
               <Search className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
               <Input 
                 placeholder="Cari Nama, Email, atau No. Telepon..." 
                 className="pl-12 h-12 rounded-md bg-slate-50 border-transparent focus:bg-white focus:border-primary/20 transition-none font-medium"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && fetchCustomers()}
               />
            </div>
            <Button onClick={fetchCustomers} className="h-12 px-6 rounded-md bg-white border-2 text-primary hover:bg-primary hover:text-white transition-none shadow-none font-bold">
               Cari Database
            </Button>
         </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         <AnimatePresence>
            {isLoading ? (
               <div className="col-span-full py-24 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : customers.length > 0 ? (
               customers.map((customer, i) => (
                  <motion.div
                    key={customer.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                  >
                     <Card className="border-none shadow-sm hover:shadow-xl transition-none  group overflow-hidden">
                        <div className="h-2 w-full bg-gradient-to-r from-primary to-secondary" />
                        <CardContent className="p-6">
                           <div className="flex items-start justify-between mb-6">
                              <div className="w-14 h-14 rounded-md bg-slate-100 flex items-center justify-center text-xl font-black text-slate-500 group-hover:bg-primary group-hover:text-white transition-none">
                                 {customer.name.charAt(0)}
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                 {customer.email_verified_at ? (
                                    <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 font-black text-[9px] px-2">VERIFIED</Badge>
                                 ) : (
                                    <Badge variant="secondary" className="bg-slate-100 text-slate-400 font-black text-[9px] px-2">UNVERIFIED</Badge>
                                 )}
                                 <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                                    <MoreVertical className="w-4 h-4" />
                                 </Button>
                              </div>
                           </div>

                           <div className="space-y-4">
                              <div>
                                 <h3 className="font-black text-lg leading-tight group-hover:text-primary transition-colors">{customer.name}</h3>
                                 <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1 font-medium">
                                    <Mail className="w-3.5 h-3.5" />
                                    {customer.email}
                                 </div>
                              </div>

                              <div className="grid grid-cols-1 gap-2 border-t pt-4">
                                 <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
                                    <Phone className="w-4 h-4 text-muted-foreground" />
                                    {customer.phone || 'No phone set'}
                                 </div>
                                 <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
                                    <MapPin className="w-4 h-4 text-muted-foreground" />
                                    {customer.city ? `${customer.city}, ${customer.province}` : 'No address set'}
                                 </div>
                                 <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
                                    <Calendar className="w-4 h-4 text-muted-foreground" />
                                    Joined {new Date(customer.created_at).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}
                                 </div>
                              </div>
                           </div>

                           <div className="mt-6 pt-6 border-t flex items-center justify-between">
                              <div className="flex flex-col">
                                 <span className="text-[9px] font-black uppercase text-muted-foreground">Total Orders</span>
                                 <span className="font-black text-primary">{customer.orders_count || 0} Projects</span>
                              </div>
                              <Button variant="outline" className="text-[10px] font-black uppercase border-2 h-9 px-4 rounded-xl group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-none">
                                 View Profile
                              </Button>
                           </div>
                        </CardContent>
                     </Card>
                  </motion.div>
               ))
            ) : (
               <div className="col-span-full py-24 text-center">
                  <Users className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground font-medium">Belum ada pelanggan terdaftar dalam database.</p>
               </div>
            )}
         </AnimatePresence>
      </div>
    </div>
  );
}
