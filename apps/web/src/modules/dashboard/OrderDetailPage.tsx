import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Package, Clock, CheckCircle2, AlertCircle, FileText, Download, CreditCard, History, Info, 
  Loader2, MapPin, ClipboardCheck, Truck, Box, AlertTriangle, Upload, Eye
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import MotionPage from '@/components/shared/MotionWrapper';
import { cn, formatCurrency } from '@/lib/utils';
import api from '@/services/api';

declare global {
  interface Window {
    snap: any;
  }
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const fetchOrder = async () => {
    try {
      const response = await api.get(`/orders/${id}`);
      setOrder(response.data);
    } catch (error) {
      console.error('Failed to fetch order details', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleMidtransPayment = async () => {
    setIsActionLoading(true);
    try {
      const res = await api.post(`/orders/${id}/snap-token`);
      const { snap_token } = res.data;
      
      window.snap.pay(snap_token, {
        onSuccess: () => {
          addToast({ title: 'Pembayaran Berhasil', description: 'Terima kasih! Pembayaran Anda sudah diterima.', variant: 'success' });
          fetchOrder();
        },
        onPending: () => {
          addToast({ title: 'Menunggu Pembayaran', description: 'Silakan selesaikan pembayaran sesuai instruksi.' });
          fetchOrder();
        },
        onError: () => {
          addToast({ title: 'Pembayaran Gagal', description: 'Terjadi kesalahan pada proses pembayaran.', variant: 'destructive' });
        },
        onClose: () => {
          addToast({ title: 'Pembayaran Dibatalkan', description: 'Anda menutup halaman pembayaran.' });
        }
      });
    } catch (error: any) {
      addToast({ variant: 'destructive', title: 'Gagal', description: error.response?.data?.message || 'Gagal mendapatkan token pembayaran' });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setIsActionLoading(true);
    try {
      await api.post(`/orders/${id}/file`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchOrder();
      addToast({ title: 'Sukses', description: 'File design berhasil diperbarui!', variant: 'success' });
    } catch (error: any) {
      addToast({ title: 'Gagal', description: error.response?.data?.message || 'Gagal mengupload file', variant: 'destructive' });
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
  ];

  const currentStepIndex = steps.findIndex(s => s.key === order.status);
  const isPaid = order.payment_status === 'success';
  const isExpired = order.payment_status === 'expired';

  const getMaskingLabel = (val: string) => {
    const map: Record<string, string> = {
      ya_merah: 'Ya, warna merah', ya_biru: 'Ya, warna biru', ya_hijau: 'Ya, warna hijau',
      ya_hitam: 'Ya, warna hitam', ya_putih: 'Ya, warna putih', tidak: 'Tidak',
      green: 'Hijau', red: 'Merah', blue: 'Biru', black: 'Hitam', white: 'Putih', none: 'Tidak',
    };
    return map[val] || val;
  };

  return (
    <MotionPage>
      <div className="min-h-screen bg-slate-50 pb-20 pcb-grid">
        <header className="glass h-20 sticky top-0 z-10 flex items-center px-6 md:px-12 justify-between">
           <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => navigate(-1)} className="bg-white flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Kembali
              </Button>
              <div>
                <h1 className="text-lg font-black">{order.order_number}</h1>
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{order.product_type} — {new Date(order.created_at).toLocaleDateString()}</p>
              </div>
           </div>
           <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-1 font-black uppercase tracking-tighter text-[10px]">
              Status: {order.status}
           </Badge>
        </header>

        <main className="max-w-5xl mx-auto px-6 py-12 space-y-8">
           {/* Progress Timeline */}
           <Card className="border-none shadow-sm overflow-hidden mb-8">
             <CardContent className="p-4 sm:p-8 overflow-x-auto custom-scrollbar">
                <div className="relative flex justify-between items-start min-w-[500px] mb-2 px-2">
                   <div className="absolute top-8 left-0 w-full h-1 bg-slate-200 rounded-full z-0" />
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: order.status === 'cancelled' || order.status === 'expired' ? '100%' : `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                     transition={{ duration: 1.5, ease: "circOut" }}
                     className={cn("absolute top-8 left-0 h-1 rounded-full z-10 shadow-sm", order.status === 'cancelled' || order.status === 'expired' ? "bg-red-500" : "bg-primary")} 
                   />

                   {steps.map((step, i) => {
                     const Icon = step.icon;
                     const isCancelled = order.status === 'cancelled' || order.status === 'expired';
                     const isPast = isCancelled ? true : i < currentStepIndex;
                     const isCurrent = isCancelled ? false : i === currentStepIndex;
                     
                     return (
                       <div key={step.key} className="relative z-20 flex flex-col items-center gap-3 bg-slate-50/50 p-2 rounded-xl">
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
                 <div className="grid sm:grid-cols-2 gap-6">
                    {/* Payment Card with Clear LUNAS/BELUM LUNAS */}
                    <Card className="border-none shadow-sm">
                       <CardHeader className="bg-slate-100/30 border-b">
                          <CardTitle className="text-sm flex items-center gap-2">
                             <CreditCard className="w-4 h-4 text-primary" />
                             Pembayaran
                          </CardTitle>
                       </CardHeader>
                       <CardContent className="p-6 space-y-4">
                           {/* Big Payment Status Banner */}
                           <div className={cn(
                             "p-4 rounded-xl text-center font-black text-lg border-2",
                             order.status === 'pending' ? "bg-slate-50 text-slate-500 border-slate-200 shadow-inner" :
                             isPaid ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                             isExpired ? "bg-red-50 text-red-600 border-red-200" :
                             "bg-amber-50 text-amber-700 border-amber-200"
                           )}>
                             {order.status === 'pending' ? '⏳ MENUNGGU REVIEW ONGKIR' : isPaid ? '✅ LUNAS' : isExpired ? '❌ KADALUARSA' : '⏳ BELUM LUNAS'}
                           </div>

                           <div className="flex justify-between items-end">
                              <span className="text-xs font-bold text-muted-foreground uppercase">Total Tagihan</span>
                              <span className="text-xl font-black">{formatCurrency(order.total_price || 0)}</span>
                           </div>

                           {order.payment_at && (
                             <p className="text-[10px] text-emerald-600 font-bold">
                               Dibayar pada: {new Date(order.payment_at).toLocaleString('id-ID')}
                             </p>
                           )}

                           {order.payment_method && (
                             <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border">
                               <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Metode</span>
                               <Badge variant="outline" className="font-bold uppercase text-[10px]">{order.payment_method}</Badge>
                             </div>
                           )}

                           {/* Midtrans Pay Button */}
                           {order.payment_status === 'waiting' && order.status !== 'cancelled' && order.status !== 'pending' && (
                             <div className="space-y-3 pt-2">
                                <Button
                                  onClick={handleMidtransPayment}
                                  disabled={isActionLoading}
                                  className="w-full h-12 bg-[#0d47a1] hover:bg-[#0d47a1]/90 text-white font-black shadow-lg"
                                >
                                  {isActionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : '💳 Bayar Sekarang — Midtrans'}
                                </Button>
                                <p className="text-[9px] text-muted-foreground italic leading-tight text-center">
                                  Mendukung QRIS, Virtual Account, dan Bank Transfer.
                                </p>
                             </div>
                           )}
                        </CardContent>
                    </Card>

                    {/* Spec Card */}
                    <Card className="border-none shadow-sm">
                       <CardHeader className="bg-slate-100/30 border-b">
                          <CardTitle className="text-sm flex items-center gap-2">
                             <Info className="w-4 h-4 text-secondary" />
                             Spesifikasi Board
                          </CardTitle>
                       </CardHeader>
                       <CardContent className="p-6">
                          <div className="space-y-4 text-xs font-medium">
                             {order.detail?.type === 'pcb_print' && (
                                <>
                                  <div className="flex justify-between">
                                     <span className="text-muted-foreground">Kuantitas:</span>
                                     <span className="font-bold border-b-2 border-primary/20">{order.detail?.data_json?.quantity} keping</span>
                                  </div>
                                  <div className="flex justify-between">
                                     <span className="text-muted-foreground">Layer:</span>
                                     <span className="font-bold border-b-2 border-primary/20">{order.detail?.data_json?.layers} Layer</span>
                                  </div>
                                  <div className="flex justify-between">
                                     <span className="text-muted-foreground">Dimensi:</span>
                                     <span className="font-bold border-b-2 border-primary/20">{order.detail?.data_json?.width}x{order.detail?.data_json?.height} cm</span>
                                  </div>
                                  <div className="flex justify-between">
                                     <span className="text-muted-foreground">Material:</span>
                                     <span className="font-bold border-b-2 border-primary/20">{order.detail?.data_json?.material}</span>
                                  </div>
                                  <div className="flex justify-between">
                                     <span className="text-muted-foreground">Masking Atas:</span>
                                     <span className="font-bold border-b-2 border-primary/20 capitalize">{getMaskingLabel(order.detail?.data_json?.masking_top || order.detail?.data_json?.masking_color || '')}</span>
                                  </div>
                                  <div className="flex justify-between">
                                     <span className="text-muted-foreground">Masking Bawah:</span>
                                     <span className="font-bold border-b-2 border-primary/20 capitalize">{getMaskingLabel(order.detail?.data_json?.masking_bottom || '')}</span>
                                  </div>
                                  <div className="flex justify-between">
                                     <span className="text-muted-foreground">Silkscreen:</span>
                                     <span className="font-bold border-b-2 border-primary/20 capitalize">{getMaskingLabel(order.detail?.data_json?.silkscreen || '')}</span>
                                  </div>
                                  <div className="flex justify-between">
                                     <span className="text-muted-foreground">Bentuk:</span>
                                     <span className="font-bold border-b-2 border-primary/20 capitalize">{order.detail?.data_json?.board_shape || 'kotak'}</span>
                                  </div>
                                </>
                             )}
                             {order.detail?.type === 'design' && (
                                <div className="space-y-2">
                                  <span className="text-muted-foreground block">Deskripsi Desain:</span>
                                  <p className="font-bold text-slate-800 bg-slate-50 p-3 rounded-md border">{order.detail?.data_json?.design_description}</p>
                                </div>
                             )}
                             {order.detail?.type === 'assembly' && (
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Jumlah Komponen:</span>
                                  <span className="font-bold border-b-2 border-primary/20">{order.detail?.data_json?.component_count} titik</span>
                                </div>
                             )}
                             {(order.detail?.data_json?.notes || order.notes) && (
                                <div className="pt-2 border-t mt-2">
                                  <span className="text-muted-foreground block mb-1">Catatan Tambahan:</span>
                                  <p className="text-slate-600 italic">"{order.detail?.data_json?.notes || order.notes}"</p>
                                </div>
                             )}
                          </div>
                       </CardContent>
                    </Card>

                    {/* Alamat Pengiriman */}
                    <Card className="border-none shadow-sm sm:col-span-2">
                       <CardHeader className="bg-slate-100/30 border-b">
                          <CardTitle className="text-sm flex items-center gap-2">
                             <MapPin className="w-4 h-4 text-emerald-600" />
                             Alamat Pengiriman
                          </CardTitle>
                       </CardHeader>
                       <CardContent className="p-6">
                          {(() => {
                            const addr = order.detail?.data_json?.shipping_address || order.user?.address;
                            if (!addr) return <div className="text-xs text-muted-foreground italic bg-slate-50 p-4 rounded-md border text-center font-medium">Alamat pengiriman belum diatur.</div>;
                            return (
                              <div className="space-y-1 text-sm bg-slate-50 p-4 rounded-md border border-slate-100">
                                <p className="font-black text-slate-800 uppercase tracking-widest text-xs mb-2 flex items-center gap-2">
                                  {order.user?.name} {order.detail?.data_json?.shipping_address ? <Badge variant="secondary" className="text-[8px] px-1 py-0">Custom Override</Badge> : <Badge className="bg-primary/10 text-primary text-[8px] px-1 py-0 border-0 shadow-none hover:bg-primary/10">Default Profile</Badge>}
                                </p>
                                <p className="text-slate-600 font-medium leading-relaxed">{addr.full_address}</p>
                                <p className="text-slate-500 text-xs mt-1">{addr.village}, {addr.district}</p>
                                <p className="text-slate-500 text-xs">{addr.city}, {addr.province} {addr.postal_code}</p>
                                {addr.phone && <p className="text-slate-800 text-xs pt-3 mt-3 border-t font-black flex items-center gap-2">📱 {addr.phone}</p>}
                              </div>
                            );
                          })()}
                       </CardContent>
                    </Card>
                 </div>

                 {/* Status History */}
                 <Card className="border-none shadow-sm overflow-hidden">
                    <CardHeader className="bg-slate-100/30 border-b px-6">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <History className="w-4 h-4 text-primary" /> Riwayat Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                       {order.updates && order.updates.length > 0 ? (
                         <div className="space-y-8 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                            {order.updates.map((update: any, i: number) => (
                              <div key={i} className="relative pl-10">
                                 <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-white border-2 border-primary flex items-center justify-center">
                                    <div className="w-2 h-2 rounded-full bg-primary" />
                                 </div>
                                 <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                       <Badge className="bg-primary/10 text-primary border-none text-[8px] font-black uppercase">{update.status}</Badge>
                                       <span className="text-[10px] font-bold text-muted-foreground uppercase">{new Date(update.created_at).toLocaleString('id-ID')}</span>
                                    </div>
                                    <p className="text-sm text-slate-600 font-medium">"{update.note || 'Status pesanan diperbarui oleh sistem.'}"</p>
                                    {update.images && update.images.length > 0 && (
                                      <div className="flex gap-2 mt-4">
                                         {update.images.map((img: string, idx: number) => (
                                            <a 
                                              key={idx} 
                                              href={api.defaults.baseURL?.replace('/api', '') + '/storage/' + img}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="relative group overflow-hidden rounded-xl border border-slate-100 shadow-sm block"
                                            >
                                               <img src={api.defaults.baseURL?.replace('/api', '') + '/storage/' + img} className="w-20 h-20 object-cover transition-transform group-hover:scale-110" alt="Update Evidence" />
                                               <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                                                  <Eye className="w-4 h-4 text-white" />
                                               </div>
                                            </a>
                                         ))}
                                      </div>
                                    )}
                                 </div>
                              </div>
                            ))}
                         </div>
                       ) : (
                         <div className="py-8 text-center text-sm text-muted-foreground font-medium italic">
                            Belum ada riwayat. Pesanan sedang mengantri untuk ditinjau.
                         </div>
                       )}
                    </CardContent>
                 </Card>
              </div>

              <div className="space-y-8">
                 {/* Design File Management */}
                 <Card className="border-none shadow-sm overflow-hidden">
                    <CardHeader className="py-4 bg-slate-100/30 border-b">
                       <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                          <FileText className="w-4 h-4 text-primary" />
                          Manajemen File
                       </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                       <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">File Aktif</label>
                          <a 
                            href={api.defaults.baseURL?.replace('/api', '') + '/storage/' + order.detail?.file_path} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-4 transition-all hover:border-primary/40 group cursor-pointer"
                          >
                             <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                <Download className="w-5 h-5" />
                             </div>
                             <div className="min-w-0 pr-2">
                                <div className="text-xs font-bold truncate">{order.detail?.file_path?.split('/').pop() || 'Design_File.zip'}</div>
                                <div className="text-[9px] text-muted-foreground font-black uppercase tracking-tighter">Gerber / PDF</div>
                             </div>
                          </a>
                       </div>

                       {['pending', 'reviewed'].includes(order.status) ? (
                          <div className="space-y-3 pt-2">
                             <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Update File Desain</label>
                             <div className="relative overflow-hidden group">
                                <input 
                                  type="file" 
                                  id="design-upload" 
                                  className="absolute inset-0 opacity-0 cursor-pointer z-20" 
                                  onChange={handleFileUpload}
                                  disabled={isActionLoading}
                                  accept=".zip,.rar,.pdf"
                                />
                                <div className="p-6 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center gap-2 group-hover:border-primary/50 group-hover:bg-primary/5 transition-all">
                                   <Upload className={cn("w-6 h-6 text-slate-300 group-hover:text-primary transition-colors", isActionLoading && "animate-pulse")} />
                                   <span className="text-[10px] font-black uppercase tracking-tighter text-slate-500 group-hover:text-primary">Klik / Drag file baru</span>
                                </div>
                             </div>
                          </div>
                       ) : (
                         <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-[10px] font-bold text-slate-400 italic flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" /> Locked: Sudah masuk tahap produksi.
                         </div>
                       )}

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

                 <div className="p-8 rounded-3xl bg-linear-to-br from-primary/10 to-secondary/10 border border-white shadow-inner space-y-4">
                    <h4 className="text-sm font-black flex items-center gap-2">
                       <Info className="w-4 h-4 text-primary" />
                       Bantuan Pesanan
                    </h4>
                    <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">Jika ada kendala, hubungi supervisor teknis kami.</p>
                    <Button variant="outline" className="w-full text-xs font-black border-2 border-primary/20 bg-white hover:bg-primary/5">Chat Supervisor</Button>
                 </div>
              </div>
           </div>
        </main>
      </div>
    </MotionPage>
  );
}
