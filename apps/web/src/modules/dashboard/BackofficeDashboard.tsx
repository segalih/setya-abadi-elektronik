import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Package, 
  TrendingUp, 
  Clock, 
  AlertCircle, 
  ShieldCheck, 
  Zap, 
  ArrowUpRight,
  Activity,
  Cpu,
  CheckCircle2,
  Bell,
  Settings,
  Loader2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn, formatCurrency } from '@/lib/utils';
import api from '@/services/api';
import { useAuthStore } from '@/store/authStore';

export default function BackofficeDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const actualUser = (user as any)?.user || user;
  const isSupervisor = actualUser?.roles?.some((r: any) => r.name === 'supervisor');

  const [stats, setStats] = useState<any>(null);
  const [health, setHealth] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [priorityOrders, setPriorityOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [revenueFilter, setRevenueFilter] = useState('30'); // '7', '30', '90'
  const [logsPage, setLogsPage] = useState(1);
  const [logsTotalPages, setLogsTotalPages] = useState(1);

  const fetchData = async () => {
    try {
      const [healthResp, ordersResp, logsResp, priorityResp] = await Promise.all([
        api.get('/health').catch(() => ({ data: { status: 'down' } })),
        api.get('/backoffice/orders?limit=10'),
        api.get(`/backoffice/audit-logs?limit=10&page=${logsPage}`),
        api.get('/backoffice/orders/priority')
      ]);
      
      setHealth(healthResp.data);
      setIsOnline(healthResp.data.status === 'ok' || healthResp.data.status === 'up');
      setRecentOrders(ordersResp.data.data || []);
      setRecentLogs(logsResp.data.data || []);
      setLogsTotalPages(logsResp.data.last_page || 1);
      setPriorityOrders(priorityResp.data || []);
      
      const multiplier = revenueFilter === '7' ? 0.25 : revenueFilter === '90' ? 2.8 : 1;
      setStats({
        total_orders: Math.floor(124 * multiplier),
        pending_review: 8,
        active_production: 15,
        total_revenue: Math.floor(45200000 * multiplier),
        growth: 12.5
      });
    } catch (err) {
      console.error('Failed to fetch backoffice data', err);
      setIsOnline(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [revenueFilter, logsPage]);

  const statCards = [
    { title: 'Total Pesanan', value: stats?.total_orders || 0, icon: Package, color: 'text-primary', bg: 'bg-primary/10', desc: 'Total pesanan masuk bulan ini', show: true },
    { title: 'Total Omzet', value: formatCurrency(stats?.total_revenue || 0), icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50', desc: 'Pendapatan kotor terverifikasi', show: isSupervisor },
    { title: 'Antrian Review', value: stats?.pending_review || 0, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50', desc: 'Pesanan menunggu pengecekan file', show: true },
    { title: 'Proses Produksi', value: stats?.active_production || 0, icon: Activity, color: 'text-secondary', bg: 'bg-secondary/10', desc: 'PCB yang sedang berada di mesin', show: true },
  ].filter(card => card.show);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-10 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h1 className="text-3xl font-black">{isSupervisor ? 'Executive Overview' : 'Operator Dashboard'}</h1>
           <p className="text-muted-foreground font-medium">{isSupervisor ? 'Pantau performa operasional Setya Abadi Elektronik secara real-time.' : 'Kelola dan perbarui status antrian pesanan PCB.'}</p>
        </div>
        <div className="flex items-center gap-3">
            {isSupervisor && (
              <select 
                value={revenueFilter}
                onChange={(e) => setRevenueFilter(e.target.value)}
                className="h-11 px-4 rounded-xl font-bold bg-white border-2 border-slate-100 text-xs focus:ring-2 focus:ring-primary/20 outline-none hover:border-primary/20 transition-all"
              >
                <option value="7">Last 7 Days</option>
                <option value="30">Last 30 Days</option>
                <option value="90">Last 90 Days</option>
              </select>
            )}
            <div className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all",
              isOnline ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-red-50 border-red-100 text-red-600 animate-pulse"
            )}>
              <div className={cn("w-2 h-2 rounded-full", isOnline ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-red-500")} />
              <span className="text-[10px] font-black uppercase tracking-widest">{isOnline ? 'System Online' : 'API Offline'}</span>
            </div>
            <Badge className={cn("px-4 py-1.5 font-bold flex items-center gap-2 rounded-full", isSupervisor ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-primary/10 text-primary border-primary/20")}>
               <ShieldCheck className="w-4 h-4" />
               {isSupervisor ? 'Supervisor' : 'Staff'}
            </Badge>
            {isSupervisor && <Button className="h-11 rounded-xl font-bold bg-slate-900 shadow-xl shadow-slate-900/20 text-white hover:bg-slate-800">Generate Report</Button>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
         {statCards.map((stat, i) => (
           <Card key={i} className="border-none shadow-sm group hover:shadow-xl transition-all duration-300 overflow-hidden relative rounded-2xl">
              <div className="absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 opacity-10 group-hover:scale-150 transition-transform duration-500">
                 <stat.icon className={cn("w-full h-full", stat.color)} />
              </div>
              <CardHeader className="pb-2">
                 <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-colors", stat.bg)}>
                    <stat.icon className={cn("w-6 h-6", stat.color)} />
                 </div>
                 <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    {stat.title}
                 </CardTitle>
              </CardHeader>
              <CardContent>
                 <div className="text-3xl font-black mb-1 tracking-tighter">{stat.value}</div>
                 <p className="text-[11px] text-muted-foreground font-medium">{stat.desc}</p>
              </CardContent>
           </Card>
         ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="border-none shadow-sm rounded-2xl overflow-hidden flex flex-col">
          <CardHeader className="bg-slate-50/50 border-b flex flex-row items-center justify-between py-6">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                Recent Orders
              </CardTitle>
              <CardDescription className="text-xs">10 pesanan terbaru masuk sistem.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-primary font-bold text-xs" onClick={() => navigate('/backoffice/orders')}>View All</Button>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/30 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b">
                  <tr>
                    <th className="px-6 py-4">ID / Number</th>
                    <th className="px-6 py-4 text-center">Date</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentOrders.length > 0 ? recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer" onClick={() => navigate(`/backoffice/orders/${order.id}`)}>
                      <td className="px-6 py-4">
                        <div className="font-bold text-sm text-slate-800">{order.order_number || `#${order.id}`}</div>
                        <div className="text-[10px] text-muted-foreground font-medium">{order.product_type}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="text-xs font-black text-slate-600">{new Date(order.created_at).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className={cn(
                          "text-[9px] font-black uppercase px-2 py-0.5 rounded-full",
                          order.status === 'pending' ? "border-amber-200 text-amber-600 bg-amber-50" : "border-emerald-200 text-emerald-600 bg-emerald-50"
                        )}>
                          {order.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right font-black text-sm text-slate-700">
                        {formatCurrency(order.total_price || 0)}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-xs text-muted-foreground font-medium">Belum ada pesanan terbaru.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-2xl overflow-hidden flex flex-col">
          <CardHeader className="bg-slate-50/50 border-b flex flex-row items-center justify-between py-6">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Activity className="w-5 h-5 text-secondary" />
                Recent Activity
              </CardTitle>
              <CardDescription className="text-xs">5 aktivitas terbaru.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-secondary font-bold text-xs" onClick={() => navigate('/backoffice/audit')}>Logs</Button>
          </CardHeader>
          <CardContent className="p-0 flex-1 flex flex-col">
            <div className="relative p-6 space-y-6 flex-1">
              <div className="absolute left-[33px] top-6 bottom-6 w-px bg-slate-100" />
              {recentLogs.length > 0 ? recentLogs.map((log) => (
                <div key={log.id} className="flex gap-4 relative z-10">
                  <div className={cn(
                    "w-4 h-4 rounded-full mt-1 shrink-0 border-2 border-white ring-4 ring-slate-50",
                    log.action === 'created' ? "bg-emerald-500" : log.action === 'updated' ? "bg-amber-500" : "bg-red-500"
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 leading-tight">
                      <span className="text-primary">{log.user?.name || 'System'}</span> {log.action} a record in <span className="font-black text-slate-400">[{log.table_name}]</span>
                    </p>
                    <p className="text-[10px] text-muted-foreground font-medium mt-1">
                      {new Date(log.created_at).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                    </p>
                  </div>
                </div>
              )) : (
                <div className="text-center py-6 text-xs text-muted-foreground font-medium">Belum ada aktivitas audit.</div>
              )}
            </div>

            {/* Pagination Controls */}
            {logsTotalPages > 1 && (
              <div className="px-6 py-4 bg-slate-50 border-t flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                  Page {logsPage} of {logsTotalPages}
                </span>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    disabled={logsPage === 1}
                    onClick={() => setLogsPage(p => p - 1)}
                    className="h-8 w-8 rounded-lg border-2 hover:bg-primary hover:text-white transition-all shadow-sm"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon"
                    disabled={logsPage === logsTotalPages}
                    onClick={() => setLogsPage(p => p + 1)}
                    className="h-8 w-8 rounded-lg border-2 hover:bg-primary hover:text-white transition-all shadow-sm"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
         {isSupervisor && (
           <Card className="border-none shadow-sm flex flex-col rounded-2xl overflow-hidden">
              <CardHeader className="bg-slate-900 border-b text-white py-6">
                 <CardTitle className="text-sm flex items-center gap-2 font-black uppercase tracking-widest">
                    <Zap className="w-4 h-4 text-primary" />
                    System Metrics
                 </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 p-6 space-y-6">
                 <div className="space-y-4">
                    <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl">
                       <div className="flex items-center gap-3 text-slate-700">
                          <Cpu className="w-4 h-4" />
                          <span className="text-xs font-black uppercase">API Cluster</span>
                       </div>
                       <Badge className={cn("border-0 font-black text-[9px] px-2 py-0", isOnline ? "bg-emerald-500 text-white" : "bg-red-500 text-white")}>
                          {isOnline ? 'RUNNING' : 'DOWN'}
                       </Badge>
                    </div>
                    <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl">
                       <div className="flex items-center gap-3 text-slate-700">
                          <Bell className="w-4 h-4" />
                          <span className="text-xs font-black uppercase">Notif Svc</span>
                       </div>
                       <Badge className="bg-emerald-500 text-white border-0 font-black text-[9px] px-2 py-0">RUNNING</Badge>
                    </div>
                 </div>

                 <div className="pt-6 border-t mt-auto">
                    <div className="flex justify-between text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-3">
                       <span>Engine Load</span>
                       <span>{isOnline ? '24%' : '0%'}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                       <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: isOnline ? '24%' : '0%' }}
                          className="h-full bg-primary"
                       />
                    </div>
                 </div>
              </CardContent>
           </Card>
         )}

         <Card className={cn("border-none shadow-sm overflow-hidden rounded-2xl", isSupervisor ? "lg:col-span-2" : "lg:col-span-3")}>
            <CardHeader className={cn("border-b flex flex-row items-center justify-between py-6", isOnline ? "bg-emerald-50" : "bg-red-50")}>
               <div className="flex items-center gap-3">
                  <div className={cn("p-3 rounded-xl", isOnline ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600")}>
                     {isOnline ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                  </div>
                  <div>
                    <CardTitle className={cn("text-base font-bold", isOnline ? "text-emerald-900" : "text-red-900")}>
                      {isOnline ? 'Priority Resolution Required' : 'Critical Connectivity Alert'}
                    </CardTitle>
                    <CardDescription className={cn("text-xs", isOnline ? "text-emerald-700/70" : "text-red-700/70")}>
                      {isOnline ? 'Identifikasi antrian tersumbat (>24 jam).' : 'Gagal menghubungi server API pusat.'}
                    </CardDescription>
                  </div>
               </div>
            </CardHeader>
            <CardContent className="p-8 text-center bg-pcb-grid bg-white min-h-[160px] flex flex-col items-center justify-center">
               {isOnline ? (
                 <>
                   {priorityOrders.length > 0 ? (
                     <div className="w-full space-y-4">
                       <div className="flex items-center justify-center gap-3 mb-2">
                         <AlertTriangle className="w-8 h-8 text-amber-500 animate-pulse" />
                         <div className="text-left">
                           <h4 className="font-bold text-slate-800">{priorityOrders.length} Stuck Orders</h4>
                           <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Membutuhkan Resolusi Segera</p>
                         </div>
                       </div>
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                         {priorityOrders.slice(0, 4).map(order => (
                           <div key={order.id} onClick={() => navigate(`/backoffice/orders/${order.id}`)} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between hover:bg-slate-100 cursor-pointer transition-all">
                             <div className="text-left">
                               <div className="text-[10px] font-black text-slate-900 leading-none">#{order.order_number}</div>
                               <div className="text-[9px] font-bold text-slate-400 mt-1 uppercase">{order.status}</div>
                             </div>
                             <div className="text-[9px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                               {Math.floor((Date.now() - new Date(order.updated_at).getTime()) / (1000 * 60 * 60))}h
                             </div>
                           </div>
                         ))}
                       </div>
                       {priorityOrders.length > 4 && (
                         <Button variant="ghost" size="sm" className="text-[10px] font-black text-primary hover:bg-primary/5 h-8 mt-2" onClick={() => navigate('/backoffice/orders?status=pending')}>
                           LIHAT SEMUA {priorityOrders.length} PESANAN TERSUMBAT
                         </Button>
                       )}
                     </div>
                   ) : (
                     <div className="flex flex-col items-center py-6">
                       <CheckCircle2 className="w-10 h-10 text-emerald-500 mb-3" />
                       <h4 className="font-bold text-slate-800 uppercase tracking-tight">System Balanced</h4>
                       <p className="text-[10px] text-muted-foreground font-medium max-w-xs mx-auto mt-1 uppercase tracking-widest">
                          Semua pesanan berada dalam rentang SLA normal.
                       </p>
                     </div>
                   )}
                 </>
               ) : (
                 <>
                   <AlertTriangle className="w-10 h-10 text-red-500 mb-3" />
                   <h4 className="font-bold text-slate-800">API Connection Lost</h4>
                   <p className="text-xs text-muted-foreground font-medium max-w-xs mx-auto mt-1">
                      Silakan periksa koneksi internet Anda atau hubungi admin IT jika masalah berlanjut.
                   </p>
                 </>
               )}
            </CardContent>
         </Card>
      </div>

      {isSupervisor && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
         <div onClick={() => navigate('/backoffice/audit')} className="p-8 rounded-[2.5rem] bg-linear-to-br from-primary/10 to-transparent border border-white shadow-inner flex items-center gap-6 group hover:translate-y-[-4px] transition-all cursor-pointer">
            <div className="w-14 h-14 rounded-md bg-white shadow-sm flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
               <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
               <h4 className="font-extrabold text-sm mb-1 uppercase tracking-tight">Security Audit</h4>
               <p className="text-[10px] text-muted-foreground font-medium">Buka log aktivitas sistem harian.</p>
            </div>
            <ArrowUpRight className="ml-auto w-5 h-5 text-muted-foreground opacity-50" />
         </div>
         
         <div onClick={() => navigate('/backoffice/parameters')} className="p-8 rounded-[2.5rem] bg-linear-to-br from-secondary/10 to-transparent border border-white shadow-inner flex items-center gap-6 group hover:translate-y-[-4px] transition-all cursor-pointer">
            <div className="w-14 h-14 rounded-md bg-white shadow-sm flex items-center justify-center text-secondary group-hover:scale-110 transition-transform">
               <Settings className="w-7 h-7" />
            </div>
            <div>
               <h4 className="font-extrabold text-sm mb-1 uppercase tracking-tight">Config Params</h4>
               <p className="text-[10px] text-muted-foreground font-medium">Ubah variabel harga & produksi.</p>
            </div>
            <ArrowUpRight className="ml-auto w-5 h-5 text-muted-foreground opacity-50" />
         </div>

         <div className="p-8 rounded-[2.5rem] bg-linear-to-br from-accent/10 to-transparent border border-white shadow-inner flex items-center gap-6 group hover:translate-y-[-4px] transition-all cursor-not-allowed opacity-60">
            <div className="w-14 h-14 rounded-md bg-white shadow-sm flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
               <AlertCircle className="w-7 h-7" />
            </div>
            <div>
               <h4 className="font-extrabold text-sm mb-1 uppercase tracking-tight">System Logs</h4>
               <p className="text-[10px] text-muted-foreground font-medium">Status API & Server Health.</p>
            </div>
            <ArrowUpRight className="ml-auto w-5 h-5 text-muted-foreground opacity-50" />
         </div>
        </div>
      )}
    </div>
  );
}
