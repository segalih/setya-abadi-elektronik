import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Search, 
  ShieldAlert, 
  ShieldCheck, 
  UserPlus, 
  MoreVertical, 
  Loader2,
  Trash2,
  Lock
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import api from '@/services/api';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';

export default function BackofficeUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { addToast } = useToast();
  const currentUser = useAuthStore(state => state.user);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/users', {
        params: { search: searchTerm }
      });
      setUsers(response.data.data);
    } catch (err) {
      console.error('Failed to fetch internal users', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id: string, roleName: string) => {
    if (roleName === 'supervisor') {
       addToast({
          title: "Akses Ditolak",
          description: "Tidak dapat menghapus akun dengan role Supervisor.",
          variant: "destructive"
       });
       return;
    }

    if (window.confirm('Verifikasi keamanan: Apakah Anda yakin ingin menghapus user ini secara permanen?')) {
       try {
          await api.delete(`/users/${id}`);
          addToast({
             title: "Aksi Berhasil",
             description: "User internal berhasil dinonaktifkan/dihapus.",
             variant: "success"
          });
          fetchUsers();
       } catch (err) {
          addToast({
             title: "Aksi Gagal",
             description: "Terjadi kesalahan saat menghapus user.",
             variant: "destructive"
          });
       }
    }
  };

  const getRoleBadge = (roleName: string) => {
    switch (roleName) {
      case 'supervisor':
        return <Badge className="bg-purple-100 text-purple-700 border-purple-200 font-black text-[9px] uppercase tracking-widest px-2 py-1"><ShieldAlert className="w-3 h-3 mr-1" /> Supervisor</Badge>;
      case 'staff':
        return <Badge className="bg-blue-100 text-blue-700 border-blue-200 font-black text-[9px] uppercase tracking-widest px-2 py-1"><ShieldCheck className="w-3 h-3 mr-1" /> Staff</Badge>;
      default:
        return <Badge variant="secondary" className="font-black text-[9px] uppercase tracking-widest px-2 py-1">User</Badge>;
    }
  }

  return (
    <div className="space-y-8  ">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h1 className="text-3xl font-black">Manajemen Akses Staff</h1>
           <p className="text-muted-foreground font-medium">Kelola akun internal Setya Abadi Elektronik.</p>
        </div>
        <Button size="lg" className="rounded-xl shadow-lg shadow-primary/20 bg-primary h-12">
            <UserPlus className="w-5 h-5 mr-2" />
            Tambah Staff Baru
        </Button>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
         <CardContent className="p-4 flex items-center gap-4">
            <div className="relative flex-1 group">
               <Search className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
               <Input 
                 placeholder="Cari Nama atau Email Staff..." 
                 className="pl-12 h-12 rounded-md bg-slate-50 border-transparent focus:bg-white focus:border-primary/20 transition-none font-medium"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
               />
            </div>
            <Button onClick={fetchUsers} className="h-12 px-6 rounded-md bg-white border-2 text-primary hover:bg-primary hover:text-white transition-none shadow-none font-bold">
               Cari Database
            </Button>
         </CardContent>
      </Card>

      <Card className="border-none shadow-sm overflow-hidden">
         <CardContent className="p-0">
            {isLoading ? (
               <div className="p-24 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : users.length > 0 ? (
               <div className="overflow-x-auto pb-4">
                  <table className="w-full text-left whitespace-nowrap">
                     <thead>
                        <tr className="bg-slate-50/50 border-b text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                           <th className="p-6">User / Staff</th>
                           <th className="p-6">Role Akses</th>
                           <th className="p-6">Tgl. Terdaftar</th>
                           <th className="p-6 text-right">Aksi Internal</th>
                        </tr>
                     </thead>
                     <tbody className="text-sm">
                        {users.map((u, i) => (
                           <motion.tr 
                             key={u.id}
                             initial={{ opacity: 0, y: 10 }}
                             animate={{ opacity: 1, y: 0 }}
                             transition={{ delay: i * 0.05 }}
                             className={cn(
                               "border-b last:border-0 hover:bg-slate-50/80 transition-none group",
                               currentUser?.id === u.id && "bg-primary/5"
                             )}
                           >
                              <td className="p-6">
                                 <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-sm font-black text-slate-500">
                                       {u.name.charAt(0)}
                                    </div>
                                    <div className="min-w-0">
                                       <div className="font-bold flex items-center gap-2">
                                          {u.name}
                                          {currentUser?.id === u.id && <Badge variant="default" className="text-[8px] h-4 px-1.5 bg-primary">YOU</Badge>}
                                       </div>
                                       <div className="text-[10px] text-muted-foreground uppercase font-bold">{u.email}</div>
                                    </div>
                                 </div>
                              </td>
                              <td className="p-6">
                                 {getRoleBadge(u.role?.name)}
                              </td>
                              <td className="p-6">
                                 <div className="font-medium text-slate-600">{new Date(u.created_at).toLocaleDateString()}</div>
                              </td>
                              <td className="p-6 text-right">
                                 {u.role?.name === 'supervisor' ? (
                                    <Button disabled variant="ghost" size="icon" className="rounded-xl opacity-50 cursor-not-allowed">
                                       <Lock className="w-4 h-4" />
                                    </Button>
                                 ) : (
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      onClick={() => handleDelete(u.id, u.role?.name)}
                                      className="rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600"
                                    >
                                       <Trash2 className="w-4 h-4" />
                                    </Button>
                                 )}
                              </td>
                           </motion.tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            ) : (
               <div className="p-24 text-center">
                  <Users className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground font-medium">Tidak ada staff yang ditemukan.</p>
               </div>
            )}
         </CardContent>
      </Card>
    </div>
  );
}
