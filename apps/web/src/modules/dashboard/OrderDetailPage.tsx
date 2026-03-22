import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  Box
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import MotionPage from '@/components/shared/MotionWrapper';
import { cn } from '@/lib/utils';
import api from '@/services/api';

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await api.get(`/orders/${id}`);
        setOrder(response.data);
      } catch (error) {
        console.error('Failed to fetch order', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!order) return <div className="min-h-screen flex items-center justify-center bg-slate-50 font-bold">Pesanan tidak ditemukan.</div>;

  const steps = [
    { key: 'pending', label: 'Diterima', icon: FileText },
    { key: 'reviewed', label: 'Ditinjau', icon: ClipboardCheck },
    { key: 'in_production', label: 'Produksi', icon: Package },
    { key: 'ready_to_ship', label: 'Kemas', icon: Box },
    { key: 'shipped', label: 'Kirim', icon: Truck },
    { key: 'completed', label: 'Selesai', icon: CheckCircle2 },
  ];

  const currentStepIndex = steps.findIndex(s => s.key === order.status);

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
           <Card className="border-none shadow-sm overflow-hidden">
             <CardContent className="p-8">
                <div className="relative flex justify-between items-start">
                   {/* Background Line */}
                   <div className="absolute top-6 left-0 w-full h-1 bg-slate-100 rounded-full -z-0" />
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                     transition={{ duration: 1.5, ease: "circOut" }}
                     className="absolute top-6 left-0 h-1 bg-primary rounded-full z-10 shadow-sm" 
                   />

                   {steps.map((step, i) => {
                     const Icon = step.icon;
                     const isPast = i < currentStepIndex;
                     const isCurrent = i === currentStepIndex;
                     return (
                       <div key={step.key} className="relative z-20 flex flex-col items-center gap-3 bg-slate-50/50 p-2 rounded-xl">
                          <motion.div 
                            initial={false}
                            animate={isCurrent ? { scale: 1.2 } : { scale: 1 }}
                            className={cn(
                              "w-12 h-12 rounded-full border-4 flex items-center justify-center transition-none ",
                              isPast ? "bg-primary border-primary text-white" : isCurrent ? "bg-white border-primary text-primary shadow-xl shadow-primary/20" : "bg-white border-slate-100 text-slate-300"
                            )}
                          >
                             {isPast ? <CheckCircle2 className="w-6 h-6" /> : <Icon className="w-5 h-5" />}
                          </motion.div>
                          <span className={cn(
                            "text-[10px] font-black uppercase tracking-widest",
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
                    <Card className="border-none shadow-sm">
                       <CardHeader className="bg-slate-100/30 border-b">
                          <CardTitle className="text-sm flex items-center gap-2">
                             <CreditCard className="w-4 h-4 text-primary" />
                             Pembayaran
                          </CardTitle>
                       </CardHeader>
                       <CardContent className="p-6 space-y-6">
                          <div className="flex justify-between items-end">
                             <span className="text-xs font-bold text-muted-foreground uppercase">Total Tagihan</span>
                             <span className="text-xl font-black">Rp {order.total_price.toLocaleString('id-ID')}</span>
                          </div>
                          <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl">
                             <span className="text-xs font-medium">Status Pembayaran:</span>
                             <Badge variant={order.payment_status === 'success' ? 'default' : 'secondary'} className="font-black uppercase text-[9px]">
                                {order.payment_status}
                             </Badge>
                          </div>
                          {order.payment_status === 'waiting' && order.status !== 'cancelled' && (
                            <Button className="w-full h-12 text-sm font-black shadow-lg shadow-emerald-500/20 bg-emerald-500 hover:bg-emerald-600 text-white">
                               Bayar Sekarang
                            </Button>
                          )}
                       </CardContent>
                    </Card>

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
                                     <span className="text-muted-foreground">Masking Color:</span>
                                     <span className="font-bold border-b-2 border-primary/20 capitalize">{order.detail?.data_json?.masking_color}</span>
                                  </div>
                                  <div className="flex justify-between">
                                     <span className="text-muted-foreground">Silkscreen:</span>
                                     <span className="font-bold border-b-2 border-primary/20 capitalize">{order.detail?.data_json?.silkscreen === 'yes' ? order.detail?.data_json?.silkscreen_color : 'Tidak Ada'}</span>
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
                             {order.detail?.data_json?.notes && (
                                <div className="pt-2 border-t mt-2">
                                  <span className="text-muted-foreground block mb-1">Catatan Tambahan:</span>
                                  <p className="text-slate-600 italic">"{order.detail?.data_json?.notes}"</p>
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
                            if (!addr) return <div className="text-xs text-muted-foreground italic bg-slate-50 p-4 rounded-md border text-center font-medium">Alamat pengiriman belum diatur. Silakan atur di Profil.</div>;
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

                 {/* Updates / History */}
                 <Card className="border-none shadow-sm overflow-hidden">
                    <CardHeader className="bg-slate-100/30 border-b">
                       <CardTitle className="text-sm flex items-center gap-2">
                          <History className="w-4 h-4 text-primary" />
                          Riwayat Aktivitas
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
                                       <span className="text-xs font-black uppercase text-primary">{update.status}</span>
                                       <span className="text-[10px] font-bold text-muted-foreground">{new Date(update.created_at).toLocaleString()}</span>
                                    </div>
                                    <p className="text-sm text-slate-600 font-medium">"{update.note || 'Status pesanan diperbarui oleh sistem.'}"</p>
                                    {update.images && update.images.length > 0 && (
                                      <div className="flex gap-2 mt-4">
                                         {update.images.map((img: string, idx: number) => (
                                           <img key={idx} src={img} className="w-20 h-20 rounded-xl object-cover border border-slate-100 shadow-sm" alt="Update Evidence" />
                                         ))}
                                      </div>
                                    )}
                                 </div>
                              </div>
                            ))}
                         </div>
                       ) : (
                         <div className="py-8 text-center text-sm text-muted-foreground font-medium italic">
                            Belum ada riwayat aktivitas. Pesanan Anda sedang mengantri untuk ditinjau oleh tim teknis kami.
                         </div>
                       )}
                    </CardContent>
                 </Card>
              </div>

              <div className="space-y-8">
                 <Card className="border-none shadow-sm">
                    <CardHeader className="py-4 bg-slate-100/30 border-b">
                       <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                          <FileText className="w-4 h-4 text-primary" />
                          File Desain
                       </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                       <div className="p-4 rounded-md bg-slate-50 border border-slate-100 flex items-center gap-4 transition-none hover:border-primary/40 group">
                          <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-primary group-hover:scale-110 ">
                             <Download className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                             <div className="text-xs font-bold truncate">Project_PCB_Design.zip</div>
                             <div className="text-[10px] text-muted-foreground uppercase font-black uppercase">Gerber / CAD File</div>
                          </div>
                       </div>
                    </CardContent>
                 </Card>

                 <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-primary/10 to-secondary/10 border border-white shadow-inner space-y-4">
                    <h4 className="text-sm font-black flex items-center gap-2">
                       <Info className="w-4 h-4 text-primary" />
                       Bantuan Pesanan
                    </h4>
                    <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">Jika Anda menemukan kendala dengan pesanan ini, silakan hubungi supervisor teknis kami.</p>
                    <Button variant="outline" className="w-full text-xs font-black border-2 border-primary/20 bg-white hover:bg-primary/5">Chat Supervisor</Button>
                 </div>
              </div>
           </div>
        </main>
      </div>
    </MotionPage>
  );
}
