import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import MotionPage from '@/components/shared/MotionWrapper';
import api from '@/services/api';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const token = searchParams.get('token');
  const hasCalledRef = useRef(false);

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Sedang memverifikasi email Anda...');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Link verifikasi tidak valid atau tidak lengkap. Parameter token tidak ditemukan.');
      return;
    }

    // Prevent double call from React StrictMode
    if (hasCalledRef.current) return;
    hasCalledRef.current = true;

    const verifyEmail = async () => {
      try {
        await api.post('/verify-email', { token });
        setStatus('success');
        setMessage('Email Anda berhasil diverifikasi! Akun Anda sekarang sudah aktif sepenuhnya.');
      } catch (error: any) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Gagal memverifikasi email. Token mungkin sudah kadaluarsa atau tidak valid.');
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <MotionPage>
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 pcb-grid relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl opacity-50" />

        <motion.div 
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative z-10 w-full max-w-md"
        >
          <Card className="border-none shadow-2xl overflow-hidden bg-white/80 backdrop-blur-xl">
            <CardHeader className="text-center pt-10 pb-6 border-b border-slate-100">
              <div className="mx-auto w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-sm transition-colors duration-500 bg-white">
                {status === 'loading' && <Loader2 className="w-10 h-10 text-primary animate-spin" />}
                {status === 'success' && <CheckCircle2 className="w-10 h-10 text-emerald-500" />}
                {status === 'error' && <XCircle className="w-10 h-10 text-red-500" />}
              </div>
              <CardTitle className="text-2xl font-black tracking-tight">Verifikasi Email</CardTitle>
              <CardDescription className="text-xs font-bold uppercase tracking-widest mt-2 px-6">
                Setya Abadi Elektronik
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 text-center space-y-8">
              <p className="text-sm font-medium text-slate-600 leading-relaxed">
                {message}
              </p>

              {status !== 'loading' && (
                <div className="pt-4 space-y-3">
                  <Button 
                    onClick={() => navigate('/login')}
                    className="w-full h-12 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
                  >
                    Menuju Halaman Login <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  {status === 'error' && (
                    <Button 
                      variant="outline"
                      onClick={() => navigate('/dashboard')}
                      className="w-full h-10 rounded-xl font-bold text-xs"
                    >
                      Kembali ke Dashboard
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </MotionPage>
  );
}
