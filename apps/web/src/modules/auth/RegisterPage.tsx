import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useToast } from '@/components/ui/use-toast';
import { Cpu, User, Mail, Lock, MapPin, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import MotionPage from '@/components/shared/MotionWrapper';
import api from '@/services/api';
import { cn } from '@/lib/utils';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [errorMsg, setErrorMsg] = useState('');

  // Ref untuk guard double-submit — selalu baca nilai terbaru tanpa stale closure
  const isPendingRef = useRef(false);

  const registerMutation = useMutation({
    mutationFn: async (data: Record<string, string>) => {
      const response = await api.post('/register', data);
      return response.data;
    },
    onMutate: () => { isPendingRef.current = true; },
    onSettled: () => { isPendingRef.current = false; },
    onSuccess: () => {
      addToast({
        title: "Registrasi Berhasil",
        description: "Akun berhasil dibuat! Silakan login untuk melanjutkan.",
      });
      navigate('/login');
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || 'Registrasi gagal. Cek kembali data Anda (email mungkin sudah terdaftar).');
    }
  });

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
      phone: '',
      full_address: '',
      province: '',
      city: '',
      district: '',
      village: '',
      postal_code: ''
    },
    validationSchema: Yup.object({
      name: Yup.string().min(3, 'Nama minimal 3 karakter').required('Nama Lengkap wajib diisi'),
      email: Yup.string().email('Format email tidak valid').required('Email Aktif wajib diisi'),
      password: Yup.string().min(8, 'Password minimal 8 karakter').required('Password Baru wajib diisi'),
      password_confirmation: Yup.string()
        .oneOf([Yup.ref('password')], 'Password tidak sama')
        .required('Konfirmasi Password wajib diisi'),
      phone: Yup.string().min(10, 'Nomor WhatsApp tidak valid').required('No. WhatsApp wajib diisi'),
      full_address: Yup.string().min(10, 'Alamat terlalu pendek').required('Alamat Lengkap wajib diisi'),
      province: Yup.string().required('Provinsi wajib diisi'),
      city: Yup.string().required('Kota/Kabupaten wajib diisi'),
      district: Yup.string().required('Kecamatan wajib diisi'),
      village: Yup.string().required('Kelurahan/Desa wajib diisi'),
      postal_code: Yup.string().required('Kode Pos wajib diisi'),
    }),
    onSubmit: (values) => {
      if (isPendingRef.current) return; // guard double-submit via ref
      setErrorMsg('');
      registerMutation.mutate(values);
    }
  });

  return (
    <MotionPage>
      <div className="min-h-screen py-8 sm:py-12 flex items-center justify-center p-4 sm:p-6 bg-slate-50 pcb-grid relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -z-10" />
        
        <div className="w-full max-w-3xl space-y-8  ">
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
              <form onSubmit={formik.handleSubmit} className="space-y-6">
                
                {/* Account Details */}
                <div className="space-y-4">
                   <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                     <User className="w-4 h-4 text-primary" /> Detail Akun
                   </h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="space-y-2">
                       <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Nama Lengkap</label>
                       <Input 
                         name="name"
                         placeholder="Setya Andrian" 
                         className={cn(formik.touched.name && formik.errors.name && "border-red-500 focus-visible:ring-red-500")}
                         value={formik.values.name}
                         onChange={formik.handleChange}
                         onBlur={formik.handleBlur}
                       />
                       {formik.touched.name && formik.errors.name && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase tracking-wider">{formik.errors.name}</p>}
                     </div>
                     <div className="space-y-2">
                       <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Email Aktif</label>
                       <Input 
                         type="email" 
                         name="email"
                         placeholder="nama@email.com" 
                         className={cn(formik.touched.email && formik.errors.email && "border-red-500 focus-visible:ring-red-500")}
                         value={formik.values.email}
                         onChange={formik.handleChange}
                         onBlur={formik.handleBlur}
                       />
                       {formik.touched.email && formik.errors.email && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase tracking-wider">{formik.errors.email}</p>}
                     </div>
                     <div className="space-y-2">
                       <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Password Baru</label>
                       <Input 
                         type="password" 
                         name="password"
                         placeholder="Minimal 8 karakter" 
                         className={cn(formik.touched.password && formik.errors.password && "border-red-500 focus-visible:ring-red-500")}
                         value={formik.values.password}
                         onChange={formik.handleChange}
                         onBlur={formik.handleBlur}
                       />
                       {formik.touched.password && formik.errors.password && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase tracking-wider">{formik.errors.password}</p>}
                     </div>
                     <div className="space-y-2">
                       <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Konfirmasi Password</label>
                       <Input 
                         type="password" 
                         name="password_confirmation"
                         placeholder="Ulangi password" 
                         className={cn(formik.touched.password_confirmation && formik.errors.password_confirmation && "border-red-500 focus-visible:ring-red-500")}
                         value={formik.values.password_confirmation}
                         onChange={formik.handleChange}
                         onBlur={formik.handleBlur}
                       />
                       {formik.touched.password_confirmation && formik.errors.password_confirmation && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase tracking-wider">{formik.errors.password_confirmation}</p>}
                     </div>
                     <div className="space-y-2">
                       <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">No. WhatsApp</label>
                       <Input 
                         name="phone"
                         placeholder="0812xxxxxxxx" 
                         className={cn(formik.touched.phone && formik.errors.phone && "border-red-500 focus-visible:ring-red-500")}
                         value={formik.values.phone}
                         onChange={formik.handleChange}
                         onBlur={formik.handleBlur}
                       />
                       {formik.touched.phone && formik.errors.phone && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase tracking-wider">{formik.errors.phone}</p>}
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
                           name="full_address"
                           placeholder="Jalan Merdeka No. 45, RT 01/RW 02, Patokan, ..." 
                           className={cn(formik.touched.full_address && formik.errors.full_address && "border-red-500 focus-visible:ring-red-500")}
                           value={formik.values.full_address}
                           onChange={formik.handleChange}
                           onBlur={formik.handleBlur}
                         />
                         {formik.touched.full_address && formik.errors.full_address && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase tracking-wider">{formik.errors.full_address}</p>}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div className="space-y-2">
                           <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Provinsi</label>
                           <Input 
                             name="province"
                             placeholder="ex: Jawa Timur" 
                             className={cn(formik.touched.province && formik.errors.province && "border-red-500 focus-visible:ring-red-500")}
                             value={formik.values.province}
                             onChange={formik.handleChange}
                             onBlur={formik.handleBlur}
                           />
                           {formik.touched.province && formik.errors.province && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase tracking-wider">{formik.errors.province}</p>}
                         </div>
                         <div className="space-y-2">
                           <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Kota / Kabupaten</label>
                           <Input 
                             name="city"
                             placeholder="ex: Surabaya" 
                             className={cn(formik.touched.city && formik.errors.city && "border-red-500 focus-visible:ring-red-500")}
                             value={formik.values.city}
                             onChange={formik.handleChange}
                             onBlur={formik.handleBlur}
                           />
                           {formik.touched.city && formik.errors.city && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase tracking-wider">{formik.errors.city}</p>}
                         </div>
                         <div className="space-y-2">
                           <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Kecamatan (District)</label>
                           <Input 
                             name="district"
                             placeholder="ex: Gubeng" 
                             className={cn(formik.touched.district && formik.errors.district && "border-red-500 focus-visible:ring-red-500")}
                             value={formik.values.district}
                             onChange={formik.handleChange}
                             onBlur={formik.handleBlur}
                           />
                           {formik.touched.district && formik.errors.district && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase tracking-wider">{formik.errors.district}</p>}
                         </div>
                         <div className="space-y-2">
                           <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Kelurahan (Village)</label>
                           <Input 
                             name="village"
                             placeholder="ex: Airlangga" 
                             className={cn(formik.touched.village && formik.errors.village && "border-red-500 focus-visible:ring-red-500")}
                             value={formik.values.village}
                             onChange={formik.handleChange}
                             onBlur={formik.handleBlur}
                           />
                           {formik.touched.village && formik.errors.village && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase tracking-wider">{formik.errors.village}</p>}
                         </div>
                         <div className="space-y-2 md:col-span-2">
                           <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Kode Pos</label>
                           <Input 
                             name="postal_code"
                             placeholder="60286" 
                             className={cn("max-w-[200px]", formik.touched.postal_code && formik.errors.postal_code && "border-red-500 focus-visible:ring-red-500")}
                             value={formik.values.postal_code}
                             onChange={formik.handleChange}
                             onBlur={formik.handleBlur}
                           />
                           {formik.touched.postal_code && formik.errors.postal_code && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase tracking-wider">{formik.errors.postal_code}</p>}
                         </div>
                      </div>
                   </div>
                </div>

                {errorMsg && (
                  <div className="p-3 bg-red-50 border border-red-100 flex items-center justify-center gap-2 text-xs font-bold text-red-600 rounded-md">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {errorMsg}
                  </div>
                )}

                <Button type="submit" className="w-full h-12 mt-8 text-sm font-bold tracking-wide uppercase" disabled={registerMutation.isPending}>
                  {registerMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    <>
                      Daftar dan Akun Baru
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 border-t bg-slate-50/50 pt-6 rounded-b-md">
              <div className="text-center text-sm font-medium text-slate-600">
                Sudah punya akun? <Link to="/login" className="text-primary font-black hover:underline">Masuk di Sini</Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </MotionPage>
  );
}
