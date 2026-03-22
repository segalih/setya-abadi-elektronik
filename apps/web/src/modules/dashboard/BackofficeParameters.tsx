import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Save, Loader2, Info, ShieldCheck, Gauge, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import api from '@/services/api';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export default function BackofficeParameters() {
  const [parameters, setParameters] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { addToast } = useToast();

  const coreKeys = ['base_price_cm2', 'setup_fee', 'max_upload_mb'];

  const fetchParameters = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/parameters');
      const data = response.data.data || [];
      const paramsObj = data.reduce((acc: any, curr: any) => {
        acc[curr.key] = curr.value;
        return acc;
      }, {});

      // Ensure core keys exist at least in state
      coreKeys.forEach(key => {
        if (!(key in paramsObj)) paramsObj[key] = '0';
      });

      setParameters(paramsObj);
    } catch (err) {
      console.error('Failed to fetch parameters', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchParameters();
  }, []);

  const handleChange = (key: string, value: string) => {
    setParameters((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Loop through parameters and update
      for (const [key, value] of Object.entries(parameters)) {
        await api.put(`/parameters/${key}`, { value });
      }
      addToast({
        title: "Konfigurasi Tersimpan",
        description: "Semua parameter sistem berhasil diperbarui secara permanen.",
        variant: "success"
      });
    } catch (err) {
      addToast({
        title: "Gagal Menyimpan",
        description: "Terjadi kesalahan saat sinkronisasi parameter ke database.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-24 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary opacity-20" />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Configuration...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-5xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter">System Engine Parameters</h1>
          <p className="text-muted-foreground font-medium">Pengaturan variabel algoritma pricing dan batasan operasional Setya Abadi.</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" onClick={fetchParameters} className="h-14 px-6 rounded-2xl border-2 font-black uppercase tracking-widest text-[10px]">
            Discard Changes
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="h-14 px-8 rounded-2xl shadow-2xl shadow-primary/30 bg-primary text-white font-black uppercase tracking-widest text-[10px]">
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin mr-3" /> : <Save className="w-5 h-5 mr-3" />}
            Commit Parameters
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Pricing Parameters */}
          <Card className="border-none shadow-sm overflow-hidden rounded-[2.5rem] bg-white group hover:shadow-xl transition-all duration-500">
            <div className="h-3 w-full bg-gradient-to-r from-primary to-slate-900" />
            <CardHeader className="p-10 pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-black flex items-center gap-3">
                    <Gauge className="w-7 h-7 text-primary" />
                    Core Pricing Latency
                  </CardTitle>
                  <CardDescription className="font-bold opacity-60">Variabel dasar perhitungan otomatis (Instant Quote Engine).</CardDescription>
                </div>
                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 font-black px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest">
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  Kernel Safe
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-10 pt-0 space-y-10">
              <div className="grid sm:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    <span>Base Price (FR4 1L)</span>
                    <span className="text-primary italic">/ CM²</span>
                  </div>
                  <div className="relative group/input">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-black group-focus-within/input:text-primary transition-colors">Rp</span>
                    <input
                      type="number"
                      className="w-full pl-16 pr-6 h-16 rounded-[1.25rem] bg-slate-50 border-2 border-transparent focus:bg-white focus:border-primary/20 transition-all font-black text-lg outline-none"
                      value={parameters['base_price_cm2'] || '0'}
                      onChange={(e) => handleChange('base_price_cm2', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    <span>Fixed Setup Fee</span>
                    <span className="text-primary italic">/ Project</span>
                  </div>
                  <div className="relative group/input">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-black group-focus-within/input:text-primary transition-colors">Rp</span>
                    <input
                      type="number"
                      className="w-full pl-16 pr-6 h-16 rounded-[1.25rem] bg-slate-50 border-2 border-transparent focus:bg-white focus:border-primary/20 transition-all font-black text-lg outline-none"
                      value={parameters['setup_fee'] || '0'}
                      onChange={(e) => handleChange('setup_fee', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-[1.5rem] bg-amber-50 border border-amber-100 flex gap-4">
                <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-[10px] font-black uppercase tracking-widest text-amber-900 mb-1">Financial Impact Warning</h5>
                  <p className="text-xs font-medium text-amber-800/80 leading-relaxed">
                    Perubahan pada <b>Base Price</b> akan langsung berdampak pada seluruh perhitungan <i>Quote</i> baru. Harap verifikasi kurs dan harga bahan baku (FR4) sebelum melakukan perubahan.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Operational Parameters */}
          <Card className="border-none shadow-sm overflow-hidden rounded-[2.5rem] bg-white group hover:shadow-xl transition-all duration-500">
            <div className="h-3 w-full bg-slate-900" />
            <CardHeader className="p-10 pb-6">
              <CardTitle className="text-2xl font-black flex items-center gap-3">
                <Settings className="w-7 h-7 text-slate-900" />
                Operational Constrains
              </CardTitle>
              <CardDescription className="font-bold opacity-60">Limitasi sistem untuk stabilitas infrastruktur.</CardDescription>
            </CardHeader>
            <CardContent className="p-10 pt-0">
              <div className="grid sm:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    <span>Design File Max Size</span>
                    <span className="text-slate-900 italic">MB / Upload</span>
                  </div>
                  <input
                    type="number"
                    className="w-full px-6 h-16 rounded-[1.25rem] bg-slate-50 border-2 border-transparent focus:bg-white focus:border-primary/20 transition-all font-black text-lg outline-none"
                    value={parameters['max_upload_mb'] || '20'}
                    onChange={(e) => handleChange('max_upload_mb', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="border-none shadow-sm rounded-[2.5rem] bg-slate-900 text-white p-10 relative overflow-hidden h-fit">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <ShieldCheck className="w-40 h-40 -mr-16 -mt-16" />
            </div>
            <h3 className="text-2xl font-black italic tracking-tighter mb-6 relative z-10">Admin Policy</h3>
            <div className="space-y-6 relative z-10">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h5 className="text-[11px] font-black text-white uppercase tracking-widest">Audit Tracking</h5>
                  <p className="text-[11px] text-slate-400 font-medium leading-relaxed mt-1">Setiap mutasi parameter akan dicatat secara permanen dalam Audit Log sistem.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h5 className="text-[11px] font-black text-white uppercase tracking-widest">Live Integration</h5>
                  <p className="text-[11px] text-slate-400 font-medium leading-relaxed mt-1">Parameter bersifat dinamis dan langsung terbaca oleh Frontend Calculator.</p>
                </div>
              </div>
            </div>
          </Card>

          <div className="p-10 rounded-[2.5rem] bg-white border-2 border-slate-100 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-6">
              <Info className="w-10 h-10 text-slate-200" />
            </div>
            <h4 className="font-extrabold text-slate-800 mb-2 underline decoration-primary decoration-4">Operational Status</h4>
            <p className="text-xs text-muted-foreground font-medium">Versi Engine 2.1.0-stable</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckCircle2({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
