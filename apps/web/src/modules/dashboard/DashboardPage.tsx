import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Cpu, LogOut, LayoutDashboard, Package, Bell, User as UserIcon, Loader2, Info, Menu, Mail, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import MotionPage from '@/components/shared/MotionWrapper';
import { useAuthStore } from '@/store/authStore';
import api from '@/services/api';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function DashboardPage() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isSendingVerification, setIsSendingVerification] = useState(false);

  const actualUser = (user as any)?.user || user;
  const roleName = typeof actualUser?.role === 'string' ? actualUser.role : actualUser?.role?.name;

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const res = await api.get('/orders');
      return res.data?.data || res.data || [];
    },
    refetchInterval: 10000
  });

  useEffect(() => {
    if (roleName && ['admin', 'supervisor', 'staff'].includes(roleName)) {
      navigate('/backoffice', { replace: true });
    }
  }, [roleName, navigate]);

  const handleSendVerification = async () => {
    setIsSendingVerification(true);
    try {
      await api.post('/email/verification-notification');
      addToast({ title: 'Berhasil', description: 'Email verifikasi telah dikirim. Periksa inbox Anda.', variant: 'success' });
    } catch (error: any) {
      const msg = error.response?.data?.message || '';
      if (msg.toLowerCase().includes('already verified')) {
        // Email is already verified — refresh user data to update the banner
        try {
          const res = await api.get('/me');
          const store = useAuthStore.getState();
          if (store.token) store.setAuth(res.data, store.token);
        } catch {}
        addToast({ title: 'Info', description: 'Email Anda sudah terverifikasi.' });
      } else {
        addToast({ title: 'Gagal', description: msg || 'Gagal mengirim email verifikasi.', variant: 'destructive' });
      }
    } finally {
      setIsSendingVerification(false);
    }
  };

  // Filter & Pagination Logic
  const filteredOrders = orders.filter((o: any) => {
    const matchSearch = String(o.order_number).toLowerCase().includes(searchQuery.toLowerCase()) || String(o.product_type).toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'all' ? true : o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filteredOrders.length / pageSize);
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Reset to page 1 when filters change
  useEffect(() => { setCurrentPage(1); }, [searchQuery, statusFilter, pageSize]);

  const getStatusBadge = (status: string) => {
    const map: Record<string, { bg: string, text: string, label: string }> = {
      pending: { bg: 'bg-amber-50', text: 'text-amber-600', label: 'Pending' },
      reviewed: { bg: 'bg-blue-50', text: 'text-blue-600', label: 'Ditinjau' },
      in_production: { bg: 'bg-indigo-50', text: 'text-indigo-600', label: 'Produksi' },
      ready_to_ship: { bg: 'bg-cyan-50', text: 'text-cyan-600', label: 'Siap Kirim' },
      shipped: { bg: 'bg-emerald-50', text: 'text-emerald-600', label: 'Dikirim' },
      cancelled: { bg: 'bg-red-50', text: 'text-red-600', label: 'Dibatalkan' },
    };
    const s = map[status] || { bg: 'bg-slate-50', text: 'text-slate-600', label: status };
    return <Badge variant="outline" className={cn(s.bg, s.text, "border-0 font-bold px-3 py-1")}>{s.label}</Badge>;
  };

  return (
    <MotionPage>
      <div className="min-h-screen bg-slate-50 flex overflow-hidden">

        {/* Mobile Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
        )}

        {/* Sidebar */}
        <aside className={cn(
          "fixed inset-y-0 left-0 z-50 lg:relative glass border-r h-screen w-64 flex flex-col p-6 lg:translate-x-0",
          isMobileMenuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        )}>
          <div className="flex items-center gap-2 mb-10">
            <div className="p-1.5 rounded-lg bg-primary">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <span className="font-black tracking-tight">SETYA ABADI</span>
          </div>

          <nav className="space-y-2 flex-1">
            <Button variant="default" className="w-full justify-start px-4 gap-3 rounded-xl h-12" onClick={() => navigate('/dashboard')}>
              <LayoutDashboard className="w-5 h-5" />
              Dashboard
            </Button>
            
            <div className="pt-4 mt-4 border-t border-slate-100">
               <Button 
                 onClick={() => navigate('/order/create')}
                 className="w-full justify-start px-4 gap-3 rounded-xl h-12 bg-primary hover:bg-primary/90 text-white shadow-md shadow-primary/20"
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

          <div className="mt-auto pt-6 border-t border-slate-200">
            <div className="flex items-center gap-3 mb-4 p-2 rounded-xl bg-slate-100/50">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold shrink-0">
                {actualUser?.name?.charAt(0) || 'U'}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-black truncate">{actualUser?.name || 'User'}</div>
                <div className="text-[10px] text-muted-foreground uppercase">{roleName || 'User'}</div>
              </div>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="w-full justify-start px-4 gap-3 text-red-500 hover:bg-red-50 hover:text-red-600 h-12 rounded-xl border-red-200">
                  <LogOut className="w-5 h-5" />
                  Keluar Sesi
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-4xl p-8 border-none shadow-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-2xl font-black text-slate-800">Konfirmasi Logout</AlertDialogTitle>
                  <AlertDialogDescription className="text-sm font-medium text-slate-500 mt-2">
                    Apakah Anda yakin ingin logout? Sesi aktif Anda akan dihentikan.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="mt-8 gap-3 sm:gap-0">
                  <AlertDialogCancel className="rounded-xl border-none bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold h-12 px-6">Batal</AlertDialogCancel>
                  <AlertDialogAction onClick={() => { logout(); navigate('/'); }} className="rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold h-12 px-6 border-none shadow-lg shadow-red-500/20">Ya, Logout</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
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

              <div className="h-8 w-px bg-slate-200 hidden sm:block" />

              <AlertDialog>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button type="button" className="flex items-center gap-3 cursor-pointer group outline-none">
                      <div className="hidden sm:flex flex-col items-end">
                        <span className="text-xs font-black truncate max-w-[100px]">{actualUser?.name || 'User'}</span>
                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{roleName || 'User'}</span>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                        {actualUser?.name?.charAt(0) || 'U'}
                      </div>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 mt-2 p-2 rounded-2xl border-slate-100 shadow-xl bg-white">
                    <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-3 py-2">Akun Saya</DropdownMenuLabel>
                    <DropdownMenuItem className="rounded-xl cursor-pointer py-3 gap-3" onClick={() => navigate('/profile')}>
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      <span className="font-bold text-sm">Pengaturan Profil</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="my-2 bg-slate-50" />
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem className="rounded-xl cursor-pointer py-3 gap-3 text-red-500 focus:bg-red-50 focus:text-red-600">
                        <LogOut className="w-4 h-4" />
                        <span className="font-bold text-sm">Keluar Sesi</span>
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                  </DropdownMenuContent>
                </DropdownMenu>

                <AlertDialogContent className="rounded-4xl p-8 border-none shadow-2xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-2xl font-black text-slate-800">Konfirmasi Logout</AlertDialogTitle>
                    <AlertDialogDescription className="text-sm font-medium text-slate-500 mt-2">
                      Apakah Anda yakin ingin logout?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="mt-8 gap-3 sm:gap-0">
                    <AlertDialogCancel className="rounded-xl border-none bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold h-12 px-6">Batal</AlertDialogCancel>
                    <AlertDialogAction onClick={() => { logout(); navigate('/'); }} className="rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold h-12 px-6 border-none shadow-lg shadow-red-500/20">Ya, Logout</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10">
            {/* Email Verification Banner */}
            {actualUser && !actualUser.email_verified_at && (
              <Card className="border-amber-200 bg-amber-50/80 mb-6 shadow-sm">
                <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 text-amber-600 rounded-lg shrink-0"><Mail className="w-5 h-5" /></div>
                    <div>
                      <p className="font-bold text-amber-900 text-sm">Email belum diverifikasi</p>
                      <p className="text-xs text-amber-700">Verifikasi email Anda untuk mengakses semua fitur.</p>
                    </div>
                  </div>
                  <Button
                    onClick={handleSendVerification}
                    disabled={isSendingVerification}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs h-9 px-4 shrink-0"
                  >
                    {isSendingVerification ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Kirim Email Verifikasi'}
                  </Button>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              <Card className="lg:col-span-2 border-slate-100 shadow-sm flex flex-col">
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b bg-slate-50/30 gap-4">
                  <div>
                    <CardTitle className="text-lg">Riwayat Pesanan</CardTitle>
                    <CardDescription>Status produksi pesanan Anda saat ini.</CardDescription>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <input
                      type="text"
                      placeholder="Cari ID/Produk..."
                      className="h-9 px-3 rounded-md border border-slate-200 text-xs w-full sm:w-40 focus:outline-none focus:border-primary"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <select
                      className="h-9 px-3 rounded-md border border-slate-200 text-xs bg-white focus:outline-none focus:border-primary"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">Semua Status</option>
                      <option value="pending">Pending</option>
                      <option value="reviewed">Ditinjau</option>
                      <option value="in_production">Produksi</option>
                      <option value="ready_to_ship">Siap Kirim</option>
                      <option value="shipped">Dikirim</option>
                      <option value="cancelled">Dibatalkan</option>
                    </select>
                  </div>
                </CardHeader>
                <CardContent className="p-0 flex-1">
                  {isLoading ? (
                    <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
                  ) : paginatedOrders.length > 0 ? (
                    <>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="bg-slate-50/50 border-b text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                              <th className="p-4">Order ID</th>
                              <th className="p-4">Produk</th>
                              <th className="p-4">Status</th>
                                <th className="p-4">Bayar</th>
                                <th className="p-4 text-right">Aksi</th>
                              </tr>
                            </thead>
                            <tbody className="text-sm">
                              {paginatedOrders.map((order: any, i: number) => (
                                <tr key={i} className="border-b last:border-0 hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => navigate(`/order/${order.id}`)}>
                                  <td className="p-4 font-bold">#{order.order_number}</td>
                                  <td className="p-4">{order.product_type}</td>
                                  <td className="p-4">{getStatusBadge(order.status)}</td>
                                  <td className="p-4">
                                    <Badge variant="outline" className={cn(
                                      "font-bold text-[10px] border-0 px-2 py-0.5",
                                      order.payment_status === 'success' ? "bg-emerald-50 text-emerald-600" :
                                        order.payment_status === 'expired' ? "bg-red-50 text-red-600" :
                                          "bg-amber-50 text-amber-600"
                                    )}>
                                      {order.payment_status === 'success' ? 'Lunas' : order.payment_status === 'expired' ? 'Expired' : 'Belum'}
                                    </Badge>
                                  </td>
                                  <td className="p-4 text-right">
                                    <Button variant="ghost" size="sm" className="text-primary font-bold" onClick={(e) => { e.stopPropagation(); navigate(`/order/${order.id}`); }}>Details</Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Pagination */}
                        <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t gap-4">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>Tampilkan</span>
                            <select
                              value={pageSize}
                              onChange={(e) => setPageSize(Number(e.target.value))}
                              className="h-8 px-2 rounded border border-slate-200 text-xs bg-white"
                            >
                              <option value={5}>5</option>
                              <option value={10}>10</option>
                              <option value={20}>20</option>
                              <option value={50}>50</option>
                            </select>
                            <span>dari {filteredOrders.length} pesanan</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => setCurrentPage(p => p - 1)} className="h-8 w-8 p-0">
                              <ChevronLeft className="w-4 h-4" />
                            </Button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).slice(
                              Math.max(0, currentPage - 3),
                              Math.min(totalPages, currentPage + 2)
                            ).map(page => (
                              <Button
                                key={page}
                                variant={page === currentPage ? "default" : "outline"}
                                size="sm"
                                onClick={() => setCurrentPage(page)}
                                className="h-8 w-8 p-0 text-xs"
                              >
                                {page}
                              </Button>
                            ))}
                            <Button variant="outline" size="sm" disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)} className="h-8 w-8 p-0">
                              <ChevronRight className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </>
                    ) : filteredOrders.length === 0 && orders.length > 0 ? (
                      <div className="p-8 text-center text-slate-500 text-sm">Tidak ada pesanan yang sesuai kriteria.</div>
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
                    <p className="text-xs text-muted-foreground leading-relaxed mb-6 font-medium">Jam operasional: Senin - Sabtu, 07.00 - 18.00. Admin kami siap membantu via WhatsApp.</p>
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
