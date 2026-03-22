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
  PanelLeftClose,
  PanelLeftOpen,
  ChevronRight,
  User as UserIcon
} from 'lucide-react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';
import NotFoundPage from '@/modules/error/NotFoundPage';

export default function BackofficeLayout() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Fallback for corrupted localstorage where user is nested
  const actualUser = (user as any)?.user || user;
  const roleName = typeof actualUser?.role === 'string' ? actualUser.role : actualUser?.role?.name;

  if (roleName === 'user' || roleName === 'customer' || !['admin', 'staff', 'supervisor'].includes(roleName || '')) {
    return <NotFoundPage />;
  }

  const menuItems = [
    { title: 'Dashboard', icon: LayoutDashboard, path: '/backoffice', roles: ['admin', 'staff', 'supervisor'] },
    { title: 'Total Pesanan', icon: Package, path: '/backoffice/orders', roles: ['admin', 'staff', 'supervisor'] },
    { title: 'Pelanggan', icon: Users, path: '/backoffice/customers', roles: ['admin', 'staff', 'supervisor'] },
    { title: 'Audit Trail', icon: FileSearch, path: '/backoffice/audit', roles: ['admin', 'staff', 'supervisor'] },
    { title: 'Parameters', icon: Settings, path: '/backoffice/parameters', roles: ['admin', 'supervisor'] },
    { title: 'User Management', icon: UserIcon, path: '/backoffice/users', roles: ['admin', 'supervisor'] },
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(roleName || ''));

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden animate-in fade-in"
          onClick={() => setIsSidebarOpen(false)} 
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 lg:relative bg-white border-r border-slate-200 h-screen flex flex-col transition-all duration-300 shadow-xl lg:shadow-none lg:translate-x-0",
        isSidebarOpen ? "w-64 translate-x-0" : "w-64 -translate-x-full lg:w-20 lg:translate-x-0"
      )}>
        <div className="flex items-center gap-3 h-16 px-6 border-b border-slate-100 flex-shrink-0">
          <div className="p-2 rounded-xl bg-primary flex-shrink-0">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          {isSidebarOpen && <span className="font-black tracking-tight animate-in fade-in slide-in-from-left-2 transition-all">SETYA ABADI</span>}
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {filteredMenu.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Button 
                key={item.path}
                asChild
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full h-11 transition-all group overflow-hidden",
                  isActive ? "bg-primary text-white shadow-md shadow-primary/20" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100",
                  isSidebarOpen ? "justify-start px-3" : "justify-center px-0"
                )}
              >
                <Link to={item.path}>
                  <Icon className={cn("w-5 h-5 flex-shrink-0", isActive ? "text-white" : "text-slate-400 group-hover:text-slate-700")} />
                  {isSidebarOpen && <span className="font-semibold ml-3">{item.title}</span>}
                </Link>
              </Button>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50 mt-auto">
           {isSidebarOpen ? (
             <div className="flex flex-col gap-3">
               <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200 shadow-sm">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold flex-shrink-0">
                     {actualUser?.name?.charAt(0) || 'U'}
                  </div>
                  <div className="min-w-0">
                     <div className="text-xs font-black truncate text-slate-800">{actualUser?.name || 'User'}</div>
                     <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{roleName || 'Role'}</div>
                  </div>
               </div>
               <Button 
                 onClick={() => {
                   if (window.confirm("Keluar dari sesi admin?")) logout();
                 }} 
                 variant="outline" 
                 className="w-full text-red-500 hover:bg-red-50 hover:text-red-600 border-red-100 h-10"
               >
                  <LogOut className="w-4 h-4 mr-2" />
                  <span className="font-bold text-xs uppercase tracking-widest">Logout</span>
               </Button>
             </div>
           ) : (
             <Button 
                 onClick={() => {
                   if (window.confirm("Keluar dari sesi admin?")) logout();
                 }} 
                 variant="ghost" 
                 className="w-full text-red-500 hover:bg-red-50 hover:text-red-600 h-10 px-0"
               >
                  <LogOut className="w-5 h-5" />
             </Button>
           )}
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 h-screen bg-slate-50">
        <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-40 flex items-center px-4 justify-between shadow-sm">
           <div className="flex items-center gap-3">
             <Button variant="ghost" size="icon" className="lg:hidden text-slate-500 hover:bg-slate-100" onClick={() => setIsSidebarOpen(true)}>
                <Menu className="w-5 h-5" />
             </Button>
             <Button variant="ghost" size="icon" className="hidden lg:flex text-slate-500 hover:bg-slate-100" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                {isSidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />}
             </Button>
           </div>
           
           <div className="flex items-center gap-4">
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

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 pcb-grid">
           <Outlet />
        </main>
      </div>
    </div>
  )
}
