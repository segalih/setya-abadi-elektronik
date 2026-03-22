import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

  const menuGroups = [
    {
      title: 'Main',
      items: [
        { title: 'Dashboard', icon: LayoutDashboard, path: '/backoffice', roles: ['admin', 'staff', 'supervisor'] },
        { title: 'Total Pesanan', icon: Package, path: '/backoffice/orders', roles: ['admin', 'staff', 'supervisor'] },
        { title: 'Pelanggan', icon: Users, path: '/backoffice/customers', roles: ['admin', 'staff', 'supervisor'] },
      ]
    },
    {
      title: 'System',
      items: [
        { title: 'Audit Trail', icon: FileSearch, path: '/backoffice/audit', roles: ['admin', 'supervisor'] },
        { title: 'Parameters', icon: Settings, path: '/backoffice/parameters', roles: ['admin', 'supervisor'] },
        { title: 'User Management', icon: UserIcon, path: '/backoffice/users', roles: ['admin', 'supervisor'] },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden font-sans">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)} 
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 lg:relative bg-white border-r border-slate-200 h-screen flex flex-col transition-all duration-300 shadow-xl lg:shadow-none lg:translate-x-0 overflow-hidden",
        isSidebarOpen ? "w-72 translate-x-0" : "w-72 -translate-x-full lg:w-24 lg:translate-x-0"
      )}>
        <div className="flex items-center gap-3 h-20 px-6 border-b border-slate-100 flex-shrink-0">
          <div className="p-2.5 rounded-xl bg-primary shadow-lg shadow-primary/20 flex-shrink-0">
            <Cpu className="w-6 h-6 text-white" />
          </div>
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.span 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="font-black tracking-tighter text-lg whitespace-nowrap"
              >
                SETYA ABADI
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
          {menuGroups.map((group, idx) => {
            const visibleItems = group.items.filter(item => item.roles.includes(roleName || ''));
            if (visibleItems.length === 0) return null;

            return (
              <div key={idx} className="space-y-2">
                {isSidebarOpen ? (
                  <h3 className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">
                    {group.title}
                  </h3>
                ) : (
                  <div className="h-px bg-slate-100 mx-2 mb-4" />
                )}
                
                <div className="space-y-1">
                  {visibleItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={cn(
                          "flex items-center w-full min-h-[48px] px-4 rounded-xl transition-all duration-200 group relative",
                          isActive 
                            ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20" 
                            : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                        )}
                        title={!isSidebarOpen ? item.title : undefined}
                      >
                        <Icon className={cn(
                          "w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110", 
                          isActive ? "text-primary shadow-glow" : "text-slate-400 group-hover:text-primary"
                        )} />
                        {isSidebarOpen && (
                          <span className={cn(
                            "font-bold ml-4 flex-1 truncate text-sm tracking-tight",
                            isActive ? "opacity-100" : "opacity-80 group-hover:opacity-100"
                          )}>
                            {item.title}
                          </span>
                        )}
                        {isActive && isSidebarOpen && (
                          <motion.div 
                            layoutId="active-pill" 
                            className="absolute right-2 w-1.5 h-1.5 rounded-full bg-primary" 
                          />
                        )}
                      </Link>
                    )
                  })}
                </div>
              </div>
            );
          })}
        </nav>

         <div className="p-4 border-t border-slate-100 bg-slate-50/50 mt-auto">
           {isSidebarOpen ? (
             <div className="flex flex-col gap-3">
               <div className="flex items-center gap-3 p-3 rounded-md bg-white border border-slate-200 shadow-sm">
                  <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center text-primary font-bold flex-shrink-0">
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
                 className="w-full text-red-500 border-red-500/20 hover:bg-red-50 hover:text-red-700 hover:border-red-500/50 h-11 rounded-md"
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
                 variant="outline" 
                 className="w-full text-red-500 border-red-500/20 hover:bg-red-50 hover:text-red-700 hover:border-red-500/50 h-11 px-0 flex items-center justify-center rounded-md"
               >
                  <LogOut className="w-5 h-5 shrink-0" />
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
