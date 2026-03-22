import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Cpu, LogOut, LayoutDashboard, Package, Bell, User as UserIcon, Loader2, Info, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import MotionPage from '@/components/shared/MotionWrapper';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/auth.service';
import api from '@/services/api';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';

export default function DashboardPage() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Fallback for corrupted localstorage where user is nested
  const actualUser = (user as any)?.user || user;
  const roleName = typeof actualUser?.role === 'string' ? actualUser.role : actualUser?.role?.name;

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const res = await api.get('/orders');
      return res.data?.data || res.data || [];
    },
    refetchInterval: 10000 // 10 seconds polling
  });

  useEffect(() => {
    if (roleName && ['admin', 'supervisor', 'staff'].includes(roleName)) {
      navigate('/backoffice', { replace: true });
    }
  }, [roleName, navigate]);

  return (
    <MotionPage>
      <div className="min-h-screen bg-slate-50 flex overflow-hidden">

        {/* Mobile Overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden "
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={cn(
          "fixed inset-y-0 left-0 z-50 lg:relative glass border-r h-screen w-64 flex flex-col p-6   lg:translate-x-0",
          isMobileMenuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        )}>
          <div className="flex items-center gap-2 mb-10">
            <div className="p-1.5 rounded-lg bg-primary">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <span className="font-black tracking-tight">SETYA ABADI</span>
          </div>

          <nav className="space-y-2 flex-1">
            <Button variant="default" className="w-full justify-start gap-3 rounded-xl h-12" onClick={() => navigate('/dashboard')}>
              <LayoutDashboard className="w-5 h-5" />
              Dashboard
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-3 rounded-xl h-12 text-muted-foreground hover:text-primary">
              <Package className="w-5 h-5" />
              Riwayat Order
            </Button>
            
            <div className="pt-4 mt-4 border-t border-slate-100">
               <Button 
                 onClick={() => navigate('/order/create')}
                 className="w-full justify-center gap-2 rounded-xl h-12 bg-primary hover:bg-primary/90 text-white shadow-md shadow-primary/20"
               >
                 <Package className="w-5 h-5" />
                 Buat Pesanan Baru
               </Button>
            </div>
            <Button variant="ghost" className="w-full justify-start gap-3 rounded-xl h-12 text-muted-foreground hover:text-primary mt-2" onClick={() => navigate('/profile')}>
              <UserIcon className="w-5 h-5" />
              Pengaturan Profil
            </Button>
          </nav>

          <div className="mt-10 pt-6 border-t border-slate-200">
            <div className="flex items-center gap-3 mb-6 p-2 rounded-xl bg-slate-100/50">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                {actualUser?.name?.charAt(0) || 'U'}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-black truncate">{actualUser?.name || 'User'}</div>
                <div className="text-[10px] text-muted-foreground uppercase">{roleName || 'User'}</div>
              </div>
            </div>
            <Button onClick={logout} variant="ghost" className="w-full justify-start gap-3 text-red-500 hover:bg-red-50 hover:text-red-600 h-12 rounded-xl">
              <LogOut className="w-5 h-5" />
              Keluar Sesi
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 h-screen">
          <header className="flex justify-between items-center p-4 sm:p-6 lg:px-10 lg:pt-10 lg:pb-6 bg-slate-50 sticky top-0 z-30">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsMobileMenuOpen(true)}>
                <Menu className="w-6 h-6 text-slate-700" />
              </Button>
              <div>
                <h1 className="text-xl md:text-2xl font-black">Halo, {actualUser?.name?.split(' ')[0] || 'User'} 👋</h1>
                <p className="hidden md:block text-sm text-muted-foreground font-medium">Selamat datang di panel kontrol pesanan Anda.</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative p-2 rounded-xl border bg-white hover:bg-slate-50 cursor-pointer transition-colors group">
                <Bell className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full ring-2 ring-white" />
              </div>
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sesi Aktif</span>
                <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Sistem Online
                </span>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              <Card className="lg:col-span-2 border-slate-100 shadow-sm">
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b bg-slate-50/30 gap-4">
                  <div>
                    <CardTitle className="text-lg">Pesanan Terakhir</CardTitle>
                    <CardDescription>Status produksi PCB Anda saat ini.</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" className="h-9 font-bold bg-white shrink-0">Lihat Semua</Button>
                </CardHeader>
                <CardContent className="p-0">
                  {isLoading ? (
                    <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
                  ) : orders.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-slate-50/50 border-b text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                            <th className="p-4">Order ID</th>
                            <th className="p-4">Produk</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="text-sm">
                          {orders.map((order: any, i: number) => (
                            <tr key={i} className="border-b last:border-0 hover:bg-slate-50/50 transition-colors">
                              <td className="p-4 font-bold">#{order.order_number}</td>
                              <td className="p-4">{order.product_type}</td>
                              <td className="p-4">
                                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-bold px-3">
                                  {order.status}
                                </Badge>
                              </td>
                              <td className="p-4 text-right">
                                <Button variant="ghost" size="sm" className="text-primary font-bold">Details</Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-16 text-center">
                      <Package className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                      <p className="text-sm text-muted-foreground font-medium">Belum ada pesanan aktif.</p>
                      <Button className="mt-6 font-bold" variant="outline" onClick={() => navigate('/order/create')}>Mulai Buat Order</Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="space-y-8">
                <Card className="border-primary/20 bg-primary/5 shadow-none">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Info className="w-4 h-4 text-primary" />
                      Pusat Informasi
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-3 rounded-lg bg-white/50 text-xs leading-relaxed font-medium">
                      Standard pengerjaan prototyping saat ini adalah <strong>3-5 hari kerja</strong>. Harap pastikan file Gerber sesuai standard kami.
                    </div>
                    <Button variant="link" className="text-primary p-0 h-auto text-xs font-bold">Lihat Panduan Desain →</Button>
                  </CardContent>
                </Card>

                <Card className="border-slate-100 shadow-sm overflow-hidden">
                  <CardHeader className="bg-slate-50/50 border-b">
                    <CardTitle className="text-base">Butuh Bantuan?</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <p className="text-xs text-muted-foreground leading-relaxed mb-6 font-medium">Admin kami siap membantu konsultasi teknis PCB via WhatsApp.</p>
                    <Button className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white border-none font-bold">Chat WhatsApp Admin</Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>
        </div>
      </div>
    </MotionPage>
  );
}
