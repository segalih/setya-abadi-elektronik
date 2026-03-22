import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Save, Loader2, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import api from '@/services/api';

export default function BackofficeParameters() {
  const [parameters, setParameters] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { addToast } = useToast();

  const fetchParameters = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/parameters');
      // Assuming API returns array of key-value pairs or an object
      const paramsObj = response.data.data.reduce((acc: any, curr: any) => {
        acc[curr.key] = curr.value;
        return acc;
      }, {});
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
      // Loop through parameters and update (since API might require individual updates or bulk)
      for (const [key, value] of Object.entries(parameters)) {
        await api.put(`/parameters/${key}`, { value });
      }
      addToast({
        title: "Konfigurasi Tersimpan",
        description: "Parameter sistem berhasil diperbarui.",
        variant: "success"
      });
    } catch (err) {
      addToast({
        title: "Gagal Menyimpan",
        description: "Terjadi kesalahan saat menyimpan parameter.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-24 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-8   max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h1 className="text-3xl font-black">System Parameters</h1>
           <p className="text-muted-foreground font-medium">Konfigurasi variabel global untuk perhitungan harga dan operasional.</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="h-12 px-6 rounded-md shadow-lg shadow-primary/20 bg-primary font-bold">
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
            Simpan Perubahan
        </Button>
      </div>

      <div className="grid gap-8">
        {/* Pricing Parameters */}
        <Card className="border-none shadow-sm overflow-hidden group">
          <div className="h-2 w-full bg-primary" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
               <div className="p-2 rounded-lg bg-primary/10 text-primary">
                 <Settings className="w-5 h-5" />
               </div>
               Perhitungan Harga PCB
            </CardTitle>
            <CardDescription>Variabel dasar yang digunakan algoritma pricing calculator.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
               <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Base Price (FR4 1L) / cm²</label>
                  <div className="relative">
                     <span className="absolute left-4 top-3 text-muted-foreground font-bold">Rp</span>
                     <Input 
                       className="pl-12 h-12 rounded-xl bg-slate-50 border-transparent focus:bg-white" 
                       value={parameters['base_price_cm2'] || ''}
                       onChange={(e) => handleChange('base_price_cm2', e.target.value)}
                     />
                  </div>
               </div>
               <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Setup Fee / Design</label>
                  <div className="relative">
                     <span className="absolute left-4 top-3 text-muted-foreground font-bold">Rp</span>
                     <Input 
                       className="pl-12 h-12 rounded-xl bg-slate-50 border-transparent focus:bg-white" 
                       value={parameters['setup_fee'] || ''}
                       onChange={(e) => handleChange('setup_fee', e.target.value)}
                     />
                  </div>
               </div>
            </div>

            <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl flex items-start gap-3">
               <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
               <p className="text-[11px] font-medium text-blue-800 leading-relaxed">
                  Perubahan harga hanya akan berlaku untuk pesanan baru yang dibuat setelah data disimpan. Order existing yang sudah ada tagihan tidak akan berubah.
               </p>
            </div>
          </CardContent>
        </Card>

        {/* Operational Parameters */}
        <Card className="border-none shadow-sm overflow-hidden group">
          <div className="h-2 w-full bg-secondary" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
               <div className="p-2 rounded-lg bg-secondary/10 text-secondary">
                 <Settings className="w-5 h-5" />
               </div>
               Operasional Sistem
            </CardTitle>
            <CardDescription>Limitasi dan konfigurasi notifikasi sistem.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
               <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Max Upload Size (MB)</label>
                  <Input 
                    type="number"
                    className="h-12 rounded-xl bg-slate-50 border-transparent focus:bg-white px-4" 
                    value={parameters['max_upload_mb'] || ''}
                    onChange={(e) => handleChange('max_upload_mb', e.target.value)}
                  />
               </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
