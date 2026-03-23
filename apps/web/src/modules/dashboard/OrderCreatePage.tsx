import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Layers, Upload, Info, ChevronRight, ChevronLeft, Loader2, AlertTriangle, FileText, PenTool, Wrench, MapPin, CheckCircle2, ArrowLeft, Hexagon, Shield, ChevronDown, ChevronUp } from 'lucide-react';
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
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { FileUpload } from '@/components/ui/file-upload';
import { useToast } from '@/components/ui/use-toast';

const MASKING_OPTIONS = [
  { value: 'ya_merah', label: 'Ya, warna merah', color: '#ef4444' },
  { value: 'ya_biru', label: 'Ya, warna biru', color: '#3b82f6' },
  { value: 'ya_hijau', label: 'Ya, warna hijau', color: '#22c55e' },
  { value: 'ya_hitam', label: 'Ya, warna hitam', color: '#1e293b' },
  { value: 'ya_putih', label: 'Ya, warna putih', color: '#f1f5f9' },
  { value: 'tidak', label: 'Tidak', color: '' },
];

const SILKSCREEN_OPTIONS = [
  { value: 'ya_putih', label: 'Ya, warna putih' },
  { value: 'ya_hitam', label: 'Ya, warna hitam' },
  { value: 'tidak', label: 'Tidak' },
];

