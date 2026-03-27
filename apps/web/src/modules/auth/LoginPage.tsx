import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Cpu, Mail, Lock, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import MotionPage from '@/components/shared/MotionWrapper';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/authStore';
import api from '@/services/api';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const queryClient = useQueryClient();
  const [errorMsg, setErrorMsg] = useState('');

  const formik = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema: Yup.object({
      email: Yup.string().email('Format email tidak valid').required('Email wajib diisi'),
      password: Yup.string().min(8, 'Password minimal 8 karakter').required('Password wajib diisi'),
    }),
    onSubmit: (values) => {
      setErrorMsg('');
      loginMutation.mutate(values);
    },
  });

  // 1. useMutation -> login
  const loginMutation = useMutation({
    mutationFn: async (credentials: typeof formik.values) => {
      const { data } = await api.post('/login', credentials);
      return data;
    },
    onSuccess: async (data) => {
      // 2. Save token
      localStorage.setItem('token', data.token);
      
      try {
        // 3. Call /me
        const userRes = await api.get('/me', {
           headers: { Authorization: `Bearer ${data.token}` }
        });
        
        // 4. Store user data globally and redirect
        const userData = userRes.data?.user || userRes.data?.data || userRes.data;
        setAuth(userData, data.token);
        queryClient.invalidateQueries({ queryKey: ['me'] }); // cache invalidation
        
        if (localStorage.getItem('pending_order_data')) {
           navigate('/order/create');
        } else if (userData?.role?.name === 'admin' || userData?.role?.name === 'supervisor' || userData?.role?.name === 'staff') {
          navigate('/backoffice');
        } else {
          navigate('/dashboard');
        }
      } catch (err) {
        setErrorMsg('Gagal memuat data profil. Silakan coba login kembali.');
        localStorage.removeItem('token');
      }
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || 'Email atau password salah.');
    }
  });

  return (
    <MotionPage>
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-slate-50 pcb-grid relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg aspect-square bg-primary/5 rounded-full blur-[100px] -z-10" />
        
        <div className="w-full max-w-md space-y-8  ">
          <div className="text-center">
            <Link to="/" className="inline-flex items-center gap-2 group mb-6">
              <div className="p-2 rounded-lg bg-primary">
                <Cpu className="w-6 h-6 text-white" />
              </div>
              <span className="font-black text-xl">SETYA ABADI</span>
            </Link>
            <h1 className="text-2xl font-black">Selamat Datang Kembali</h1>
            <p className="text-muted-foreground text-sm font-medium mt-1">Silakan masuk untuk memantau pesanan Anda.</p>
          </div>

          <Card className="border-slate-100 shadow-xl shadow-slate-200/50">
            <CardHeader>
              <CardTitle className="text-lg">Login Akun</CardTitle>
              <CardDescription>Masukkan email dan password Anda.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={formik.handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                    <Input 
                      type="email" 
                      id="email"
                      name="email"
                      placeholder="nama@email.com" 
                      className={cn("pl-10", formik.touched.email && formik.errors.email && "border-red-500 focus-visible:ring-red-500")}
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                  </div>
                  {formik.touched.email && formik.errors.email && (
                    <p className="text-red-500 text-[10px] font-bold mt-1 uppercase tracking-wider">{formik.errors.email}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground block text-left">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                    <Input 
                      type="password" 
                      id="password"
                      name="password"
                      placeholder="••••••••" 
                      className={cn("pl-10", formik.touched.password && formik.errors.password && "border-red-500 focus-visible:ring-red-500")}
                      value={formik.values.password}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                  </div>
                  {formik.touched.password && formik.errors.password && (
                    <p className="text-red-500 text-[10px] font-bold mt-1 uppercase tracking-wider">{formik.errors.password}</p>
                  )}
                </div>

                {errorMsg && (
                  <div className="p-3 bg-red-50 border border-red-100 flex items-center justify-center gap-2 text-xs font-bold text-red-600 rounded-md">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {errorMsg}
                  </div>
                )}

                <Button type="submit" className="w-full h-12 mt-4 text-sm font-bold tracking-wide uppercase" disabled={loginMutation.isPending}>
                  {loginMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    <>
                      Login ke Akun
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </>
                  )}
                </Button>
                
                <div className="text-center mt-4">
                  <a href="#" className="text-[11px] font-bold text-slate-500 hover:text-primary transition-colors">Lupa Password?</a>
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 border-t bg-slate-50/50 pt-6 rounded-b-md">
              <div className="text-center text-sm font-medium text-slate-600">
                Belum punya akun? <Link to="/register" className="text-primary font-black hover:underline">Buat Akun Baru</Link>
              </div>
            </CardFooter>
          </Card>
          
          <p className="text-center text-[10px] text-muted-foreground uppercase font-black tracking-widest">
            © 2026 Setya Abadi Elektronik
          </p>
        </div>
      </div>
    </MotionPage>
  );
}
