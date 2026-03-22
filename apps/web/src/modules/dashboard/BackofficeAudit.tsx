import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileSearch, 
  Search, 
  Loader2,
  Calendar,
  User as UserIcon,
  Fingerprint,
  Activity,
  X,
  Eye,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import api from '@/services/api';
import { cn } from '@/lib/utils';

export default function BackofficeAudit() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Modal State
  const [selectedLog, setSelectedLog] = useState<any>(null);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/backoffice/audit-logs', {
        params: { 
          search: searchTerm, 
          action: actionFilter,
          start_date: startDate,
          end_date: endDate,
          page 
        }
      });
      setLogs(response.data.data || []);
      setTotalPages(response.data.last_page || 1);
      setTotalRecords(response.data.total || 0);
    } catch (err) {
      console.error('Failed to fetch audit logs', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  const getEventBadge = (action: string) => {
    const variants: any = {
      created: "bg-emerald-100 text-emerald-700 border-emerald-200",
      updated: "bg-blue-100 text-blue-700 border-blue-200",
      deleted: "bg-red-100 text-red-700 border-red-200"
    };
    return <Badge className={cn("font-black uppercase text-[9px] px-2", variants[action] || "bg-slate-100 text-slate-700")}>{action}</Badge>;
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h1 className="text-3xl font-black">Universal Audit Trail</h1>
           <p className="text-muted-foreground font-medium">Log komprehensif seluruh modifikasi data di sistem Setya Abadi Elektronik.</p>
        </div>
        <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-2 font-black uppercase tracking-widest text-[10px]">
           Immutable Read-Only Logs
        </Badge>
      </div>

      <Card className="border-none shadow-sm overflow-hidden bg-white rounded-2xl">
         <CardContent className="p-4">
            <form onSubmit={handleFilterSubmit} className="flex flex-col md:flex-row gap-4">
               <div className="relative flex-1 group">
                  <Search className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input 
                    placeholder="Search by User, Module, or IP Address..." 
                    className="pl-12 h-12 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-primary/20 font-medium"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
               </div>
               <select 
                  className="h-12 rounded-xl bg-slate-50 border border-slate-100 px-4 text-sm font-bold outline-none focus:border-primary/20 md:w-48 appearance-none"
                  value={actionFilter}
                  onChange={(e) => setActionFilter(e.target.value)}
               >
                  <option value="">All Actions</option>
                  <option value="created">Created</option>
                  <option value="updated">Updated</option>
                  <option value="deleted">Deleted</option>
               </select>
               <input 
                  type="date"
                  className="h-12 rounded-xl bg-slate-50 border border-slate-100 px-4 text-xs font-bold outline-none focus:border-primary/20 md:w-40"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
               />
               <input 
                  type="date"
                  className="h-12 rounded-xl bg-slate-50 border border-slate-100 px-4 text-xs font-bold outline-none focus:border-primary/20 md:w-40"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
               />
               <Button type="submit" className="h-12 px-6 rounded-xl bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20 font-black uppercase tracking-widest text-[10px]">
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Filter className="w-4 h-4 mr-2" />}
                  Filter
               </Button>
            </form>
         </CardContent>
      </Card>

      <Card className="border-none shadow-sm overflow-hidden bg-white rounded-2xl">
         <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
               <thead className="bg-slate-50 text-slate-500 font-black uppercase tracking-wider text-[10px] border-b border-slate-100">
                  <tr>
                     <th className="px-6 py-4">Timestamp</th>
                     <th className="px-6 py-4">Actor</th>
                     <th className="px-6 py-4">Action</th>
                     <th className="px-6 py-4">Entity (Table)</th>
                     <th className="px-6 py-4 text-right">Delta Inspect</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-24 text-center">
                         <Loader2 className="w-10 h-10 animate-spin mx-auto text-primary opacity-20" />
                         <p className="mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Fetching Audit Records...</p>
                      </td>
                    </tr>
                  ) : logs.length > 0 ? (
                     logs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                           <td className="px-6 py-4">
                              <div className="flex items-center gap-2 font-bold text-slate-600">
                                 <Calendar className="w-4 h-4 text-slate-300" />
                                 {new Date(log.created_at).toLocaleString('id-ID')}
                              </div>
                           </td>
                           <td className="px-6 py-4">
                              <div className="flex flex-col">
                                 <span className="font-black text-slate-900 flex items-center gap-2">
                                    <UserIcon className="w-3 h-3 text-primary" />
                                    {log.user?.name || `System (ID: ${log.user_id})`}
                                 </span>
                                 <span className="text-[10px] text-muted-foreground font-bold flex items-center gap-1 mt-1 opacity-60">
                                    <Fingerprint className="w-3 h-3" /> {log.ip_address}
                                 </span>
                              </div>
                           </td>
                           <td className="px-6 py-4">
                              {getEventBadge(log.action)}
                           </td>
                           <td className="px-6 py-4">
                              <div className="flex items-center gap-2 font-black text-slate-700 uppercase tracking-widest text-[10px]">
                                 <Activity className="w-4 h-4 text-secondary" />
                                 {log.table_name} <span className="text-slate-300 font-medium">#{log.table_id}</span>
                              </div>
                           </td>
                           <td className="px-6 py-4 text-right">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 text-[10px] font-black uppercase tracking-tighter border-2 rounded-xl group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all"
                                onClick={() => setSelectedLog(log)}
                              >
                                 <Eye className="w-3 h-3 mr-2" />
                                 Inspect Delta
                              </Button>
                           </td>
                        </tr>
                     ))
                  ) : (
                     <tr>
                        <td colSpan={5} className="px-6 py-24 text-center">
                           <div className="text-muted-foreground font-black uppercase tracking-widest text-[10px] opacity-30">No audit logs found.</div>
                        </td>
                     </tr>
                  )}
               </tbody>
            </table>
         </div>
         
         {/* Standard Pagination Controls */}
         <div className="p-6 bg-slate-50/50 border-t flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">
               Tracked <span className="text-slate-900">{totalRecords}</span> occurrences
            </span>
            <div className="flex items-center gap-2">
               <Button 
                 variant="outline" 
                 size="icon" 
                 disabled={page === 1}
                 onClick={() => setPage(p => p - 1)}
                 className="rounded-xl border-2 h-10 w-10 hover:bg-primary hover:text-white transition-all"
               >
                  <ChevronLeft className="w-5 h-5" />
               </Button>
               <div className="px-4 text-[10px] font-black bg-white h-10 flex items-center rounded-xl border-2 uppercase tracking-tighter">
                  PAGE {page} / {totalPages}
               </div>
               <Button 
                 variant="outline" 
                 size="icon"
                 disabled={page === totalPages}
                 onClick={() => setPage(p => p + 1)}
                 className="rounded-xl border-2 h-10 w-10 hover:bg-primary hover:text-white transition-all"
               >
                  <ChevronRight className="w-5 h-5" />
               </Button>
            </div>
         </div>
      </Card>

      {/* Detail Modal */}
      <AnimatePresence>
         {selectedLog && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
               <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                 onClick={() => setSelectedLog(null)}
               />
               <motion.div 
                 initial={{ scale: 0.9, opacity: 0, y: 40 }}
                 animate={{ scale: 1, opacity: 1, y: 0 }}
                 exit={{ scale: 0.9, opacity: 0, y: 40 }}
                 className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden border border-white"
               >
                  <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-white relative">
                     <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none">
                        <FileSearch className="w-64 h-64 -mr-20 -mt-20" />
                     </div>
                     <div className="flex items-center gap-6 relative z-10">
                        <div className="w-16 h-16 rounded-[1.5rem] bg-primary/10 flex items-center justify-center text-primary">
                           <FileSearch className="w-8 h-8" />
                        </div>
                        <div>
                           <div className="flex items-center gap-3">
                              <h2 className="text-2xl font-black italic tracking-tighter">
                                 Delta Inspector
                              </h2>
                              {getEventBadge(selectedLog.action)}
                           </div>
                           <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mt-1">
                              {selectedLog.table_name} <span className="text-primary">#{selectedLog.table_id}</span> — {new Date(selectedLog.created_at).toLocaleString('id-ID')}
                           </p>
                        </div>
                     </div>
                     <button onClick={() => setSelectedLog(null)} className="p-3 bg-slate-100 rounded-2xl hover:bg-slate-200 transition-colors relative z-10">
                        <X className="w-6 h-6 text-slate-500" />
                     </button>
                  </div>
                  
                  <div className="p-10 overflow-y-auto flex-1 bg-slate-50/50">
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
                        {/* Before Data */}
                        <div className="bg-white border border-slate-100 rounded-[2rem] p-8 flex flex-col h-full shadow-sm">
                           <div className="flex items-center gap-2 text-[10px] font-black uppercase text-red-500 tracking-[0.2em] mb-6 pb-4 border-b">
                              <div className="w-2 h-2 rounded-full bg-red-500" /> Pre-Mutation State
                           </div>
                           <pre className="text-[11px] font-mono whitespace-pre-wrap text-slate-700 overflow-y-auto flex-1 leading-relaxed custom-scrollbar p-2">
                              {selectedLog.before_data ? JSON.stringify(selectedLog.before_data, null, 2) : <span className="text-slate-300 italic opacity-50">NULL: Target state was empty.</span>}
                           </pre>
                        </div>
                        
                        {/* After Data */}
                        <div className="bg-white border border-slate-100 rounded-[2rem] p-8 flex flex-col h-full shadow-sm">
                           <div className="flex items-center gap-2 text-[10px] font-black uppercase text-emerald-500 tracking-[0.2em] mb-6 pb-4 border-b">
                              <div className="w-2 h-2 rounded-full bg-emerald-500" /> Post-Mutation Delta
                           </div>
                           <pre className="text-[11px] font-mono whitespace-pre-wrap text-slate-700 overflow-y-auto flex-1 leading-relaxed custom-scrollbar p-2">
                              {selectedLog.after_data || selectedLog.changed_fields ? JSON.stringify(selectedLog.after_data || selectedLog.changed_fields, null, 2) : <span className="text-slate-300 italic opacity-50">NULL: Mutation resulted in void state.</span>}
                           </pre>
                        </div>
                     </div>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>
    </div>
  );
}
