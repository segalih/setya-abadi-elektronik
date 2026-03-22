import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Layers, Upload, Info, ChevronRight, ChevronLeft, Loader2, AlertTriangle, FileText, PenTool, Wrench, MapPin, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import MotionPage from '@/components/shared/MotionWrapper';
import { cn } from '@/lib/utils';
import api from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { Textarea } from '@/components/ui/textarea';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FileUpload } from '@/components/ui/file-upload';

export default function OrderCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const actualUser = (user as any)?.user || user;

  const [step, setStep] = useState(1);
  const [pricingParams, setPricingParams] = useState<any>(null);
  const [productType, setProductType] = useState<'pcb_print' | 'design' | 'assembly'>('pcb_print');
  
  const [form, setForm] = useState({
    // PCB Print
    width: 10,
    height: 10,
    quantity: 5,
    layers: 'single',
    material: 'FR4',
    masking_color: 'green',
    silkscreen: 'yes',
    silkscreen_color: 'white',
    // Design
    design_description: '',
    // Assembly
    component_count: 50,
    // Shared
    notes: '',
    file: null as File | null
  });

  const [useCustomAddress, setUseCustomAddress] = useState(false);
  const [customAddress, setCustomAddress] = useState({
    full_address: '', province: '', city: '', district: '', village: '', postal_code: '', phone: ''
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
    if (productType === 'design' || productType === 'assembly') return 0; // TBD by admin
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

  const { mutate: submitOrder, isPending: isLoading } = useMutation({
    mutationFn: async (formData: FormData) => {
      const resp = await api.post('/orders', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return resp.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      alert('Pesanan berhasil dibuat!');
      navigate('/dashboard');
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Gagal membuat pesanan');
    }
  });

  const handleSubmit = () => {
    if ((productType === 'pcb_print' || productType === 'design') && !form.file) {
      alert('Silakan upload file yang dibutuhkan terlebih dahulu!');
      return;
    }

    const formData = new FormData();
    formData.append('product_type', productType);
    formData.append('total_price', estimatedPrice.toString());
    formData.append('notes', form.notes);

    if (productType === 'pcb_print') {
      formData.append('details[width]', form.width.toString());
      formData.append('details[height]', form.height.toString());
      formData.append('details[quantity]', form.quantity.toString());
      formData.append('details[layers]', form.layers);
      formData.append('details[material]', form.material);
      formData.append('details[masking_color]', form.masking_color);
      formData.append('details[silkscreen]', form.silkscreen);
      formData.append('details[silkscreen_color]', form.silkscreen_color);
    } else if (productType === 'design') {
      formData.append('details[description]', form.design_description);
    } else if (productType === 'assembly') {
      formData.append('details[component_count]', form.component_count.toString());
    }

    if (form.file) {
      formData.append('file', form.file);
    }

    if (useCustomAddress) {
      if (!customAddress.full_address || !customAddress.province || !customAddress.city || !customAddress.phone) {
        alert('Demi kelancaran, silakan lengkapi Alamat Kustom (Minimal: Alamat Lengkap, Provinsi, Kota, dan No HP).');
        return;
      }
      formData.append('shipping_address[full_address]', customAddress.full_address);
      formData.append('shipping_address[province]', customAddress.province);
      formData.append('shipping_address[city]', customAddress.city);
      formData.append('shipping_address[district]', customAddress.district);
      formData.append('shipping_address[village]', customAddress.village);
      formData.append('shipping_address[postal_code]', customAddress.postal_code);
      formData.append('shipping_address[phone]', customAddress.phone);
    }

    submitOrder(formData);
  };

  return (
    <MotionPage>
      <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 pcb-grid relative overflow-hidden">
        <div className="max-w-5xl mx-auto space-y-8">
          <Button variant="outline" onClick={() => navigate(-1)} className="bg-white flex items-center gap-2 w-fit">
            <ArrowLeft className="w-4 h-4" /> Kembali
          </Button>

          {/* Header & Steps */}
          <div className="flex flex-col items-center justify-center text-center gap-8 mb-10">
            <div>
              <h1 className="text-3xl font-black">Buat Pesanan Baru</h1>
              <p className="text-muted-foreground font-medium mt-2">Pilih layanan dan lengkapi spesifikasi pesanan Anda.</p>
            </div>
            
            {/* Centered & Widened Progress Bar */}
            <div className="flex items-center justify-center w-full max-w-md mx-auto">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center flex-1 last:flex-none">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-black transition-none shrink-0",
                    step >= s ? "bg-primary text-white shadow-lg shadow-primary/30" : "bg-slate-200 text-slate-400"
                  )}>
                    {s}
                  </div>
                  {s < 3 && (
                    <div className="flex-1 px-2">
                       <div className={cn("h-1.5 w-full rounded-full transition-colors ", step > s ? "bg-primary" : "bg-slate-200")} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className={cn(
            "items-start transition-none ",
            step === 1 ? "max-w-4xl mx-auto" : "grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8"
          )}>
             <div className={cn(step === 1 ? "" : "lg:col-span-2")}>
                <AnimatePresence mode="wait">

                {/* STEP 1: PILIH LAYANAN */}
                  {step === 1 && (
                  <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <Card
                        className={cn("cursor-pointer transition-none hover:border-primary/50 relative overflow-hidden", productType === 'pcb_print' ? "border-primary ring-1 ring-primary shadow-md" : "")}
                        onClick={() => setProductType('pcb_print')}
                      >
                        <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                          <div className={cn("p-4 rounded-md", productType === 'pcb_print' ? "bg-primary text-white" : "bg-slate-100 text-slate-500")}>
                            <Cpu className="w-8 h-8" />
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-800">PCB Print</h3>
                            <p className="text-xs text-muted-foreground mt-1">Cetak prototype 1-10 pcs layer tunggal atau ganda</p>
                          </div>
                        </CardContent>
                        {productType === 'pcb_print' && <div className="absolute top-3 right-3"><CheckCircle2 className="w-5 h-5 text-primary" /></div>}
                      </Card>

                      <Card
                        className={cn("cursor-pointer transition-none hover:border-primary/50 relative overflow-hidden", productType === 'design' ? "border-primary ring-1 ring-primary shadow-md" : "")}
                        onClick={() => setProductType('design')}
                      >
                        <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                          <div className={cn("p-4 rounded-md", productType === 'design' ? "bg-primary text-white" : "bg-slate-100 text-slate-500")}>
                            <PenTool className="w-8 h-8" />
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-800">Custom Design</h3>
                            <p className="text-xs text-muted-foreground mt-1">Skema diagram dari ide Anda menjadi desain layout</p>
                          </div>
                        </CardContent>
                        {productType === 'design' && <div className="absolute top-3 right-3"><CheckCircle2 className="w-5 h-5 text-primary" /></div>}
                      </Card>

                      <Card
                        className={cn("cursor-pointer transition-none hover:border-primary/50 relative overflow-hidden", productType === 'assembly' ? "border-primary ring-1 ring-primary shadow-md" : "")}
                        onClick={() => setProductType('assembly')}
                      >
                        <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                          <div className={cn("p-4 rounded-md", productType === 'assembly' ? "bg-primary text-white" : "bg-slate-100 text-slate-500")}>
                            <Wrench className="w-8 h-8" />
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-800">PCB Assembly</h3>
                            <p className="text-xs text-muted-foreground mt-1">Solder manual komponen untuk pesanan low volume</p>
                          </div>
                        </CardContent>
                        {productType === 'assembly' && <div className="absolute top-3 right-3"><CheckCircle2 className="w-5 h-5 text-primary" /></div>}
                      </Card>
                    </div>

                    <div className="flex justify-end mt-8">
                      <Button size="lg" className="h-12 px-8" onClick={() => setStep(2)}>
                        Lanjut: Detail Spesifikasi
                        <ChevronRight className="ml-2 w-5 h-5" />
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 2: SPESIFIKASI DINAMIS */}
                {step === 2 && (
                  <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">

                    {/* Form PCB Print */}
                    {productType === 'pcb_print' && (
                      <>
                        <Card className="border-slate-200 shadow-sm">
                          <CardHeader className="bg-slate-50/50 border-b">
                            <CardTitle className="text-base flex items-center gap-2">
                              <Layers className="w-5 h-5 text-primary" /> Array & Dimensi
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="grid grid-cols-2 gap-6 pt-6">
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Panjang (cm)</label>
                              <Input type="number" value={form.width} onChange={(e) => setForm({ ...form, width: Number(e.target.value) })} min={1} />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Lebar (cm)</label>
                              <Input type="number" value={form.height} onChange={(e) => setForm({ ...form, height: Number(e.target.value) })} min={1} />
                            </div>
                            <div className="space-y-2 col-span-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Kuantitas (pcs)</label>
                              <Input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} min={1} />
                            </div>
                            <div className="space-y-3 col-span-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Layer</label>
                              <div className="grid grid-cols-2 gap-4">
                                {['single', 'double'].map(l => (
                                  <button key={l} onClick={() => setForm({ ...form, layers: l })} className={cn(
                                    "py-3 rounded-xl border-2 font-bold transition-none",
                                    form.layers === l ? "border-primary bg-primary/5 text-primary" : "border-slate-200 bg-white hover:border-slate-300"
                                  )}>
                                    {l.toUpperCase()} LAYER
                                  </button>
                                ))}
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="border-slate-200 shadow-sm overflow-hidden mt-6">
                          <CardHeader className="bg-slate-50 border-b">
                             <CardTitle className="text-base flex items-center gap-2">
                               <Upload className="w-5 h-5 text-primary" /> Upload PCB Design (Gerber)
                             </CardTitle>
                          </CardHeader>
                          <CardContent className="p-8">
                             <FileUpload 
                               value={form.file} 
                               onChange={(f) => setForm({...form, file: f})} 
                               accept=".zip,.rar" 
                               maxSizeMB={5} 
                             />
                          </CardContent>
                        </Card>
                      </>
                    )}

                    {/* Form Design */}
                    {productType === 'design' && (
                      <Card className="border-slate-200 shadow-sm">
                        <CardHeader className="bg-slate-50/50 border-b">
                          <CardTitle className="text-base flex items-center gap-2">
                            <PenTool className="w-5 h-5 text-primary" /> Setup Kebutuhan Desain
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Deskripsi & Skema Fungsi</label>
                            <Textarea className="min-h-[150px] resize-none" placeholder="Jelaskan kebutuhan fungsionalitas dan pin-pin komponen..." value={form.design_description} onChange={(e: any) => setForm({ ...form, design_description: e.target.value })} />
                              </div>
                          <div className="space-y-4">
                             <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">Upload Referensi Skematik (PDF / Gambar)</label>
                             <FileUpload 
                               value={form.file} 
                               onChange={(f) => setForm({...form, file: f})} 
                               accept=".pdf,.png,.jpg,.jpeg,.zip" 
                               maxSizeMB={5} 
                             />
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Form Assembly */}
                    {productType === 'assembly' && (
                      <Card className="border-slate-200 shadow-sm">
                        <CardHeader className="bg-slate-50/50 border-b">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Wrench className="w-5 h-5 text-primary" /> Setup Perakitan (Manual Soldering)
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Estimasi Jumlah Komponen per Board</label>
                            <Input type="number" min={1} value={form.component_count} onChange={(e) => setForm({ ...form, component_count: Number(e.target.value) })} />
                              </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Catatan Assembly (BOM lists)</label>
                            <Textarea className="min-h-[150px]" placeholder="Sebutkan catatan perakitan, komponen SMD/THT, dll..." value={form.notes} onChange={(e: any) => setForm({ ...form, notes: e.target.value })} />
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    <div className="flex justify-between mt-8">
                      <Button variant="outline" className="h-12 px-6 border-slate-300" onClick={() => setStep(1)}>
                          <ChevronLeft className="mr-2 w-5 h-5" />
                          Kembali
                        </Button>
                      <Button size="lg" className="h-12 px-8" onClick={() => {
                        if ((productType === 'pcb_print' || productType === 'design') && !form.file) {
                          alert('File upload bersifat mandatory. Silakan upload file Gerber atau Referensi Anda terlebih dahulu!');
                          return;
                        }
                        setStep(3);
                      }}>
                        Lanjut: Review Order
                          <ChevronRight className="ml-2 w-5 h-5" />
                        </Button>
                      </div>
                    </motion.div>
                  )}

                {/* STEP 3: REVIEW ORDER */}
                  {step === 3 && (
                  <motion.div key="step3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                    <Card className="border-slate-200 shadow-sm overflow-hidden">
                      <div className="bg-primary p-6 text-white flex justify-between items-center">
                        <div>
                          <h3 className="font-black text-xl">Review Pesanan</h3>
                          <p className="text-primary-foreground/80 text-sm font-medium mt-1">
                            {productType === 'pcb_print' ? 'Cetak Prototype PCB' : productType === 'design' ? 'Jasa Custom Design' : 'Jasa Manual Assembly'}
                          </p>
                        </div>
                      </div>
                      <CardContent className="p-0">

                        {/* Alamat Pengiriman Section */}
                        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-800 flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-primary" /> Informasi Pengiriman
                            </h4>
                            <div className="flex items-center gap-2 text-sm font-bold border rounded-lg p-1 bg-white">
                              <button onClick={() => setUseCustomAddress(false)} className={cn("px-3 py-1.5 rounded-md transition-colors", !useCustomAddress ? "bg-primary text-white" : "text-slate-500 hover:text-slate-800")}>Alamat Profil</button>
                              <button onClick={() => setUseCustomAddress(true)} className={cn("px-3 py-1.5 rounded-md transition-colors", useCustomAddress ? "bg-primary text-white" : "text-slate-500 hover:text-slate-800")}>Ganti Alamat</button>
                            </div>
                          </div>

                          {!useCustomAddress ? (
                            actualUser?.address ? (
                              <div className="text-sm font-medium text-slate-600 bg-white p-4 rounded-xl border border-slate-200">
                                <p className="font-bold text-slate-800 mb-1">{actualUser.name}</p>
                                <p>{actualUser.address.full_address}</p>
                                <p>{actualUser.address.village}, {actualUser.address.district}</p>
                                <p>{actualUser.address.city}, {actualUser.address.province} - {actualUser.address.postal_code}</p>
                                <p className="mt-2 text-primary">Telp: {actualUser.address.phone}</p>
                              </div>
                            ) : (
                              <div className="p-4 bg-amber-50 text-amber-700 rounded-xl text-sm font-bold border border-amber-200 flex items-start gap-2">
                                <AlertTriangle className="w-5 h-5 shrink-0" />
                                Bapak/Ibu belum mengatur alamat pengiriman secara konkrit. Silakan atur di Profil, atau gunakan opsi "Ganti Alamat" di atas.
                              </div>
                            )
                          ) : (
                            <div className="bg-white p-5 rounded-xl border border-primary/30 shadow-sm  space-y-4">
                              <div className="p-3 bg-primary/10 text-primary text-xs font-bold rounded-lg mb-2">
                                <Info className="w-4 h-4 inline mr-1" /> Alamat ini hanya berlaku eksklusif untuk pesanan ini saja (Override).
                              </div>
                              <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-600">Alamat Lengkap</label>
                                <Input value={customAddress.full_address} onChange={e => setCustomAddress({...customAddress, full_address: e.target.value})} placeholder="Nama jalan, RT/RW, Patokan" />
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2"><label className="text-xs font-bold text-slate-600">Provinsi</label><Input value={customAddress.province} onChange={e => setCustomAddress({...customAddress, province: e.target.value})} placeholder="Provinsi" /></div>
                                <div className="space-y-2"><label className="text-xs font-bold text-slate-600">Kota/Kota</label><Input value={customAddress.city} onChange={e => setCustomAddress({...customAddress, city: e.target.value})} placeholder="Kota" /></div>
                                <div className="space-y-2"><label className="text-xs font-bold text-slate-600">Kecamatan</label><Input value={customAddress.district} onChange={e => setCustomAddress({...customAddress, district: e.target.value})} placeholder="Kecamatan" /></div>
                                <div className="space-y-2"><label className="text-xs font-bold text-slate-600">Desa/Kelurahan</label><Input value={customAddress.village} onChange={e => setCustomAddress({...customAddress, village: e.target.value})} placeholder="Desa" /></div>
                                <div className="space-y-2"><label className="text-xs font-bold text-slate-600">Kode Pos</label><Input value={customAddress.postal_code} onChange={e => setCustomAddress({...customAddress, postal_code: e.target.value})} placeholder="Kode Pos" /></div>
                                <div className="space-y-2"><label className="text-xs font-bold text-slate-600">No HP</label><Input value={customAddress.phone} onChange={e => setCustomAddress({...customAddress, phone: e.target.value})} placeholder="No Handphone aktif" /></div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Detail Spesifikasi */}
                        <div className="p-6 border-b border-slate-100">
                          <h4 className="text-xs font-black uppercase tracking-widest text-slate-800 mb-4">Detail Produk</h4>
                          {productType === 'pcb_print' && (
                            <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-xl border border-slate-200">
                              <div><span className="text-muted-foreground block text-xs">Dimensi</span><span className="font-bold">{form.width}x{form.height} cm</span></div>
                              <div><span className="text-muted-foreground block text-xs">Kuantitas</span><span className="font-bold">{form.quantity} pcs</span></div>
                              <div><span className="text-muted-foreground block text-xs">Layer</span><span className="font-bold capitalize">{form.layers} Layer</span></div>
                              <div><span className="text-muted-foreground block text-xs">Masking</span><span className="font-bold capitalize">{form.masking_color}</span></div>
                            </div>
                          )}
                          {productType === 'design' && (
                            <div className="text-sm bg-slate-50 p-4 rounded-xl border border-slate-200">
                              <span className="text-muted-foreground block text-xs mb-1">Deskripsi</span>
                              <p className="font-medium">{form.design_description || '-'}</p>
                            </div>
                          )}
                          {productType === 'assembly' && (
                            <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-xl border border-slate-200">
                              <div><span className="text-muted-foreground block text-xs">Kuantitas Komponen</span><span className="font-bold">{form.component_count} pcs/board</span></div>
                              <div className="col-span-2"><span className="text-muted-foreground block text-xs">Catatan BOM</span><p className="font-medium">{form.notes || '-'}</p></div>
                            </div>
                          )}
                            </div>
                         </CardContent>
                       </Card>

                       <div className="flex justify-between">
                      <Button variant="outline" className="h-12 px-6 border-slate-300" onClick={() => setStep(2)}>
                          <ChevronLeft className="mr-2 w-5 h-5" />
                          Kembali
                        </Button>
                      <Button size="lg" onClick={handleSubmit} disabled={isLoading} className="h-12 px-8 bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20">
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Selesai & Buat Order'}
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
             </div>

             {/* Pricing Sidebar */}
             {step >= 2 && (
               <div className="lg:sticky top-24  ">
                <Card className="border-none bg-[#1e293b] text-white overflow-hidden shadow-2xl shadow-slate-900/10">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-16 -mt-16" />
                  <CardHeader className="relative z-10 border-b border-white/10 pb-4">
                    <CardTitle className="text-slate-400 text-xs font-black uppercase tracking-widest flex items-center gap-2">
                      Estimasi Biaya <Badge className="bg-primary/20 text-primary hover:bg-primary/20 ml-auto border-none">Draft</Badge>
                    </CardTitle>
                     </CardHeader>
                  <CardContent className="relative z-10 pt-6">
                    <div className="text-4xl font-black mb-1">
                      {productType === 'pcb_print' ? `Rp ${estimatedPrice.toLocaleString('id-ID')}` : 'Rp 0'}
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">
                      {productType === 'pcb_print'
                        ? '*Harga belum termasuk ongkos kirim. Nilai mutlak akan dikonfirmasi admin setelah cek DFM Gerber.'
                        : '*Harga jasa desain & perakitan membutuhkan tinjauan manual dari Engineer kami sebelum deal.'}
                        </p>
                        
                    <div className="mt-8 p-4 rounded-xl bg-white/5 space-y-3">
                      <h4 className="text-xs font-black text-white flex items-center gap-2">
                        <Info className="w-4 h-4 text-primary" />
                        Alur Setelah Ini
                      </h4>
                      <ul className="space-y-2 text-xs text-slate-300 font-medium">
                        <li>1. Order masuk ke status <strong className="text-white">PENDING</strong></li>
                        <li>2. Admin Setya Abadi me-review spesifikasi</li>
                        <li>3. Tagihan dirilis jika dokumen valid</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
               </div>
             )}
          </div>
        </div>
      </div>
    </MotionPage>
  );
}
