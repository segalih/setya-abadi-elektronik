import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MotionPage from '@/components/shared/MotionWrapper';

export default function NotFoundPage() {
  return (
    <MotionPage>
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 pcb-grid relative overflow-hidden text-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg aspect-square bg-primary/5 rounded-full blur-[100px] -z-10" />
        
        <motion.div
           initial={{ scale: 0.8, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           transition={{ type: "spring", stiffness: 200, damping: 20 }}
           className="w-24 h-24 bg-red-100 text-red-500 rounded-md flex items-center justify-center mb-8 shadow-xl shadow-red-500/10"
        >
           <AlertTriangle className="w-12 h-12" />
        </motion.div>

        <h1 className="text-6xl md:text-8xl font-black text-slate-800 mb-4 tracking-tighter">404</h1>
        <h2 className="text-2xl md:text-3xl font-black text-slate-700 mb-6">Halaman Tidak Ditemukan</h2>
        <p className="text-muted-foreground font-medium max-w-md mx-auto mb-10 text-sm md:text-base">
          Maaf, halaman yang Anda tuju tidak tersedia atau Anda tidak memiliki akses ke halaman ini.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
           <Link to="/">
              <Button size="lg" className="rounded-xl h-14 px-8 font-black shadow-lg shadow-primary/20 w-full sm:w-auto">
                 <Home className="w-5 h-5 mr-2" />
                 Kembali ke Beranda
              </Button>
           </Link>
           <Button variant="outline" size="lg" className="rounded-xl h-14 px-8 font-black w-full sm:w-auto" onClick={() => window.history.back()}>
              <ArrowLeft className="w-5 h-5 mr-2" />
              Halaman Sebelumnya
           </Button>
        </div>
      </div>
    </MotionPage>
  );
}