export default function OrderCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const { user } = useAuthStore();
  const actualUser = (user as any)?.user || user;

  const [step, setStep] = useState(1);
  const [pricingParams, setPricingParams] = useState<any>(null);
  const [productType, setProductType] = useState<'pcb_print' | 'design' | 'assembly'>('pcb_print');
  const [showInfo, setShowInfo] = useState(true);
  
  const [form, setForm] = useState({
    width: 10,
    height: 10,
    quantity: 5,
    layers: 'single',
    material: 'FR4',
    masking_top: 'ya_hijau',
    masking_bottom: 'ya_hijau',
    silkscreen: 'ya_putih',
    board_shape: 'kotak',
    design_description: '',
    component_count: 50,
    notes: '',
    file: null as File | null,
  });

  const [useCustomAddress, setUseCustomAddress] = useState(false);
  const formikAddress = useFormik({
    initialValues: {
      full_address: '', province: '', city: '', district: '', village: '', postal_code: '', phone: ''
    },
    validationSchema: Yup.object({
      full_address: Yup.string().required('Alamat wajib diisi'),
      province: Yup.string().required('Provinsi wajib diisi'),
      city: Yup.string().required('Kota wajib diisi'),
      district: Yup.string().required('Kecamatan wajib diisi'),
      village: Yup.string().required('Desa/Kelurahan wajib diisi'),
      postal_code: Yup.string().required('Kode Pos wajib diisi'),
      phone: Yup.string().required('No HP wajib diisi')
    }),
    onSubmit: () => {}
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
    if (productType === 'design' || productType === 'assembly') return 0;
    if (!pricingParams) return 0;

    const area = form.width * form.height;
    const basePricePerCm = form.layers === 'single' ? pricingParams.single_layer_price : pricingParams.double_layer_price;
    let baseTotal = area * basePricePerCm;
    let extras = 0;

    if (form.masking_top !== 'tidak' || form.masking_bottom !== 'tidak') {
      extras += baseTotal * (pricingParams.soldermask_percent / 100);
    }
    if (form.silkscreen !== 'tidak') {
      extras += baseTotal * (pricingParams.silkscreen_percent / 100);
    }

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
      addToast({ title: 'Pesanan Berhasil', description: 'Pesanan Anda berhasil disubmit.' });
      navigate('/dashboard');
    },
    onError: (error: any) => {
      addToast({ variant: 'destructive', title: 'Gagal', description: error.response?.data?.message || 'Gagal membuat pesanan' });
    }
  });

  const handleSubmit = async () => {
    if ((productType === 'pcb_print' || productType === 'design') && !form.file) {
      addToast({ variant: 'destructive', title: 'File Diperlukan', description: 'Silakan upload file yang dibutuhkan terlebih dahulu!' });
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
      formData.append('details[masking_top]', form.masking_top);
      formData.append('details[masking_bottom]', form.masking_bottom);
      formData.append('details[silkscreen]', form.silkscreen);
      formData.append('details[board_shape]', form.board_shape);
    } else if (productType === 'design') {
      formData.append('details[description]', form.design_description);
    } else if (productType === 'assembly') {
      formData.append('details[component_count]', form.component_count.toString());
    }

    if (form.file) {
      formData.append('file', form.file);
    }

    if (useCustomAddress) {
      const addrErrors = await formikAddress.validateForm();
      if (Object.keys(addrErrors).length > 0) {
        formikAddress.setTouched({ full_address: true, province: true, city: true, district: true, village: true, postal_code: true, phone: true });
        addToast({ variant: 'destructive', title: 'Alamat Tidak Lengkap', description: 'Lengkapi semua field alamat kustom.' });
        return;
      }
      Object.entries(formikAddress.values).forEach(([key, val]) => {
        formData.append(`shipping_address[${key}]`, val);
      });
    }

    submitOrder(formData);
  };

  return (
    <MotionPage>
      <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 pcb-grid relative overflow-hidden pb-32">
        <div className="max-w-5xl mx-auto space-y-8">
          <Button variant="outline" onClick={() => navigate('/dashboard')} className="bg-white flex items-center gap-2 w-fit">
            <ArrowLeft className="w-4 h-4" /> Kembali ke Dashboard
          </Button>

          {/* Header & Steps */}
          <div className="flex flex-col items-center justify-center text-center gap-8 mb-10">
            <div>
              <h1 className="text-3xl font-black">Buat Pesanan Baru</h1>
              <p className="text-muted-foreground font-medium mt-2">Pilih layanan dan lengkapi spesifikasi pesanan Anda.</p>
            </div>
            
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
                       <div className={cn("h-1.5 w-full rounded-full transition-colors", step > s ? "bg-primary" : "bg-slate-200")} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className={cn(
            "items-start transition-none",
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
                            <p className="text-xs text-muted-foreground mt-1">Cetak prototype layer tunggal atau ganda</p>
                          </div>
                        </CardContent>
                        {productType === 'pcb_print' && <div className="absolute top-3 right-3"><CheckCircle2 className="w-5 h-5 text-primary" /></div>}
                      </Card>

                      <Card className="relative overflow-hidden border-slate-200 bg-slate-50/50 opacity-60 cursor-not-allowed">
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-900/5 backdrop-blur-[1px]">
                          <Badge className="bg-slate-800 text-white font-black text-[10px]">Coming Soon</Badge>
                        </div>
                        <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                          <div className="p-4 rounded-md bg-slate-200 text-slate-400"><PenTool className="w-8 h-8" /></div>
                          <div><h3 className="font-bold text-slate-400">Custom Design</h3><p className="text-xs text-slate-400 mt-1">Skema menjadi desain layout</p></div>
                        </CardContent>
                      </Card>

                      <Card className="relative overflow-hidden border-slate-200 bg-slate-50/50 opacity-60 cursor-not-allowed">
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-900/5 backdrop-blur-[1px]">
                          <Badge className="bg-slate-800 text-white font-black text-[10px]">Coming Soon</Badge>
                        </div>
                        <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                          <div className="p-4 rounded-md bg-slate-200 text-slate-400"><Wrench className="w-8 h-8" /></div>
                          <div><h3 className="font-bold text-slate-400">PCB Assembly</h3><p className="text-xs text-slate-400 mt-1">Solder manual low volume</p></div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="flex justify-end mt-8">
                      <Button size="lg" className="h-12 px-8" onClick={() => setStep(2)}>
                        Lanjut: Detail Spesifikasi <ChevronRight className="ml-2 w-5 h-5" />
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 2: SPESIFIKASI DINAMIS */}
                {step === 2 && (
                  <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">

                    {productType === 'pcb_print' && (
                      <>
                        {/* Info Card */}
                        <Card className="border-amber-200 bg-amber-50/50 shadow-sm overflow-hidden">
                          <CardHeader className="py-4 border-b border-amber-100 flex flex-row items-center justify-between cursor-pointer" onClick={() => setShowInfo(!showInfo)}>
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-amber-100 text-amber-600 rounded-lg"><Info className="w-5 h-5" /></div>
                              <CardTitle className="text-sm font-bold text-amber-900">Biaya Cetak PCB — Ketentuan & Target Pengerjaan</CardTitle>
                            </div>
                            {showInfo ? <ChevronUp className="w-5 h-5 text-amber-600" /> : <ChevronDown className="w-5 h-5 text-amber-600" />}
                          </CardHeader>
                          <AnimatePresence>
                            {showInfo && (
                              <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                                <CardContent className="p-5 pt-4 text-xs font-medium text-amber-800 space-y-3">
                                  <p className="font-bold text-amber-900">Mohon diisi sesuai dengan data sebenarnya. Kesalahan pengisian data dapat berakibat pada keterlambatan pemrosesan pesanan atau bahkan ditolak.</p>
                                  <div className="space-y-1">
                                    <p className="font-bold text-amber-900">Target pengerjaan:</p>
                                    <ul className="list-disc list-inside space-y-0.5 text-amber-800">
                                      <li><strong>2 hari kerja</strong> — PCB non masking/silkscreen</li>
                                      <li><strong>3 hari kerja</strong> — PCB dengan masking/silkscreen</li>
                                      <li><strong>4 hari kerja</strong> — PCB double layer (jumlah pesanan di bawah 10 pcs)</li>
                                      <li>Jika lebih dari 10 pcs, menyesuaikan beban kerja</li>
                                    </ul>
                                    <p className="text-[10px] italic">(Minggu/tgl merah tidak termasuk)</p>
                                  </div>
                                  <div className="space-y-1 pt-2 border-t border-amber-200">
                                    <p className="font-bold text-amber-900">Ketentuan Desain PCB:</p>
                                    <ul className="list-disc list-inside space-y-0.5">
                                      <li>Lebar jalur min <strong>0.3 mm</strong></li>
                                      <li>Jarak antar jalur (clearance) min <strong>0.5 mm</strong></li>
                                      <li>Diameter drill lubang via/vias (through hole) untuk PCB double layer = min <strong>0.8 mm</strong></li>
                                    </ul>
                                    <p className="text-red-600 font-bold mt-2">⚠ Jika ada jalur yang short karena melanggar ketentuan, maka hal tsb di luar tanggung jawab kami.</p>
                                  </div>
                                </CardContent>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </Card>

                        {/* Ukuran PCB */}
                        <Card className="border-slate-200 shadow-sm">
                          <CardHeader className="bg-slate-50/50 border-b">
                            <CardTitle className="text-base flex items-center gap-2">
                              <Layers className="w-5 h-5 text-primary" /> Ukuran PCB
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Panjang (cm)</label>
                              <Input type="number" value={form.width} onChange={(e) => setForm({ ...form, width: Number(e.target.value) })} min={1} />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Lebar (cm)</label>
                              <Input type="number" value={form.height} onChange={(e) => setForm({ ...form, height: Number(e.target.value) })} min={1} />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Jumlah (Quantity) <span className="text-muted-foreground normal-case">pcs</span></label>
                              <Input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} min={1} />
                            </div>
                          </CardContent>
                        </Card>

                        {/* Layer & Tipe PCB */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <Card className="border-slate-200 shadow-sm">
                            <CardHeader className="bg-slate-50/50 border-b py-4">
                              <CardTitle className="text-sm flex items-center gap-2"><Layers className="w-4 h-4 text-primary" /> Layer</CardTitle>
                            </CardHeader>
                            <CardContent className="p-5 grid grid-cols-2 gap-3">
                              {[{ id: 'single', label: 'Single' }, { id: 'double', label: 'Double' }].map(l => (
                                <button key={l.id} onClick={() => setForm({ ...form, layers: l.id })} className={cn(
                                  "py-3 rounded-xl border-2 font-bold text-sm transition-none",
                                  form.layers === l.id ? "border-primary bg-primary/5 text-primary" : "border-slate-200 bg-white hover:border-slate-300"
                                )}>
                                  {l.label}
                                </button>
                              ))}
                            </CardContent>
                          </Card>

                          <Card className="border-slate-200 shadow-sm">
                            <CardHeader className="bg-slate-50/50 border-b py-4">
                              <CardTitle className="text-sm flex items-center gap-2"><Cpu className="w-4 h-4 text-primary" /> Tipe PCB</CardTitle>
                            </CardHeader>
                            <CardContent className="p-5 grid grid-cols-2 gap-3">
                              {[{ id: 'FR2', label: 'FR2 (Pertinaks)' }, { id: 'FR4', label: 'FR4 (Fiber)' }].map(m => (
                                <button key={m.id} onClick={() => setForm({ ...form, material: m.id })} className={cn(
                                  "py-3 rounded-xl border-2 font-bold text-sm transition-none",
                                  form.material === m.id ? "border-primary bg-primary/5 text-primary" : "border-slate-200 bg-white hover:border-slate-300"
                                )}>
                                  {m.label}
                                </button>
                              ))}
                            </CardContent>
                          </Card>
                        </div>

                        {/* Masking Top & Bottom */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <Card className="border-slate-200 shadow-sm">
                            <CardHeader className="bg-slate-50/50 border-b py-4">
                              <CardTitle className="text-sm flex items-center gap-2"><Shield className="w-4 h-4 text-primary" /> Masking Layer Atas?</CardTitle>
                            </CardHeader>
                            <CardContent className="p-5 space-y-2">
                              {MASKING_OPTIONS.map(opt => (
                                <button key={opt.value} onClick={() => setForm({ ...form, masking_top: opt.value })} className={cn(
                                  "w-full flex items-center gap-3 py-2.5 px-4 rounded-lg border-2 text-sm font-bold transition-none text-left",
                                  form.masking_top === opt.value ? "border-primary bg-primary/5 text-primary" : "border-slate-100 bg-white hover:border-slate-200 text-slate-600"
                                )}>
                                  {opt.color && <span className="w-4 h-4 rounded-full border border-slate-300 shrink-0" style={{ backgroundColor: opt.color }} />}
                                  {opt.label}
                                </button>
                              ))}
                            </CardContent>
                          </Card>

                          <Card className="border-slate-200 shadow-sm">
                            <CardHeader className="bg-slate-50/50 border-b py-4">
                              <CardTitle className="text-sm flex items-center gap-2"><Shield className="w-4 h-4 text-primary" /> Masking Layer Bawah?</CardTitle>
                            </CardHeader>
                            <CardContent className="p-5 space-y-2">
                              {MASKING_OPTIONS.map(opt => (
                                <button key={opt.value} onClick={() => setForm({ ...form, masking_bottom: opt.value })} className={cn(
                                  "w-full flex items-center gap-3 py-2.5 px-4 rounded-lg border-2 text-sm font-bold transition-none text-left",
                                  form.masking_bottom === opt.value ? "border-primary bg-primary/5 text-primary" : "border-slate-100 bg-white hover:border-slate-200 text-slate-600"
                                )}>
                                  {opt.color && <span className="w-4 h-4 rounded-full border border-slate-300 shrink-0" style={{ backgroundColor: opt.color }} />}
                                  {opt.label}
                                </button>
                              ))}
                            </CardContent>
                          </Card>
                        </div>

                        {/* Silkscreen & Board Shape */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <Card className="border-slate-200 shadow-sm">
                            <CardHeader className="bg-slate-50/50 border-b py-4">
                              <CardTitle className="text-sm flex items-center gap-2"><PenTool className="w-4 h-4 text-primary" /> Silkscreen (Label Komponen)?</CardTitle>
                            </CardHeader>
                            <CardContent className="p-5 space-y-2">
                              {SILKSCREEN_OPTIONS.map(opt => (
                                <button key={opt.value} onClick={() => setForm({ ...form, silkscreen: opt.value })} className={cn(
                                  "w-full py-2.5 px-4 rounded-lg border-2 text-sm font-bold transition-none text-left",
                                  form.silkscreen === opt.value ? "border-primary bg-primary/5 text-primary" : "border-slate-100 bg-white hover:border-slate-200 text-slate-600"
                                )}>
                                  {opt.label}
                                </button>
                              ))}
                            </CardContent>
                          </Card>

                          <Card className="border-slate-200 shadow-sm">
                            <CardHeader className="bg-slate-50/50 border-b py-4">
                              <CardTitle className="text-sm flex items-center gap-2"><Hexagon className="w-4 h-4 text-primary" /> Bentuk PCB</CardTitle>
                            </CardHeader>
                            <CardContent className="p-5 grid grid-cols-1 gap-2">
                              {[{ id: 'kotak', label: 'Kotak' }, { id: 'custom', label: 'Selain kotak (custom)' }].map(b => (
                                <button key={b.id} onClick={() => setForm({ ...form, board_shape: b.id })} className={cn(
                                  "py-3 rounded-xl border-2 font-bold text-sm transition-none",
                                  form.board_shape === b.id ? "border-primary bg-primary/5 text-primary" : "border-slate-200 bg-white hover:border-slate-300"
                                )}>
                                  {b.label}
                                </button>
                              ))}
                            </CardContent>
                          </Card>
                        </div>

                        {/* File Upload */}
                        <Card className="border-slate-200 shadow-sm overflow-hidden">
                          <CardHeader className="bg-slate-50 border-b">
                             <CardTitle className="text-base flex items-center gap-2">
                               <Upload className="w-5 h-5 text-primary" /> File Desain <span className="text-red-500 ml-1 text-xs">* Wajib</span>
                             </CardTitle>
                             <CardDescription>Upload file Gerber (.zip/.rar) atau PDF desain Anda.</CardDescription>
                          </CardHeader>
                          <CardContent className="p-8">
                             <FileUpload 
                               value={form.file} 
                               onChange={(f) => setForm({...form, file: f})} 
                               accept=".zip,.rar,.pdf" 
                               maxSizeMB={5} 
                             />
                          </CardContent>
                        </Card>

                        {/* Catatan */}
                        <Card className="border-slate-200 shadow-sm">
                          <CardHeader className="bg-slate-50/50 border-b py-4">
                            <CardTitle className="text-sm">Catatan Tambahan (Opsional)</CardTitle>
                          </CardHeader>
                          <CardContent className="pt-6">
                            <Textarea 
                              className="min-h-[100px] resize-none" 
                              placeholder="Tulis catatan tambahan untuk tim produksi..." 
                              value={form.notes} 
                              onChange={(e: any) => setForm({ ...form, notes: e.target.value })} 
                            />
                          </CardContent>
                        </Card>
                      </>
                    )}

                    {productType === 'design' && (
                      <Card className="border-slate-200 shadow-sm">
                        <CardHeader className="bg-slate-50/50 border-b">
                          <CardTitle className="text-base flex items-center gap-2"><PenTool className="w-5 h-5 text-primary" /> Setup Kebutuhan Desain</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Deskripsi & Skema Fungsi</label>
                            <Textarea className="min-h-[150px] resize-none" placeholder="Jelaskan kebutuhan fungsionalitas..." value={form.design_description} onChange={(e: any) => setForm({ ...form, design_description: e.target.value })} />
                          </div>
                          <div className="space-y-4">
                             <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">Upload Referensi (PDF / Gambar)</label>
                             <FileUpload value={form.file} onChange={(f) => setForm({...form, file: f})} accept=".pdf,.png,.jpg,.jpeg,.zip" maxSizeMB={5} />
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {productType === 'assembly' && (
                      <Card className="border-slate-200 shadow-sm">
                        <CardHeader className="bg-slate-50/50 border-b">
                          <CardTitle className="text-base flex items-center gap-2"><Wrench className="w-5 h-5 text-primary" /> Setup Perakitan</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Estimasi Jumlah Komponen per Board</label>
                            <Input type="number" min={1} value={form.component_count} onChange={(e) => setForm({ ...form, component_count: Number(e.target.value) })} />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Catatan Assembly</label>
                            <Textarea className="min-h-[150px]" value={form.notes} onChange={(e: any) => setForm({ ...form, notes: e.target.value })} />
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    <div className="flex justify-between mt-8">
                      <Button variant="outline" className="h-12 px-6 border-slate-300" onClick={() => setStep(1)}>
                        <ChevronLeft className="mr-2 w-5 h-5" /> Kembali
                      </Button>
                      <Button size="lg" className="h-12 px-8" onClick={() => {
                        if ((productType === 'pcb_print' || productType === 'design') && !form.file) {
                          addToast({ variant: 'destructive', title: 'File Wajib', description: 'Upload file desain terlebih dahulu!' });
                          return;
                        }
                        setStep(3);
                      }}>
                        Lanjut: Review Order <ChevronRight className="ml-2 w-5 h-5" />
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
                          <p className="text-white/70 text-xs font-medium mt-1">Periksa semua detail sebelum submit.</p>
                        </div>
                        <Badge className="bg-white/20 text-white border-0 font-black">{productType.toUpperCase()}</Badge>
                      </div>
                      <CardContent className="p-0">
                        {/* Shipping */}
                        <div className="p-6 border-b border-slate-100">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-800 flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-primary" /> Alamat Pengiriman
                            </h4>
                            <div className="flex items-center p-1 bg-slate-100 rounded-lg">
                              <button onClick={() => setUseCustomAddress(false)} className={cn("px-3 py-1.5 rounded-md text-xs font-bold transition-all", !useCustomAddress ? "bg-white text-slate-900 shadow-sm" : "text-slate-500")}>Alamat Profil</button>
                              <button onClick={() => setUseCustomAddress(true)} className={cn("px-3 py-1.5 rounded-md text-xs font-bold transition-all", useCustomAddress ? "bg-white text-slate-900 shadow-sm" : "text-slate-500")}>Alamat Kustom</button>
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
                                Alamat belum diatur. Gunakan opsi "Alamat Kustom".
                              </div>
                            )
                          ) : (
                            <div className="bg-white p-5 rounded-xl border border-primary/30 shadow-sm space-y-4">
                              <div className="p-3 bg-primary/10 text-primary text-xs font-bold rounded-lg">
                                <Info className="w-4 h-4 inline mr-1" /> Alamat ini hanya berlaku untuk pesanan ini saja.
                              </div>
                              <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-600">Alamat Lengkap</label>
                                <Input name="full_address" value={formikAddress.values.full_address} onChange={formikAddress.handleChange} onBlur={formikAddress.handleBlur} placeholder="Nama jalan, RT/RW, Patokan" className={cn(formikAddress.touched.full_address && formikAddress.errors.full_address && "border-red-500")} />
                                {formikAddress.touched.full_address && formikAddress.errors.full_address && <p className="text-red-500 text-[10px] font-bold">{formikAddress.errors.full_address}</p>}
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                  <label className="text-xs font-bold text-slate-600">Provinsi</label>
                                  <Input name="province" value={formikAddress.values.province} onChange={formikAddress.handleChange} onBlur={formikAddress.handleBlur} className={cn(formikAddress.touched.province && formikAddress.errors.province && "border-red-500")} />
                                  {formikAddress.touched.province && formikAddress.errors.province && <p className="text-red-500 text-[10px] font-bold">{formikAddress.errors.province}</p>}
                                </div>
                                <div className="space-y-2">
                                  <label className="text-xs font-bold text-slate-600">Kota</label>
                                  <Input name="city" value={formikAddress.values.city} onChange={formikAddress.handleChange} onBlur={formikAddress.handleBlur} className={cn(formikAddress.touched.city && formikAddress.errors.city && "border-red-500")} />
                                  {formikAddress.touched.city && formikAddress.errors.city && <p className="text-red-500 text-[10px] font-bold">{formikAddress.errors.city}</p>}
                                </div>
                                <div className="space-y-2">
                                  <label className="text-xs font-bold text-slate-600">Kecamatan</label>
                                  <Input name="district" value={formikAddress.values.district} onChange={formikAddress.handleChange} onBlur={formikAddress.handleBlur} className={cn(formikAddress.touched.district && formikAddress.errors.district && "border-red-500")} />
                                  {formikAddress.touched.district && formikAddress.errors.district && <p className="text-red-500 text-[10px] font-bold">{formikAddress.errors.district}</p>}
                                </div>
                                <div className="space-y-2">
                                  <label className="text-xs font-bold text-slate-600">Desa/Kelurahan</label>
                                  <Input name="village" value={formikAddress.values.village} onChange={formikAddress.handleChange} onBlur={formikAddress.handleBlur} className={cn(formikAddress.touched.village && formikAddress.errors.village && "border-red-500")} />
                                  {formikAddress.touched.village && formikAddress.errors.village && <p className="text-red-500 text-[10px] font-bold">{formikAddress.errors.village}</p>}
                                </div>
                                <div className="space-y-2">
                                  <label className="text-xs font-bold text-slate-600">Kode Pos</label>
                                  <Input name="postal_code" value={formikAddress.values.postal_code} onChange={formikAddress.handleChange} onBlur={formikAddress.handleBlur} className={cn(formikAddress.touched.postal_code && formikAddress.errors.postal_code && "border-red-500")} />
                                  {formikAddress.touched.postal_code && formikAddress.errors.postal_code && <p className="text-red-500 text-[10px] font-bold">{formikAddress.errors.postal_code}</p>}
                                </div>
                                <div className="space-y-2">
                                  <label className="text-xs font-bold text-slate-600">No HP</label>
                                  <Input name="phone" value={formikAddress.values.phone} onChange={formikAddress.handleChange} onBlur={formikAddress.handleBlur} className={cn(formikAddress.touched.phone && formikAddress.errors.phone && "border-red-500")} />
                                  {formikAddress.touched.phone && formikAddress.errors.phone && <p className="text-red-500 text-[10px] font-bold">{formikAddress.errors.phone}</p>}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Detail Spesifikasi */}
                        <div className="p-6 border-b border-slate-100">
                          <h4 className="text-xs font-black uppercase tracking-widest text-slate-800 mb-4">Detail Produk</h4>
                          {productType === 'pcb_print' && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                              <div className="bg-slate-50 p-3 rounded-xl border">
                                <span className="text-muted-foreground block text-[10px] font-bold uppercase">Dimensi</span>
                                <span className="font-black">{form.width}×{form.height} cm</span>
                              </div>
                              <div className="bg-slate-50 p-3 rounded-xl border">
                                <span className="text-muted-foreground block text-[10px] font-bold uppercase">Quantity</span>
                                <span className="font-black">{form.quantity} pcs</span>
                              </div>
                              <div className="bg-slate-50 p-3 rounded-xl border">
                                <span className="text-muted-foreground block text-[10px] font-bold uppercase">Layer</span>
                                <span className="font-black capitalize">{form.layers}</span>
                              </div>
                              <div className="bg-slate-50 p-3 rounded-xl border">
                                <span className="text-muted-foreground block text-[10px] font-bold uppercase">Material</span>
                                <span className="font-black">{form.material}</span>
                              </div>
                              <div className="bg-slate-50 p-3 rounded-xl border">
                                <span className="text-muted-foreground block text-[10px] font-bold uppercase">Masking Atas</span>
                                <span className="font-black capitalize">{MASKING_OPTIONS.find(o => o.value === form.masking_top)?.label || form.masking_top}</span>
                              </div>
                              <div className="bg-slate-50 p-3 rounded-xl border">
                                <span className="text-muted-foreground block text-[10px] font-bold uppercase">Masking Bawah</span>
                                <span className="font-black capitalize">{MASKING_OPTIONS.find(o => o.value === form.masking_bottom)?.label || form.masking_bottom}</span>
                              </div>
                              <div className="bg-slate-50 p-3 rounded-xl border">
                                <span className="text-muted-foreground block text-[10px] font-bold uppercase">Silkscreen</span>
                                <span className="font-black capitalize">{SILKSCREEN_OPTIONS.find(o => o.value === form.silkscreen)?.label || form.silkscreen}</span>
                              </div>
                              <div className="bg-slate-50 p-3 rounded-xl border">
                                <span className="text-muted-foreground block text-[10px] font-bold uppercase">Bentuk</span>
                                <span className="font-black capitalize">{form.board_shape === 'kotak' ? 'Kotak' : 'Custom'}</span>
                              </div>
                            </div>
                          )}
                          {productType === 'design' && (
                            <div className="text-sm bg-slate-50 p-4 rounded-xl border">
                              <span className="text-muted-foreground block text-xs mb-1">Deskripsi</span>
                              <p className="font-medium">{form.design_description || '-'}</p>
                            </div>
                          )}
                          {productType === 'assembly' && (
                            <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-xl border">
                              <div><span className="text-muted-foreground block text-xs">Komponen</span><span className="font-bold">{form.component_count} pcs/board</span></div>
                              <div className="col-span-2"><span className="text-muted-foreground block text-xs">Catatan</span><p className="font-medium">{form.notes || '-'}</p></div>
                            </div>
                          )}

                          {form.file && (
                            <div className="mt-4 p-3 rounded-xl bg-primary/5 border border-primary/20 flex items-center gap-3">
                              <div className="p-2 bg-primary/20 rounded-lg text-primary"><FileText className="w-4 h-4" /></div>
                              <div>
                                <p className="font-bold text-xs text-slate-800">📎 {form.file.name}</p>
                                <p className="text-[10px] text-slate-500">{(form.file.size / 1024 / 1024).toFixed(2)} MB</p>
                              </div>
                            </div>
                          )}
                        </div>
                       </CardContent>
                     </Card>

                     <div className="flex justify-between">
                    <Button variant="outline" className="h-12 px-6 border-slate-300" onClick={() => setStep(2)}>
                        <ChevronLeft className="mr-2 w-5 h-5" /> Kembali
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
               <div className="lg:sticky top-24">
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
                        ? '*Harga belum termasuk ongkir. Nilai mutlak dikonfirmasi admin setelah cek DFM.'
                        : '*Harga membutuhkan tinjauan manual dari Engineer.'}
                        </p>
                        
                    <div className="mt-8 p-4 rounded-xl bg-white/5 space-y-3">
                      <h4 className="text-xs font-black text-white flex items-center gap-2">
                        <Info className="w-4 h-4 text-primary" /> Alur Setelah Ini
                      </h4>
                      <ul className="space-y-2 text-xs text-slate-300 font-medium">
                        <li>1. Order masuk ke status <strong className="text-white">PENDING</strong></li>
                        <li>2. Admin me-review spesifikasi</li>
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
