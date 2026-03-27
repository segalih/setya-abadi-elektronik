import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Package, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Download, 
  CreditCard, 
  History, 
  Info, 
  ChevronRight, 
  Loader2, 
  MapPin,
  ClipboardCheck,
  Truck,
  Box,
  AlertTriangle,
  Upload,
  Eye,
  FileSearch,
  ChevronDown,
  User,
  Mail,
  Phone,
  Layout
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import MotionPage from '@/components/shared/MotionWrapper';
import { cn } from '@/lib/utils';
import api from '@/services/api';

export default function BackofficeOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  
  // Status Update State
  const [newStatus, setNewStatus] = useState('');
  const [note, setNote] = useState('');
  const [additionalPrice, setAdditionalPrice] = useState('');
  const [files, setFiles] = useState<FileList | null>(null);

  const fetchOrder = async () => {
    try {
      const response = await api.get(`/backoffice/orders/${id}`);
      setOrder(response.data);
      setNewStatus(response.data.status);
      
      
      try {
        const logsResp = await api.get(`/backoffice/orders/${id}/audit-logs`);
        setAuditLogs(logsResp.data.data || []);
      } catch (err) {
        console.warn('Audit logs not available');
      }
    } catch (error) {
      console.error('Failed to fetch order details', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData && e.clipboardData.files.length > 0) {
        const pastedFiles = Array.from(e.clipboardData.files).filter(f => f.type.startsWith('image/'));
        if (pastedFiles.length > 0) {
          const dataTransfer = new DataTransfer();
          pastedFiles.forEach(f => dataTransfer.items.add(f));
          if (files) {
            Array.from(files).forEach(f => dataTransfer.items.add(f));
          }
          setFiles(dataTransfer.files);
          addToast({ title: "Gambar Tersalin", description: `${pastedFiles.length} gambar berhasil ditambahkan.` });
        }
      }
    };
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [files, addToast]);

  const getNextStatusInfo = (current: string) => {
    switch (current) {
      case 'pending': return { status: 'reviewed', label: 'Tinjau Pesanan' };
      case 'reviewed': return { status: 'in_production', label: 'Mulai Produksi' };
      case 'in_production': return { status: 'ready_to_ship', label: 'Selesai Produksi & Kemas' };
      case 'ready_to_ship': return { status: 'shipped', label: 'Kirim Pesanan' };
      default: return null;
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextInfo = order ? getNextStatusInfo(order.status) : null;
    if (!nextInfo) return;

    const formData = new FormData();
    formData.append('status', nextInfo.status);
    formData.append('note', note);
    if (nextInfo.status === 'reviewed' && additionalPrice) {
      formData.append('additional_price', additionalPrice.toString());
    }
    
    if (files) {
      for (let i = 0; i < files.length; i++) {
        formData.append('images[]', files[i]);
      }
    }

    setIsActionLoading(true);
    try {
      await api.post(`/backoffice/orders/${id}/status`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setNote('');
      fetchOrder();
      addToast({
        title: "Sukses",
        description: "Status pesanan berhasil diperbarui!",
        variant: "success",
      });
    } catch (error: any) {
      addToast({
        title: "Gagal",
        description: error.response?.data?.message || 'Gagal memperbarui status',
        variant: "destructive",
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!order) return <div className="min-h-screen flex items-center justify-center bg-slate-50 font-bold">Pesanan tidak ditemukan.</div>;

  const steps = [
    { key: 'pending', label: 'Diterima', icon: FileText },
    { key: 'reviewed', label: 'Ditinjau', icon: ClipboardCheck },
    { key: 'in_production', label: 'Produksi', icon: Package },
    { key: 'ready_to_ship', label: 'Kemas', icon: Box },
    { key: 'shipped', label: 'Dikirim', icon: Truck },
    { key: 'cancelled', label: 'Dibatalkan', icon: AlertCircle },
  ];

  const getMaskingLabel = (val: string) => {
    const map: Record<string, string> = {
      ya_merah: 'Ya, merah', ya_biru: 'Ya, biru', ya_hijau: 'Ya, hijau',
      ya_hitam: 'Ya, hitam', ya_putih: 'Ya, putih', tidak: 'Tidak',
      green: 'Hijau', red: 'Merah', blue: 'Biru', black: 'Hitam', white: 'Putih', none: 'Tidak',
    };
    return map[val] || val || '-';
  };

  const currentStepIndex = steps.findIndex(s => s.key === order.status);

  return (
    <MotionPage>
      <div className="space-y-8">
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
           <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate(-1)} className="rounded-xl h-12 w-12 p-0 hover:bg-white border-2 border-transparent hover:border-slate-100">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <div className="flex items-center gap-3">
                   <h1 className="text-2xl font-black">{order.order_number}</h1>
                   <Badge variant="outline" className="font-black text-[10px] uppercase border-primary/20 text-primary bg-primary/5">
                      {order.status}
                   </Badge>
                </div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                   {order.product_type} • Dipesan: {new Date(order.created_at).toLocaleString('id-ID')}
                </p>
              </div>
           </div>
           <div className="flex gap-2">
              <Button variant="outline" className="text-xs font-black uppercase tracking-tighter" onClick={() => window.open(api.defaults.baseURL?.replace('/api', '') + '/storage/' + order.detail?.file_path)}>
                 <Download className="w-4 h-4 mr-2" /> Download Gerber
              </Button>
           </div>
        </header>

           {/* Progress Timeline */}
           <Card className="border-none shadow-sm overflow-hidden mb-8">
             <CardContent className="p-4 sm:p-8 overflow-x-auto custom-scrollbar">
                <div className="relative flex justify-between items-start min-w-[500px] pb-4 px-2">
                   {/* Background Line */}
                   <div className="absolute top-6 left-0 w-full h-1 bg-slate-100 rounded-full z-0" />
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: order.status === 'cancelled' || order.status === 'expired' ? '100%' : `${(currentStepIndex / (steps.filter(s => s.key !== 'cancelled').length - 1)) * 100}%` }}
                     transition={{ duration: 1.5, ease: "circOut" }}
                     className={cn("absolute top-6 left-0 h-1 rounded-full z-10 shadow-sm transition-colors", order.status === 'cancelled' || order.status === 'expired' ? "bg-red-500" : "bg-primary")} 
                   />

                   {steps.filter(s => s.key !== 'cancelled').map((step, i) => {
                     const Icon = step.icon;
                     const isCancelled = order.status === 'cancelled' || order.status === 'expired';
                     const isPast = isCancelled ? true : i < currentStepIndex;
                     const isCurrent = isCancelled ? false : i === currentStepIndex;
                     
                     return (
                       <div key={step.key} className="relative z-20 flex flex-col items-center gap-3 p-2 rounded-xl">
                          <motion.div 
                            initial={false}
                            animate={isCurrent ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                            transition={isCurrent ? { duration: 1.5, repeat: Infinity, ease: 'easeInOut' } : {}}
                            className={cn(
                              "w-12 h-12 rounded-full border-4 flex items-center justify-center transition-colors shadow-sm bg-white",
                              isPast && !isCancelled ? "border-primary text-primary" : 
                              isPast && isCancelled ? "border-red-500 text-red-500 bg-red-50" :
                              isCurrent ? "border-primary text-primary shadow-xl shadow-primary/20" : 
                              "border-slate-100 text-slate-300"
                            )}
                          >
                             {isPast ? (isCancelled ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />) : <Icon className="w-5 h-5" />}
                          </motion.div>
                          <span className={cn(
                            "text-[10px] font-black uppercase tracking-widest",
                            isCancelled ? "text-red-500" :
                            i <= currentStepIndex ? "text-primary" : "text-slate-400"
                          )}>
                            {step.label}
                          </span>
                       </div>
                     )
                   })}
                </div>
             </CardContent>
           </Card>

           <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
           <div className="lg:col-span-2 space-y-8">
              {/* Order Specs & Customer */}
              <div className="grid md:grid-cols-2 gap-6">
                 <Card className="border-none shadow-sm">
                    <CardHeader className="bg-slate-50/50 border-b py-4">
                       <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                          <User className="w-4 h-4 text-primary" /> Informasi Pelanggan
                       </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                       <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-lg font-black text-primary shadow-sm">
                             {order.user?.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                             <div className="font-black text-sm truncate">{order.user?.name}</div>
                             <div className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                                <Mail className="w-3 h-3" /> {order.user?.email}
                             </div>
                          </div>
                       </div>
                       <div className="space-y-2 text-xs font-bold text-slate-600">
                          <div className="flex justify-between border-b border-slate-50 pb-2">
                             <span className="text-muted-foreground uppercase text-[9px]">ID User</span>
                             <span>#USR-{order.user_id}</span>
                          </div>
                          <div className="flex justify-between border-b border-slate-50 pb-2">
                             <span className="text-muted-foreground uppercase text-[9px]">Status Akun</span>
                             <Badge className="h-4 text-[8px] font-black uppercase bg-emerald-50 text-emerald-600 border-0">Verified</Badge>
                          </div>
                       </div>
                    </CardContent>
                 </Card>

                 <Card className="border-none shadow-sm">
                    <CardHeader className="bg-slate-50/50 border-b py-4">
                       <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                          <Layout className="w-4 h-4 text-secondary" /> Spesifikasi Board
                       </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-[11px] font-bold">
                          <div className="space-y-1">
                             <div className="text-muted-foreground uppercase text-[8px]">Layer</div>
                             <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">{order.detail?.data_json?.layers} Layer</div>
                          </div>
                          <div className="space-y-1">
                             <div className="text-muted-foreground uppercase text-[8px]">Dimensi</div>
                             <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">{order.detail?.data_json?.width}x{order.detail?.data_json?.height} cm</div>
                          </div>
                          <div className="space-y-1">
                             <div className="text-muted-foreground uppercase text-[8px]">Kuantitas</div>
                             <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">{order.detail?.data_json?.quantity} pcs</div>
                          </div>
                          <div className="space-y-1">
                             <div className="text-muted-foreground uppercase text-[8px]">Masking</div>
                             <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 capitalize">{order.detail?.data_json?.masking_color}</div>
                          </div>
                       </div>
                    </CardContent>
                 </Card>
              </div>

              {/* Status Update Form */}
              <Card className="border-none shadow-sm overflow-hidden">
                 <CardHeader className="bg-primary/5 border-b py-4">
                    <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-primary">
                       <Clock className="w-4 h-4" /> Proses Pesanan
                    </CardTitle>
                    <CardDescription className="text-[10px] font-bold text-muted-foreground">Pelu diketahui: Status hanya bisa dilanjutkan jika pembayaran sukses.</CardDescription>
                 </CardHeader>
                 <CardContent className="p-8">
                    
                     <form onSubmit={handleUpdateStatus} className="space-y-6">
                        <div className="grid xl:grid-cols-2 gap-6">
                           <div className="space-y-3">
                              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status Selanjutnya</label>
                              <div className="w-full h-12 px-4 rounded-xl bg-white border-2 border-slate-200 text-sm font-bold flex items-center text-slate-800">
                                 {order ? (getNextStatusInfo(order.status)?.label || 'Seluruh Tahapan Selesai') : ''}
                              </div>
                           </div>
                           <div className="space-y-3">
                              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Upload Bukti (Opsional)</label>
                              <div className="relative h-12 w-full overflow-hidden rounded-xl border-2 border-dashed border-slate-300 hover:border-primary/50 transition-colors flex items-center px-4 gap-3 bg-white">
                                 <Upload className="w-4 h-4 text-slate-400" />
                                 <span className="text-[10px] font-bold text-slate-500 truncate">{files ? `${files.length} file dipilih` : 'Klik atau paste foto...'}</span>
                                 <input 
                                   type="file" 
                                   multiple 
                                   className="absolute inset-0 opacity-0 cursor-pointer" 
                                   onChange={(e) => {
                                      const dataTransfer = new DataTransfer();
                                      if (e.target.files) {
                                         Array.from(e.target.files).forEach(f => dataTransfer.items.add(f));
                                      }
                                      if (files) {
                                         Array.from(files).forEach(f => dataTransfer.items.add(f));
                                      }
                                      setFiles(dataTransfer.files);
                                   }}
                                 />
                              </div>
                           </div>
                        </div>
                        
                        {order?.status === 'pending' && (
                           <div className="space-y-3">
                              <label className="text-[10px] font-black uppercase tracking-widest text-primary">Tambahan Biaya (Shipping/Packing)</label>
                              <Input 
                                type="number"
                                min={0}
                                placeholder="Contoh: 25000"
                                className="h-12 rounded-xl bg-white dark:bg-white border-2 border-slate-200 focus:bg-white focus:border-primary transition-all font-bold text-slate-900 dark:text-slate-900"
                                value={additionalPrice}
                                onChange={(e) => setAdditionalPrice(e.target.value)}
                              />
                              <p className="text-[9px] font-bold text-muted-foreground">Biaya ini akan ditambahkan ke pesanan pelanggan.</p>
                           </div>
                        )}

                         {order?.status === 'reviewed' && order?.payment_status !== 'success' && (
                           <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-[10px] font-bold flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 shrink-0" />
                              Menunggu pembayaran pelanggan selesai sebelum bisa lanjut ke Produksi.
                           </div>
                        )}

                        <div className="space-y-3">
                           <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Catatan / Keterangan</label>
                           <Textarea 
                             placeholder="Tuliskan catatan kemajuan atau kendala... (Bisa paste gambar di layar ini)" 
                             className="min-h-[100px] rounded-2xl bg-white dark:bg-white focus:bg-white border-2 border-slate-200 focus:border-primary text-slate-900 dark:text-slate-900 transition-all font-medium"
                             value={note}
                             onChange={(e) => setNote(e.target.value)}
                           />
                        </div>

                        <div className="flex justify-end pt-2">
                           <Button 
                             type="submit" 
                             disabled={isActionLoading || !getNextStatusInfo(order?.status) || (order?.status === 'reviewed' && order?.payment_status !== 'success') || !note.trim()}
                             className="h-12 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20"
                           >
                              {isActionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ChevronRight className="w-4 h-4 mr-2" />}
                              Lanjut Proses
                           </Button>
                        </div>
                     </form>

                 </CardContent>
              </Card>

              {/* Tabs Section */}
              <Card className="border-none shadow-sm overflow-hidden">
                 <Tabs defaultValue="history" className="w-full">
                    <TabsList className="w-full justify-start h-14 bg-slate-50/50 border-b p-0 gap-8 px-8">
                       <TabsTrigger value="history" className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none font-black text-[10px] uppercase tracking-widest gap-2">
                          <History className="w-4 h-4" /> Riwayat Status
                       </TabsTrigger>
                       <TabsTrigger value="audit" className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none font-black text-[10px] uppercase tracking-widest gap-2">
                          <FileSearch className="w-4 h-4" /> Audit Detail
                       </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="history" className="p-8 m-0 min-h-[300px]">
                       <div className="space-y-10 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                          {order.updates?.map((up: any, i: number) => (
                            <div key={i} className="relative pl-12 group">
                               <div className="absolute left-0 top-1 w-7 h-7 rounded-full bg-white border-4 border-primary/20 flex items-center justify-center group-hover:border-primary/40 transition-colors">
                                  <div className="w-2 h-2 rounded-full bg-primary" />
                               </div>
                               <div className="space-y-3">
                                  <div className="flex items-center gap-3">
                                     <Badge className="font-black text-[9px] uppercase bg-primary/10 text-primary border-0">{up.status}</Badge>
                                     <span className="text-[10px] font-bold text-muted-foreground uppercase">{new Date(up.created_at).toLocaleString('id-ID')}</span>
                                  </div>
                                  <p className="text-sm font-medium text-slate-700 italic">"{up.note || 'Pembaruan otomatis sistem'}"</p>
                                  {up.images?.length > 0 && (
                                    <div className="flex gap-3 pt-2">
                                       {up.images.map((img: string, idx: number) => (
                                         <div key={idx} className="relative group/img w-24 h-24 rounded-2xl overflow-hidden border border-slate-100 shadow-sm cursor-pointer">
                                            <img src={api.defaults.baseURL?.replace('/api', '') + '/storage/' + img} className="w-full h-full object-cover transition-transform group-hover/img:scale-110" alt="Update Trace" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity">
                                               <Eye className="w-5 h-5 text-white" />
                                            </div>
                                         </div>
                                       ))}
                                    </div>
                                  )}
                               </div>
                            </div>
                          ))}
                       </div>
                    </TabsContent>

                    <TabsContent value="audit" className="p-0 m-0 min-h-[300px]">
                       <div className="divide-y divide-slate-100">
                          {auditLogs.map((log: any, i: number) => (
                            <div key={i} className="p-6 hover:bg-slate-50/50 transition-colors">
                               <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-3">
                                     <Badge className={cn(
                                       "font-black text-[8px] uppercase border-0 px-2 py-0.5",
                                       log.action === 'created' ? "bg-emerald-50 text-emerald-600" : log.action === 'updated' ? "bg-blue-50 text-blue-600" : "bg-red-50 text-red-600"
                                     )}>{log.action}</Badge>
                                     <span className="text-[10px] font-bold text-slate-400 capitalize">{log.user?.name || log.user_role}</span>
                                  </div>
                                  <span className="text-[10px] font-bold text-slate-300 tabular-nums">{new Date(log.created_at).toLocaleString('id-ID')}</span>
                               </div>
                               <div className="text-xs font-medium text-slate-600">
                                  {log.action === 'updated' 
                                    ? `Mengubah field: ${Object.keys(log.changed_fields || {}).join(', ')}`
                                    : `${log.action === 'created' ? 'Menambahkan' : 'Menghapus'} data ke tabel ${log.table_name}`
                                  }
                               </div>
                               {log.action === 'updated' && (
                                 <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="p-3 rounded-xl bg-red-50/50 border border-red-100/50 text-[10px]">
                                       <div className="font-black text-red-600 uppercase mb-2">Before</div>
                                       <pre className="whitespace-pre-wrap font-mono opacity-60 overflow-hidden text-ellipsis line-clamp-3">{JSON.stringify(log.before_data, null, 2)}</pre>
                                    </div>
                                    <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100/50 text-[10px]">
                                       <div className="font-black text-emerald-600 uppercase mb-2">After</div>
                                       <pre className="whitespace-pre-wrap font-mono opacity-60 overflow-hidden text-ellipsis line-clamp-3">{JSON.stringify(log.after_data, null, 2)}</pre>
                                    </div>
                                 </div>
                               )}
                            </div>
                          ))}
                       </div>
                    </TabsContent>
                 </Tabs>
              </Card>
           </div>

           <div className="space-y-8">
              {/* Payment Info Card */}
              <Card className="border-none shadow-sm overflow-hidden">
                 <CardHeader className="bg-slate-50/50 border-b py-4">
                    <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                       <CreditCard className="w-4 h-4 text-primary" /> Status Pembayaran
                    </CardTitle>
                 </CardHeader>
                 <CardContent className="p-6 space-y-6">
                    <div className="space-y-1">
                       <div className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Total Transaksi</div>
                       <div className="text-2xl font-black text-slate-900 tabular-nums">{order.total_price.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })}</div>
                    </div>

                    <div className={cn(
                      "p-4 rounded-2xl flex flex-col gap-3",
                      order.payment_status === 'success' ? "bg-emerald-50/50 border border-emerald-100" : order.payment_status === 'waiting' ? "bg-amber-50/50 border border-amber-100" : "bg-red-50/50 border border-red-100"
                    )}>
                       <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase text-slate-400">Status</span>
                          <Badge className={cn(
                            "font-black text-[9px] uppercase border-0 px-2 py-0.5",
                            order.payment_status === 'success' ? "bg-emerald-500 text-white" : order.payment_status === 'waiting' ? "bg-amber-500 text-white" : "bg-red-500 text-white"
                          )}>{order.payment_status}</Badge>
                       </div>
                       {order.payment_status === 'success' && (
                         <div className="text-[10px] font-bold text-emerald-800 flex items-center gap-2">
                            <CheckCircle2 className="w-3 h-3" /> Dibayar pada {new Date(order.payment_at).toLocaleDateString()}
                         </div>
                       )}
                    </div>
                 </CardContent>
              </Card>

              {/* Shipping Address */}
              <Card className="border-none shadow-sm overflow-hidden">
                 <CardHeader className="bg-slate-50/50 border-b py-4">
                    <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                       <MapPin className="w-4 h-4 text-emerald-600" /> Alamat Pengiriman
                    </CardTitle>
                 </CardHeader>
                 <CardContent className="p-6">
                    {(() => {
                        const addr = order.detail?.data_json?.shipping_address || order.user?.address;
                        if (!addr) return <div className="text-xs font-bold text-muted-foreground italic text-center p-4">Alamat tidak tersedia.</div>;
                        return (
                          <div className="space-y-4">
                             <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                                <p className="font-black text-xs text-slate-800 uppercase tabular-nums">{addr.full_address}</p>
                                <p className="text-[11px] font-bold text-slate-500 leading-relaxed">
                                   {addr.village}, {addr.district}, {addr.city}, {addr.province} {addr.postal_code}
                                </p>
                             </div>
                             <div className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-slate-200">
                                <div className="p-2 bg-slate-50 rounded-lg"><Phone className="w-4 h-4 text-slate-400" /></div>
                                <div className="text-xs font-black text-slate-700">{addr.phone || order.user?.phone || 'N/A'}</div>
                             </div>
                          </div>
                        )
                    })()}
                 </CardContent>
              </Card>

              {/* File Management */}
              {order.detail?.file_path && (
                <Card className="border-none shadow-sm overflow-hidden">
                   <CardHeader className="bg-slate-50/50 border-b py-4">
                      <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                         <FileText className="w-4 h-4 text-primary" /> Dokumen Desain
                      </CardTitle>
                   </CardHeader>
                   <CardContent className="p-6 space-y-6">
                      <div className="space-y-3">
                         <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">File Aktif</label>
                         <a 
                           href={api.defaults.baseURL?.replace('/api', '') + '/storage/' + order.detail.file_path} 
                           target="_blank" 
                           rel="noopener noreferrer"
                           className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-4 transition-all hover:border-primary/40 group cursor-pointer"
                         >
                            <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                               <Download className="w-5 h-5" />
                            </div>
                            <div className="min-w-0 pr-2">
                               <div className="text-xs font-bold truncate">{order.detail.file_path.split('/').pop() || 'Design_File.zip'}</div>
                               <div className="text-[9px] text-muted-foreground font-black uppercase tracking-tighter">Current Revision</div>
                            </div>
                         </a>
                      </div>

                      {order.detail?.data_json?.file_history && order.detail?.data_json?.file_history.length > 0 && (
                        <div className="space-y-3 pt-2 border-t mt-4">
                           <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Riwayat Revisi</label>
                           <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                              {order.detail.data_json.file_history.map((hist: any, idx: number) => (
                                <a 
                                  key={idx} 
                                  href={api.defaults.baseURL?.replace('/api', '') + '/storage/' + hist.path}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center justify-between p-2 rounded-lg bg-slate-100/50 border border-slate-100 hover:bg-slate-100 transition-colors"
                                >
                                   <div className="flex items-center gap-2 min-w-0">
                                      <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                                      <span className="text-[10px] font-bold text-slate-600 truncate">{hist.path.split('/').pop()}</span>
                                   </div>
                                   <span className="text-[8px] font-black text-slate-400 uppercase tabular-nums">{new Date(hist.uploaded_at).toLocaleDateString()}</span>
                                </a>
                              ))}
                           </div>
                        </div>
                      )}
                   </CardContent>
                </Card>
              )}

              {/* Help & Support */}
              <div className="p-8 rounded-[2.5rem] bg-slate-900 text-white space-y-6 shadow-2xl relative overflow-hidden group">
                 <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
                 <h4 className="text-sm font-black flex items-center gap-2 relative z-10">
                    <AlertCircle className="w-4 h-4 text-primary" /> Kendala Teknis?
                 </h4>
                 <p className="text-[11px] font-medium text-slate-400 leading-relaxed relative z-10">
                    Gunakan audit log jika terjadi inkonsistensi data. Hanya supervisor yang dapat membatalkan pesanan di produksi.
                 </p>
                 <Button className="w-full bg-white hover:bg-slate-100 text-slate-900 font-black text-[10px] uppercase h-10 rounded-xl relative z-10">
                    Internal Chat
                 </Button>
              </div>
           </div>
        </div>
      </div>
    </MotionPage>
  );
}
