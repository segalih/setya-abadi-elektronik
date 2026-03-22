import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  Settings, 
  FileSearch, 
  LogOut, 
  Cpu, 
  Bell, 
  Menu, 
  X, 
  ChevronRight,
  User as UserIcon
} from 'lucide-react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

export default function BackofficeLayout() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const menuItems = [
    { title: 'Dashboard', icon: LayoutDashboard, path: '/backoffice', roles: ['staff', 'supervisor'] },
    { title: 'Total Pesanan', icon: Package, path: '/backoffice/orders', roles: ['staff', 'supervisor'] },
    { title: 'Pelanggan', icon: Users, path: '/backoffice/customers', roles: ['staff', 'supervisor'] },
    { title: 'Audit Trail', icon: FileSearch, path: '/backoffice/audit', roles: ['staff', 'supervisor'] },
    { title: 'Parameters', icon: Settings, path: '/backoffice/parameters', roles: ['supervisor'] },
    { title: 'User Management', icon: UserIcon, path: '/backoffice/users', roles: ['supervisor'] },
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(user?.role.name || ''));

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden animate-in fade-in"
          onClick={() => setIsSidebarOpen(false)} 
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 md:relative glass border-r h-screen flex flex-col p-6 transition-transform duration-300 md:translate-x-0",
        isSidebarOpen ? "w-64 translate-x-0" : "w-64 -translate-x-full md:w-20 md:translate-x-0"
      )}>
        <div className="flex items-center gap-3 mb-10 overflow-hidden">
          <div className="p-2 rounded-xl bg-primary flex-shrink-0">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          {isSidebarOpen && <span className="font-black tracking-tight animate-in fade-in slide-in-from-left-2 transition-all">SETYA ABADI</span>}
        </div>

        <nav className="space-y-2 flex-1">
          {filteredMenu.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link key={item.path} to={item.path}>
                <Button 
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full rounded-xl h-12 transition-all group overflow-hidden",
                    isActive ? "shadow-lg shadow-primary/20" : "text-muted-foreground hover:text-primary",
                    isSidebarOpen ? "justify-start gap-3" : "justify-center"
                  )}
                >
                  <Icon className={cn("w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110", isActive && "text-white")} />
                  {isSidebarOpen && <span className="font-bold">{item.title}</span>}
                </Button>
              </Link>
            )
          })}
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-200">
           {isSidebarOpen && (
             <div className="flex items-center gap-3 mb-6 p-2 rounded-xl bg-slate-100/50 animate-in fade-in zoom-in-95">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold flex-shrink-0">
                   {user?.name.charAt(0)}
                </div>
                <div className="min-w-0">
                   <div className="text-xs font-black truncate">{user?.name}</div>
                   <div className="text-[10px] text-muted-foreground uppercase">{user?.role.name}</div>
                </div>
             </div>
           )}
           <Button 
             onClick={() => {
               if (window.confirm("Apakah Anda yakin ingin keluar dari sesi admin?")) {
                 logout();
               }
             }} 
             variant="ghost" 
             className={cn(
               "w-full rounded-xl h-12 text-red-500 hover:bg-red-50 hover:text-red-600 transition-all",
               isSidebarOpen ? "justify-start gap-3" : "justify-center"
             )}
           >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              {isSidebarOpen && <span className="font-bold">Logout</span>}
           </Button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 glass border-b sticky top-0 z-40 flex items-center px-6 justify-between">
           <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsSidebarOpen(true)}>
              <Menu className="w-5 h-5" />
           </Button>
           <Button variant="ghost" size="icon" className="hidden md:flex" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
           </Button>
           
           <div className="flex items-center gap-6">
              <div className="hidden sm:flex flex-col items-end">
                  <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Admin Session</span>
                  <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                     <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                     Live System
                  </span>
              </div>
              <div className="relative p-2 rounded-xl border bg-white hover:bg-slate-50 cursor-pointer transition-colors group">
                 <Bell className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                 <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full ring-2 ring-white" />
              </div>
           </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 md:p-10 pcb-grid">
           <Outlet />
        </main>
      </div>
    </div>
  )
}
