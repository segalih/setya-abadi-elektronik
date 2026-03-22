import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileSearch, 
  Search, 
  Loader2,
  Calendar,
  User as UserIcon,
  Fingerprint,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import api from '@/services/api';
import { cn } from '@/lib/utils';

export default function BackofficeAudit() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/audit-logs', {
        params: { search: searchTerm, page }
      });
      setLogs(response.data.data || []);
      // Pagination logic can be expanded here based on response.data.last_page
    } catch (err) {
      console.error('Failed to fetch audit logs', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  const getEventBadge = (event: string) => {
    const variants: any = {
      created: "bg-emerald-100 text-emerald-700 border-emerald-200",
      updated: "bg-blue-100 text-blue-700 border-blue-200",
      deleted: "bg-red-100 text-red-700 border-red-200",
      restored: "bg-purple-100 text-purple-700 border-purple-200",
    };
    return <Badge className={cn("font-black uppercase text-[9px] px-2", variants[event] || "bg-slate-100 text-slate-700")}>{event}</Badge>;
  };

  return (
    <div className="space-y-8  ">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h1 className="text-3xl font-black">Security Audit Trail</h1>
           <p className="text-muted-foreground font-medium">Log komprehensif dari semua modifikasi data oleh pengguna sistem.</p>
        </div>
        <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-2 font-black">
           Immutable Read-Only Logs
        </Badge>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
         <CardContent className="p-4 flex items-center gap-4">
            <form onSubmit={handleSearch} className="relative flex-1 group w-full">
               <Search className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
               <Input 
                 placeholder="Cari berdasarkan User ID, Model, atau IP Address..." 
                 className="pl-12 h-12 rounded-md bg-slate-50 border-transparent focus:bg-white focus:border-primary/20 transition-none font-medium"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
            </form>
            <Button type="button" onClick={fetchLogs} className="h-12 w-12 rounded-md bg-white border-2 text-primary hover:bg-primary hover:text-white transition-none shadow-none">
               <Loader2 className={cn("w-5 h-5", isLoading && "animate-spin")} />
            </Button>
         </CardContent>
      </Card>

      <Card className="border-none shadow-sm overflow-hidden bg-slate-50/30">
         <CardContent className="p-6">
            <div className="space-y-4">
               {isLoading ? (
                  <div className="py-24 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
               ) : logs.length > 0 ? (
                  logs.map((log, i) => (
                    <motion.div 
                      key={log.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-white p-6 rounded-md shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group"
                    >
                       <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-colors" />
                       
                       <div className="flex flex-col md:flex-row gap-4 md:items-start justify-between">
                          <div className="space-y-4 flex-1 min-w-0">
                             <div className="flex items-center gap-3">
                                {getEventBadge(log.event)}
                                <span className="text-xs font-black uppercase text-muted-foreground tracking-widest flex items-center gap-1">
                                   <Activity className="w-3 h-3" />
                                   {log.auditable_type.split('\\').pop()} #{log.auditable_id}
                                </span>
                             </div>

                             {/* Payload Differences */}
                             {(log.old_values && Object.keys(log.old_values).length > 0) || (log.new_values && Object.keys(log.new_values).length > 0) ? (
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                  {log.old_values && Object.keys(log.old_values).length > 0 && (
                                     <div className="bg-red-50/50 p-3 rounded-xl border border-red-100/50">
                                        <div className="text-[10px] font-black uppercase text-red-500 mb-2">Previous Data / Deleted</div>
                                        <pre className="text-xs text-red-900 overflow-x-auto whitespace-pre-wrap font-mono">
                                           {JSON.stringify(log.old_values, null, 2)}
                                        </pre>
                                     </div>
                                  )}
                                  {log.new_values && Object.keys(log.new_values).length > 0 && (
                                     <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100/50">
                                        <div className="text-[10px] font-black uppercase text-emerald-500 mb-2">New Data / Added</div>
                                        <pre className="text-xs text-emerald-900 overflow-x-auto whitespace-pre-wrap font-mono">
                                           {JSON.stringify(log.new_values, null, 2)}
                                        </pre>
                                     </div>
                                  )}
                               </div>
                             ) : (
                               <div className="text-xs text-muted-foreground italic mt-4 px-2">No payload changes recorded.</div>
                             )}
                          </div>

                          {/* Metadata Sidebar */}
                          <div className="flex flex-col gap-3 md:items-end w-full md:w-64 shrink-0 bg-slate-50 p-4 rounded-xl border border-slate-100">
                             <div className="flex items-center gap-2 text-xs font-bold text-slate-700 w-full justify-start md:justify-end">
                                <UserIcon className="w-4 h-4 text-muted-foreground" />
                                {log.user?.name || `System / Unauthenticated (ID: ${log.user_id})`}
                             </div>
                             <div className="flex items-center gap-2 text-xs font-bold text-slate-700 w-full justify-start md:justify-end truncate" title={log.user_agent}>
                                <Fingerprint className="w-4 h-4 text-muted-foreground shrink-0" />
                                {log.ip_address} 
                             </div>
                             <div className="flex items-center gap-2 text-[10px] font-black uppercase text-muted-foreground w-full justify-start md:justify-end mt-2">
                                <Calendar className="w-4 h-4" />
                                {new Date(log.created_at).toLocaleString('id-ID')}
                             </div>
                          </div>
                       </div>
                    </motion.div>
                  ))
               ) : (
                  <div className="py-24 text-center">
                     <FileSearch className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                     <p className="text-sm text-muted-foreground font-medium">Tidak ada log aktivitas ditemukan untuk pencarian ini.</p>
                  </div>
               )}

               <div className="flex justify-center mt-8">
                  <Button variant="outline" className="rounded-xl font-bold border-2" disabled={isLoading || logs.length === 0} onClick={() => setPage(p => p + 1)}>Muat Lebih Banyak Log</Button>
               </div>
            </div>
         </CardContent>
      </Card>
    </div>
  );
}
