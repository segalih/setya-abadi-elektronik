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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';
import NotFoundPage from '@/modules/error/NotFoundPage';

export default function BackofficeLayout() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }, []);

  // Fallback for corrupted localstorage where user is nested
  const actualUser = (user as any)?.user || user;
  const roleName = typeof actualUser?.role === 'string' ? actualUser.role : actualUser?.role?.name;

  // Block non-admin users
  if (roleName && !['admin', 'supervisor', 'staff'].includes(roleName)) {
    return <NotFoundPage />;
  }

  const navigation = [
    { 
      group: 'Main',
      items: [
        { title: 'Dashboard', icon: LayoutDashboard, path: '/backoffice' },
        { title: 'Pesanan', icon: Package, path: '/backoffice/orders' },
        { title: 'Pelanggan', icon: Users, path: '/backoffice/customers' },
      ]
    },
    {
      group: 'System',
      items: [
        { title: 'Audit Trail', icon: FileSearch, path: '/backoffice/audit' },
        { title: 'Parameters', icon: Settings, path: '/backoffice/parameters' },
        { title: 'User Management', icon: UserIcon, path: '/backoffice/users' },
      ]
    }
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 lg:relative bg-white border-r border-slate-200 h-screen flex flex-col transition-all duration-300 shadow-xl lg:shadow-none lg:translate-x-0 overflow-hidden",
        isSidebarOpen ? "w-72 translate-x-0" : "w-72 -translate-x-full lg:w-24 lg:translate-x-0"
      )}>
        <div className="flex items-center gap-3 h-20 px-6 border-b border-slate-100 shrink-0">
          <div className="p-2.5 rounded-xl bg-primary shadow-lg shadow-primary/20 shrink-0">
            <Cpu className="w-6 h-6 text-white" />
          </div>
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="font-black tracking-tight text-lg whitespace-nowrap">
                SETYA ABADI
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-6">
          {navigation.map((group) => (
            <div key={group.group}>
              {isSidebarOpen && (
                <div className="px-3 mb-3 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
                  {group.group}
                </div>
              )}
              <div className="space-y-1.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path || (item.path !== '/backoffice' && location.pathname.startsWith(item.path));
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => {
                        if (window.innerWidth < 1024) setIsSidebarOpen(false);
                      }}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all group",
                        isActive
                          ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20"
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                      )}
                      title={!isSidebarOpen ? item.title : undefined}
                    >
                      <Icon className={cn(
                        "w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110", 
                        isActive ? "text-white shadow-glow" : "text-slate-400 group-hover:text-primary"
                      )} />
                      {isSidebarOpen && (
                        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="whitespace-nowrap">
                          {item.title}
                        </motion.span>
                      )}
                      {isActive && isSidebarOpen && (
                        <ChevronRight className="w-4 h-4 ml-auto text-slate-400" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50 mt-auto">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline" 
                className={cn(
                  "w-full text-red-500 border-red-500/20 hover:bg-red-50 hover:text-red-700 hover:border-red-500/50 rounded-xl transition-all",
                  isSidebarOpen ? "h-12 justify-start px-4 gap-3" : "h-12 px-0 flex items-center justify-center"
                )}
              >
                <LogOut className={cn("shrink-0 w-5 h-5")} />
                {isSidebarOpen && <span className="font-bold text-sm">Logout</span>}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-2xl p-8 border-none shadow-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-xl font-black text-slate-800">Konfirmasi Logout</AlertDialogTitle>
                <AlertDialogDescription className="text-sm font-medium text-slate-500 mt-2">
                  Keluar dari sesi admin? Anda perlu login kembali untuk mengakses backoffice.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="mt-6 gap-3 sm:gap-0">
                <AlertDialogCancel className="rounded-xl border-none bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold h-11 px-6">Batal</AlertDialogCancel>
                <AlertDialogAction onClick={() => { logout(); navigate('/'); }} className="rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold h-11 px-6 border-none shadow-lg shadow-red-500/20">Ya, Logout</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 h-screen bg-slate-50">
        <header className="flex items-center justify-between h-20 px-6 lg:px-10 bg-white border-b border-slate-100 shrink-0">
           <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="rounded-xl h-10 w-10 hover:bg-slate-50 hidden lg:flex">
                {isSidebarOpen ? <PanelLeftClose className="w-5 h-5 text-slate-400" /> : <PanelLeftOpen className="w-5 h-5 text-slate-400" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="rounded-xl h-10 w-10 hover:bg-slate-50 lg:hidden">
                <Menu className="w-5 h-5 text-slate-700" />
              </Button>
           </div>
           
           <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end mr-2">
                  <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Admin Session</span>
                  <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                     <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                     Live System
                  </span>
              </div>

            <AlertDialog>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button type="button" className="relative h-10 w-10 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-center outline-none cursor-pointer">
                    <span className="font-black text-primary">{actualUser?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                    <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl border border-slate-100 shadow-xl shadow-slate-900/5 bg-white">
                  <DropdownMenuLabel className="font-normal p-2">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-black text-slate-900 truncate">{actualUser?.name || 'User'}</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        {roleName || 'Role'}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-slate-100" />
                  <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer text-xs font-bold p-2.5 hover:bg-slate-50 rounded-lg">
                    <UserIcon className="mr-2 h-4 w-4 text-slate-400" />
                    <span>My Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/dashboard')} className="cursor-pointer text-xs font-bold p-2.5 hover:bg-slate-50 rounded-lg">
                    <LayoutDashboard className="mr-2 h-4 w-4 text-slate-400" />
                    <span>Frontend Dashboard</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-slate-100" />
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem className="cursor-pointer text-xs font-bold p-2.5 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                </DropdownMenuContent>
              </DropdownMenu>

              <AlertDialogContent className="rounded-2xl p-8 border-none shadow-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-xl font-black text-slate-800">Konfirmasi Logout</AlertDialogTitle>
                  <AlertDialogDescription className="text-sm font-medium text-slate-500 mt-2">
                    Keluar dari sesi admin?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="mt-6 gap-3 sm:gap-0">
                  <AlertDialogCancel className="rounded-xl border-none bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold h-11 px-6">Batal</AlertDialogCancel>
                  <AlertDialogAction onClick={() => { logout(); navigate('/'); }} className="rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold h-11 px-6 border-none shadow-lg shadow-red-500/20">Ya, Logout</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
           </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 pcb-grid">
           <Outlet />
        </main>
      </div>
    </div>
  )
}
