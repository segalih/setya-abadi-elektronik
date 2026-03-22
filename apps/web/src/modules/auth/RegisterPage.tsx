import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Cpu, User, Mail, Lock, Phone, MapPin, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import MotionPage from '@/components/shared/MotionWrapper';
import api from '@/services/api';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    full_address: '',
    province: '',
    city: '',
    district: '',
    village: '',
    postal_code: ''
  });

  const registerMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await api.post('/register', data);
      return response.data;
    },
    onSuccess: () => {
      alert('Registrasi berhasil! Silakan login untuk melanjutkan.');
      navigate('/login');
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || 'Registrasi gagal. Cek kembali data Anda (email mungkin sudah terdaftar).');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    registerMutation.mutate(formData);
  };

  return (
    <MotionPage>
      <div className="min-h-screen py-12 flex items-center justify-center p-6 bg-slate-50 pcb-grid relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -z-10" />
        
        <div className="w-full max-w-3xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="text-center">
            <Link to="/" className="inline-flex items-center gap-2 group mb-6">
              <div className="p-2 rounded-lg bg-primary">
                <Cpu className="w-6 h-6 text-white" />
              </div>
              <span className="font-black text-xl">SETYA ABADI</span>
            </Link>
            <h1 className="text-2xl font-black">Buat Akun Baru</h1>
            <p className="text-muted-foreground text-sm font-medium mt-1">Lengkapi data untuk keperluan pengiriman pesanan PCB Anda.</p>
          </div>

          <Card className="border-slate-100 shadow-xl shadow-slate-200/50">
            <CardHeader className="border-b bg-slate-50/50 rounded-t-xl mb-6">
              <CardTitle className="text-lg">Informasi Pendaftaran</CardTitle>
              <CardDescription>Seluruh field berikut dibutuhkan untuk akurasi alamat pengiriman.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Account Details */}
                <div className="space-y-4">
                   <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                     <User className="w-4 h-4 text-primary" /> Detail Akun
                   </h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="space-y-2">
                       <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Nama Lengkap</label>
                       <Input 
                         placeholder="Setya Andrian" 
                         required 
                         value={formData.name}
                         onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                       />
                     </div>
                     <div className="space-y-2">
                       <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Email Aktif</label>
                       <Input 
                         type="email" 
                         placeholder="nama@email.com" 
                         required 
                         value={formData.email}
                         onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                       />
                     </div>
                     <div className="space-y-2">
                       <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Password Baru</label>
                       <Input 
                         type="password" 
                         placeholder="Minimal 8 karakter" 
                         required 
                         value={formData.password}
                         onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                       />
                     </div>
                     <div className="space-y-2">
                       <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">No. WhatsApp</label>
                       <Input 
                         placeholder="0812xxxxxxxx" 
                         required 
                         value={formData.phone}
                         onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                       />
                     </div>
                   </div>
                </div>

                <hr className="border-slate-100" />

                {/* Shipping Details */}
                <div className="space-y-4">
                   <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                     <MapPin className="w-4 h-4 text-primary" /> Alamat Pengiriman
                   </h3>
                   <div className="space-y-4">
                      <div className="space-y-2">
                         <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Alamat Lengkap</label>
                         <Input 
                           placeholder="Jalan Merdeka No. 45, RT 01/RW 02, Patokan, ..." 
                           required 
                           value={formData.full_address}
                           onChange={(e) => setFormData({ ...formData, full_address: e.target.value })}
                         />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div className="space-y-2">
                           <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Provinsi</label>
                           <Input 
                             placeholder="ex: Jawa Timur" 
                             required 
                             value={formData.province}
                             onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                           />
                         </div>
                         <div className="space-y-2">
                           <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Kota / Kabupaten</label>
                           <Input 
                             placeholder="ex: Surabaya" 
                             required 
                             value={formData.city}
                             onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                           />
                         </div>
                         <div className="space-y-2">
                           <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Kecamatan (District)</label>
                           <Input 
                             placeholder="ex: Gubeng" 
                             required 
                             value={formData.district}
                             onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                           />
                         </div>
                         <div className="space-y-2">
                           <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Kelurahan (Village)</label>
                           <Input 
                             placeholder="ex: Airlangga" 
                             required 
                             value={formData.village}
                             onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                           />
                         </div>
                         <div className="space-y-2 md:col-span-2">
                           <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Kode Pos</label>
                           <Input 
                             placeholder="60286" 
                             required 
                             className="max-w-[200px]"
                             value={formData.postal_code}
                             onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                           />
                         </div>
                      </div>
                   </div>
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-100 flex items-center gap-2 text-xs font-bold text-red-500">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {errorMsg}
                  </div>
                )}

                <Button type="submit" className="w-full h-12 mt-8 text-base shadow-xl shadow-primary/20" disabled={registerMutation.isPending}>
                  {registerMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    <>
                      Daftar dan Buat Akun
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 border-t bg-slate-50/50 pt-6 rounded-b-xl">
              <div className="text-center text-sm text-muted-foreground">
                Sudah punya akun? <Link to="/login" className="text-primary font-bold hover:underline">Masuk di Sini</Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </MotionPage>
  );
}
