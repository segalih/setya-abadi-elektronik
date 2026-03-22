import { useState, useEffect } from 'react';
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
  Settings
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import api from '@/services/api';

export default function BackofficeDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [health, setHealth] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [healthResp] = await Promise.all([
          api.get('/health'),
          // Optional: api.get('/backoffice/stats')
        ]);
        setHealth(healthResp.data);
        
        // Mocking some stats since we might not have a dedicated stats endpoint yet
        setStats({
          total_orders: 124,
          pending_review: 8,
          active_production: 15,
          total_revenue: 45200000,
          growth: 12.5
        });
      } catch (err) {
        console.error('Failed to fetch backoffice data', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const statCards = [
    { title: 'Total Pesanan', value: stats?.total_orders, icon: Package, color: 'text-primary', bg: 'bg-primary/10', desc: 'Total pesanan masuk bulan ini' },
    { title: 'Total Omzet', value: `Rp ${stats?.total_revenue.toLocaleString('id-ID')}`, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50', desc: 'Pendapatan kotor terverifikasi' },
    { title: 'Antrian Review', value: stats?.pending_review, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50', desc: 'Pesanan menunggu pengecekan file' },
    { title: 'Proses Produksi', value: stats?.active_production, icon: Activity, color: 'text-secondary', bg: 'bg-secondary/10', desc: 'PCB yang sedang berada di mesin' },
  ];

  return (
    <div className="space-y-10">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h1 className="text-3xl font-black">Executive Overview</h1>
           <p className="text-muted-foreground font-medium">Pantau performa operasional Setya Abadi Elektronik secara real-time.</p>
        </div>
        <div className="flex items-center gap-3">
           <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 px-4 py-1.5 font-bold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              Secure Admin Session
           </Badge>
           <Button variant="outline" className="h-11 rounded-xl font-bold bg-white border-2">Generate Report</Button>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
         {statCards.map((stat, i) => (
           <Card key={i} className="border-none shadow-sm group hover:shadow-xl transition-all duration-500 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 opacity-10 group-hover:scale-150 transition-transform duration-700">
                 <stat.icon className={cn("w-full h-full", stat.color)} />
              </div>
              <CardHeader className="pb-2">
                 <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3", stat.bg)}>
                    <stat.icon className={cn("w-5 h-5", stat.color)} />
                 </div>
                 <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    {stat.title}
                 </CardTitle>
              </CardHeader>
              <CardContent>
                 <div className="text-2xl font-black mb-1">{stat.value}</div>
                 <p className="text-[10px] text-muted-foreground font-medium">{stat.desc}</p>
              </CardContent>
           </Card>
         ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
         {/* System Health */}
         <Card className="border-none shadow-sm flex flex-col">
            <CardHeader className="bg-slate-100/30 border-b">
               <CardTitle className="text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  System Health Metrics
               </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-6 space-y-6">
               <div className="space-y-4">
                  <div className="flex justify-between items-center">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500">
                           <Cpu className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-bold">Laravel API Core</span>
                     </div>
                     <Badge className="bg-emerald-500 text-white border-0 font-black text-[9px]">OPERATIONAL</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500">
                           <Bell className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-bold">Notification Svc</span>
                     </div>
                     <Badge className="bg-emerald-500 text-white border-0 font-black text-[9px]">OPERATIONAL</Badge>
                  </div>
                  <div className="flex justify-between items-center opacity-50">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                           <Activity className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-bold text-slate-500">Payment Webhook</span>
                     </div>
                     <Badge variant="secondary" className="font-black text-[9px]">IDLE</Badge>
                  </div>
               </div>

               <div className="pt-6 border-t mt-auto">
                  <div className="flex justify-between text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-2">
                     <span>DB Cluster Utilization</span>
                     <span>24%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                     <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '24%' }}
                        className="h-full bg-primary"
                     />
                  </div>
               </div>
            </CardContent>
         </Card>

         <Card className="lg:col-span-2 border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-100/30 border-b flex flex-row items-center justify-between">
               <div>
                  <CardTitle className="text-sm">Antrian Produksi Strategis</CardTitle>
                  <CardDescription>Order dengan prioritas tinggi atau deadline mendesak.</CardDescription>
               </div>
               <Button variant="ghost" className="text-primary text-[11px] font-black h-8 px-2 uppercase tracking-widest">Manage Workflow →</Button>
            </CardHeader>
            <CardContent className="p-0">
               <div className="p-8 text-center bg-pcb-grid bg-white">
                  <Package className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                  <p className="text-xs text-muted-foreground font-medium max-w-xs mx-auto">
                     Semua pesanan saat ini berada dalam rentang waktu pengerjaan normal (SLA 3-5 hari).
                  </p>
               </div>
               
               <div className="border-t p-6 flex items-center justify-around bg-slate-50/50">
                  <div className="text-center">
                     <span className="block text-xl font-black">0</span>
                     <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Urgent Fix</span>
                  </div>
                  <div className="h-8 w-px bg-slate-200" />
                  <div className="text-center">
                     <span className="block text-xl font-black">2</span>
                     <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">QA Review</span>
                  </div>
                  <div className="h-8 w-px bg-slate-200" />
                  <div className="text-center">
                     <span className="block text-xl font-black">12</span>
                     <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Shipped Today</span>
                  </div>
               </div>
            </CardContent>
         </Card>
      </div>

      {/* Quick Access Area */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
         <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-primary/10 to-transparent border border-white shadow-inner flex items-center gap-6 group hover:translate-y-[-4px] transition-all duration-300">
            <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
               <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
               <h4 className="font-extrabold text-sm mb-1 uppercase tracking-tight">Security Audit</h4>
               <p className="text-[10px] text-muted-foreground font-medium">Buka log aktivitas sistem harian.</p>
            </div>
            <ArrowUpRight className="ml-auto w-5 h-5 text-muted-foreground opacity-50" />
         </div>
         
         <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-secondary/10 to-transparent border border-white shadow-inner flex items-center gap-6 group hover:translate-y-[-4px] transition-all duration-300">
            <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-secondary group-hover:scale-110 transition-transform">
               <Settings className="w-7 h-7" />
            </div>
            <div>
               <h4 className="font-extrabold text-sm mb-1 uppercase tracking-tight">Config Params</h4>
               <p className="text-[10px] text-muted-foreground font-medium">Ubah variabel harga & produksi.</p>
            </div>
            <ArrowUpRight className="ml-auto w-5 h-5 text-muted-foreground opacity-50" />
         </div>

         <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-accent/10 to-transparent border border-white shadow-inner flex items-center gap-6 group hover:translate-y-[-4px] transition-all duration-300">
            <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
               <AlertCircle className="w-7 h-7" />
            </div>
            <div>
               <h4 className="font-extrabold text-sm mb-1 uppercase tracking-tight">System Logs</h4>
               <p className="text-[10px] text-muted-foreground font-medium">Status API & Server Health.</p>
            </div>
            <ArrowUpRight className="ml-auto w-5 h-5 text-muted-foreground opacity-50" />
         </div>
      </div>
    </div>
  );
}
