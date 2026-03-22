import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Cpu, Mail, Lock, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import MotionPage from '@/components/shared/MotionWrapper';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/authStore';
import api from '@/services/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const queryClient = useQueryClient();
  const [errorMsg, setErrorMsg] = useState('');
  const [formData, setFormData] = useState({ email: '', password: '' });

  // 1. useMutation -> login
  const loginMutation = useMutation({
    mutationFn: async (credentials: typeof formData) => {
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
        setAuth(userRes.data.data || userRes.data, data.token);
        queryClient.invalidateQueries({ queryKey: ['me'] }); // cache invalidation
        navigate('/dashboard');
      } catch (err) {
        setErrorMsg('Gagal memuat data profil. Silakan coba login kembali.');
        localStorage.removeItem('token');
      }
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || 'Email atau password salah.');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    loginMutation.mutate(formData);
  };

  return (
    <MotionPage>
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 pcb-grid relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg aspect-square bg-primary/5 rounded-full blur-[100px] -z-10" />
        
        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
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
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                    <Input 
                      type="email" 
                      placeholder="nama@email.com" 
                      className="pl-10"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Password</label>
                    <a href="#" className="text-[10px] font-bold text-primary hover:underline">Lupa Password?</a>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                    <Input 
                      type="password" 
                      placeholder="••••••••" 
                      className="pl-10"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-100 flex items-center gap-2 text-xs font-bold text-red-500">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {errorMsg}
                  </div>
                )}

                <Button type="submit" className="w-full h-12" disabled={loginMutation.isPending}>
                  {loginMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    <>
                      Login ke Dashboard
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 border-t bg-slate-50/50 pt-6">
              <div className="text-center text-sm text-muted-foreground">
                Belum punya akun? <Link to="/register" className="text-primary font-bold hover:underline">Daftar Sekarang</Link>
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
