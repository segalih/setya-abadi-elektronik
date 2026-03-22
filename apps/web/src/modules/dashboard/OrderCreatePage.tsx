import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Layers, Maximize, Box, Upload, Info, CheckCircle2, ChevronRight, ChevronLeft, Loader2, AlertTriangle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import MotionPage, { revealUp } from '@/components/shared/MotionWrapper';
import { cn } from '@/lib/utils';
import api from '@/services/api';

export default function OrderCreatePage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [pricingParams, setPricingParams] = useState<any>(null);
  
  const [form, setForm] = useState({
    width: 10,
    height: 10,
    quantity: 5,
    layers: 'single',
    material: 'FR4',
    masking_color: 'green',
    silkscreen: 'yes',
    silkscreen_color: 'white',
    shape: 'kotak',
    file: null as File | null,
    notes: ''
  });

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const response = await api.get('/pricing/pcb');
        setPricingParams(response.data);
      } catch (error) {
        console.error('Failed to fetch pricing params', error);
      }
    };
    fetchPricing();
  }, []);

  const calculatePrice = () => {
    if (!pricingParams) return 0;
    const area = form.width * form.height;
    const basePricePerCm = form.layers === 'single' ? pricingParams.single_layer_price : pricingParams.double_layer_price;
    let baseTotal = area * basePricePerCm;
    let extras = 0;
    if (form.masking_color !== 'none') extras += baseTotal * (pricingParams.soldermask_percent / 100);
    if (form.silkscreen === 'yes') extras += baseTotal * (pricingParams.silkscreen_percent / 100);
    return Math.round((baseTotal + extras) * form.quantity);
  };

  const estimatedPrice = calculatePrice();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File terlalu besar (max 5MB)');
        return;
      }
      setForm({ ...form, file });
    }
  };

  const handleSubmit = async () => {
    if (!form.file) {
      alert('Silakan upload file desain PCB (ZIP/PDF)');
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append('product_type', 'PCB');
    formData.append('total_price', estimatedPrice.toString());
    formData.append('notes', form.notes);
    formData.append('details[width]', form.width.toString());
    formData.append('details[height]', form.height.toString());
    formData.append('details[quantity]', form.quantity.toString());
    formData.append('details[layers]', form.layers);
    formData.append('details[material]', form.material);
    formData.append('details[masking_color]', form.masking_color);
    formData.append('details[silkscreen]', form.silkscreen);
    formData.append('details[silkscreen_color]', form.silkscreen_color);
    formData.append('file', form.file);

    try {
      const resp = await api.post('/orders', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      navigate(`/dashboard`);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Gagal membuat pesanan');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MotionPage>
      <div className="min-h-screen bg-slate-50 py-12 px-6 pcb-grid relative overflow-hidden">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header & Steps */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl font-black">Konfigurasi PCB</h1>
              <p className="text-muted-foreground font-medium">Lengkapi spesifikasi board Anda untuk mendapatkan estimasi harga.</p>
            </div>
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all",
                    step >= s ? "bg-primary text-white shadow-lg" : "bg-slate-200 text-slate-400"
                  )}>
                    {s}
                  </div>
                  {s < 3 && <div className={cn("w-8 h-0.5 mx-1", step > s ? "bg-primary" : "bg-slate-200")} />}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
             <div className="lg:col-span-2">
                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <motion.div 
                      key="step1" 
                      initial={{ opacity: 0, x: -20 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      exit={{ opacity: 0, x: 20 }}
                      className="space-y-6"
                    >
                      <Card className="border-slate-100 shadow-sm">
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Layers className="w-5 h-5 text-primary" />
                            Dimensi & Kuantitas
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-6">
                           <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Panjang (cm)</label>
                             <Input type="number" value={form.width} onChange={(e) => setForm({...form, width: Number(e.target.value)})} min={1} />
                           </div>
                           <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Lebar (cm)</label>
                             <Input type="number" value={form.height} onChange={(e) => setForm({...form, height: Number(e.target.value)})} min={1} />
                           </div>
                           <div className="space-y-2 col-span-2">
                             <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Kuantitas (pcs)</label>
                             <Input type="number" value={form.quantity} onChange={(e) => setForm({...form, quantity: Number(e.target.value)})} min={5} />
                             <p className="text-[10px] text-muted-foreground">Minimum order 5 keping untuk pengerjaan prototyping.</p>
                           </div>
                        </CardContent>
                      </Card>

                      <Card className="border-slate-100 shadow-sm">
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Cpu className="w-5 h-5 text-secondary" />
                            Spesifikasi Teknis
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                           <div className="space-y-3">
                              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Layer</label>
                              <div className="grid grid-cols-2 gap-4">
                                 {['single', 'double'].map(l => (
                                   <button 
                                     key={l}
                                     onClick={() => setForm({...form, layers: l})}
                                     className={cn(
                                       "py-3 rounded-xl border-2 font-bold transition-all",
                                       form.layers === l ? "border-primary bg-primary/5 text-primary" : "border-slate-100 bg-white hover:border-slate-200"
                                     )}
                                   >
                                     {l.toUpperCase()} LAYER
                                   </button>
                                 ))}
                              </div>
                           </div>
                           <div className="grid grid-cols-2 gap-6 text-sm">
                              <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Material</label>
                                <select className="w-full h-11 px-3 border rounded-xl bg-white" value={form.material} onChange={e => setForm({...form, material: e.target.value})}>
                                  <option value="FR4">FR4 (Standard)</option>
                                  <option value="Aluminum">Aluminum</option>
                                  <option value="CEM-3">CEM-3</option>
                                </select>
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Masking Color</label>
                                <select className="w-full h-11 px-3 border rounded-xl bg-white" value={form.masking_color} onChange={e => setForm({...form, masking_color: e.target.value})}>
                                  <option value="green">Hijau (Standard)</option>
                                  <option value="blue">Biru</option>
                                  <option value="red">Merah</option>
                                  <option value="black">Hitam</option>
                                  <option value="white">Putih</option>
                                </select>
                              </div>
                           </div>
                        </CardContent>
                      </Card>
                      
                      <div className="flex justify-end">
                        <Button size="lg" onClick={() => setStep(2)}>
                          Lanjut: Upload File
                          <ChevronRight className="ml-2 w-5 h-5" />
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div 
                      key="step2" 
                      initial={{ opacity: 0, x: -20 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      exit={{ opacity: 0, x: 20 }}
                      className="space-y-6"
                    >
                      <Card className="border-slate-100 shadow-sm overflow-hidden">
                        <CardHeader className="bg-slate-50 border-b">
                           <CardTitle className="text-lg flex items-center gap-2">
                             <Upload className="w-5 h-5 text-primary" />
                             Kirim File Desain
                           </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8">
                           <div className="border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center bg-slate-50/50 hover:bg-primary/5 hover:border-primary/40 transition-all group relative">
                              <input 
                                type="file" 
                                className="absolute inset-0 opacity-0 cursor-pointer" 
                                onChange={handleFileUpload} 
                                accept=".zip,.pdf,.rar"
                              />
                              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm mb-4 group-hover:scale-110 transition-transform">
                                 <Upload className="w-8 h-8 text-primary" />
                              </div>
                              <h4 className="font-bold text-lg mb-2">{form.file ? form.file.name : 'Pilih File Gerber / Design'}</h4>
                              <p className="text-sm text-muted-foreground">Format: ZIP, PDF, RAR (Maks. 5MB)</p>
                           </div>
                           
                           <div className="mt-8 flex items-start gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100 text-amber-700 text-xs">
                              <AlertTriangle className="w-5 h-5 shrink-0" />
                              <div>
                                 <p className="font-bold">Perhatikan Design Rules:</p>
                                 <p className="font-medium mt-1">Pastikan clearance minimal 6mil dan hole size minimal 0.3mm untuk menghindari kegagalan pengerjaan.</p>
                              </div>
                           </div>
                        </CardContent>
                      </Card>

                      <div className="flex justify-between">
                        <Button variant="ghost" onClick={() => setStep(1)}>
                          <ChevronLeft className="mr-2 w-5 h-5" />
                          Kembali
                        </Button>
                        <Button size="lg" onClick={() => setStep(3)} disabled={!form.file}>
                          Lanjut: Konfirmasi
                          <ChevronRight className="ml-2 w-5 h-5" />
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {step === 3 && (
                    <motion.div 
                      key="step3" 
                      initial={{ opacity: 0, x: -20 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      exit={{ opacity: 0, x: 20 }}
                      className="space-y-6"
                    >
                       <Card className="border-slate-100 shadow-sm">
                         <CardHeader>
                            <CardTitle className="text-lg">Ringkasan Spesifikasi</CardTitle>
                         </CardHeader>
                         <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm font-medium">
                               <div className="p-4 rounded-2xl bg-slate-50 flex justify-between">
                                  <span className="text-muted-foreground">Ukuran:</span>
                                  <span className="font-black">{form.width}x{form.height} cm</span>
                               </div>
                               <div className="p-4 rounded-2xl bg-slate-50 flex justify-between">
                                  <span className="text-muted-foreground">Kuantitas:</span>
                                  <span className="font-black">{form.quantity} pcs</span>
                               </div>
                               <div className="p-4 rounded-2xl bg-slate-50 flex justify-between">
                                  <span className="text-muted-foreground">Layer:</span>
                                  <span className="font-black capitalize">{form.layers} Layer</span>
                               </div>
                               <div className="p-4 rounded-2xl bg-slate-50 flex justify-between">
                                  <span className="text-muted-foreground">Masking:</span>
                                  <span className="font-black capitalize">{form.masking_color}</span>
                               </div>
                            </div>
                            
                            <div className="p-4 border rounded-2xl flex items-center justify-between">
                               <div className="flex items-center gap-3">
                                  <FileText className="w-5 h-5 text-primary" />
                                  <span className="text-xs font-bold truncate max-w-[200px]">{form.file?.name}</span>
                               </div>
                               <Badge variant="outline">Verified</Badge>
                            </div>
                            
                            <div className="space-y-2 pt-4">
                               <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Catatan Tambahan</label>
                               <Input placeholder="Berikan instruksi khusus jika ada..." value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
                            </div>
                         </CardContent>
                       </Card>

                       <div className="flex justify-between">
                        <Button variant="ghost" onClick={() => setStep(2)}>
                          <ChevronLeft className="mr-2 w-5 h-5" />
                          Kembali
                        </Button>
                        <Button size="lg" onClick={handleSubmit} disabled={isLoading} className="bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20">
                          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Kirim Pesanan Sekarang'}
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
             </div>

             {/* Pricing Sidebar */}
             <div className="lg:sticky top-24">
                <Card className="border-none bg-primary text-white overflow-hidden shadow-2xl shadow-primary/30">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16" />
                   <CardHeader className="relative z-10">
                      <CardTitle className="text-primary-foreground/80 text-xs font-black uppercase tracking-widest">Estimasi Biaya</CardTitle>
                   </CardHeader>
                   <CardContent className="relative z-10 pt-0">
                      <div className="text-4xl font-black mb-1">Rp {estimatedPrice.toLocaleString('id-ID')}</div>
                      <p className="text-[10px] text-primary-foreground font-bold opacity-80 uppercase tracking-tighter">
                         *Harga final akan dikonfirmasi admin setelah tinjau file.
                      </p>
                      
                      <div className="mt-8 pt-8 border-t border-white/20 space-y-4">
                         <div className="flex justify-between text-sm">
                            <span className="opacity-80">Base Price:</span>
                            <span className="font-bold">Rp {((estimatedPrice / form.quantity) * 0.8).toLocaleString('id-ID')}</span>
                         </div>
                         <div className="flex justify-between text-sm">
                            <span className="opacity-80">Extras (Finish):</span>
                            <span className="font-bold">Rp {((estimatedPrice / form.quantity) * 0.2).toLocaleString('id-ID')}</span>
                         </div>
                      </div>
                   </CardContent>
                </Card>
                
                <div className="mt-8 p-6 rounded-3xl bg-white border shadow-sm space-y-4">
                   <h4 className="text-sm font-black flex items-center gap-2">
                      <Info className="w-4 h-4 text-primary" />
                      Butuh Bantuan?
                   </h4>
                   <p className="text-xs text-muted-foreground leading-relaxed font-medium">Bicara langsung dengan admin teknis kami untuk spesifikasi kustom atau pengerjaan kilat.</p>
                   <Button variant="outline" className="w-full text-xs font-bold border-2">Hubungi Tim Teknis</Button>
                </div>
             </div>
          </div>
        </div>
      </div>
    </MotionPage>
  );
}
