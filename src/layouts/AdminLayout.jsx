import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { adminApi } from '../api/admin';
import NotificationBell from '../components/NotificationBell';
import {
  LayoutDashboard, Package, Users, Target, Banknote, Store,
  BarChart3, Bell, LogOut, Menu, X, Settings, User as UserIcon,
  ChevronLeft, ChevronRight, Car, Send,
} from 'lucide-react';

const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [
      { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
      { to: '/analytics', label: 'Analytics', icon: BarChart3 },
    ],
  },
  {
    label: 'Operations',
    items: [
      { to: '/products', label: 'Inventory', icon: Package },
      { to: '/customers', label: 'Customers', icon: Users },
      { to: '/leads', label: 'Leads', icon: Target },
      { to: '/loans', label: 'Loans', icon: Banknote },
      { to: '/dealers', label: 'Dealers', icon: Store },
    ],
  },
  {
    label: 'System',
    items: [
      { to: '/notifications', label: 'Notifications', icon: Bell, end: true, showUnreadBadge: true },
      // { to: '/notifications/send', label: 'Send Notification', icon: Send },
      { to: '/settings', label: 'Settings', icon: Settings },
      { to: '/profile', label: 'Profile', icon: UserIcon },
    ],
  },
];

const ALL_NAV = NAV_GROUPS.flatMap((g) => g.items);

function crumbFor(pathname) {
  const seg = '/' + (pathname.split('/')[1] || '');
  const found = ALL_NAV.find((n) => n.to === seg);
  return found?.label || 'Dashboard';
}

export default function AdminLayout() {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const crumb = crumbFor(location.pathname);

  useEffect(() => {
    const loadUnread = () => adminApi.unreadNotificationCount().then((r) => setUnreadCount(r.count || 0)).catch(() => {});
    loadUnread();
    const id = setInterval(loadUnread, 60000);
    return () => clearInterval(id);
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login', { replace: true });
  };

  const email = auth.currentUser?.email || '';
  const initial = (email || 'A')[0].toUpperCase();
  const username = email.split('@')[0] || 'Admin';

  return (
    <div className="min-h-screen lg:flex bg-canvas">
      {/* Sidebar - Rich Violet-Blue (Indigo) Theme */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-indigo-950 border-r border-indigo-900 transition-all duration-300 lg:sticky lg:top-0 lg:h-screen ${
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${collapsed ? 'lg:w-16' : 'w-64'}`}
      >
        {/* Brand */}
        <div className={`flex h-16 items-center border-b border-indigo-900 shrink-0 ${collapsed ? 'justify-center px-0' : 'gap-3 px-5'}`}>
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-600 text-white font-extrabold text-lg shrink-0 shadow-sm border border-indigo-500">
            <Car size={18} />
          </span>
          {!collapsed && (
            <div className="leading-tight overflow-hidden">
              <p className="text-[14.5px] font-bold text-white whitespace-nowrap">DealerHub</p>
              <p className="text-[10px] uppercase tracking-widest text-indigo-300 whitespace-nowrap">Admin Console</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="mb-5">
              {!collapsed && (
                <p className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-400">
                  {group.label}
                </p>
              )}
              <div className="flex flex-col gap-1">
                {group.items.map(({ to, label, icon: Icon, end, showUnreadBadge }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    onClick={() => setOpen(false)}
                    title={collapsed ? label : undefined}
                    className={({ isActive }) =>
                      `nav-link ${isActive ? 'nav-link-active' : ''} ${collapsed ? 'justify-center px-0 py-3' : ''}`
                    }
                  >
                    <span className="relative shrink-0">
                      <Icon size={18} className="nav-icon" />
                      {collapsed && showUnreadBadge && unreadCount > 0 && (
                        <span className={`absolute grid place-items-center rounded-full bg-danger text-[9px] font-bold text-white ${
                          collapsed ? '-top-1.5 -right-1.5 h-4 min-w-[16px] px-0.5' : '-top-1.5 -right-2 h-4 min-w-[16px] px-0.5'
                        }`}>
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </span>
                    {!collapsed && <span>{label}</span>}
                    {!collapsed && showUnreadBadge && unreadCount > 0 && (
                      <span className="ml-auto grid h-5 min-w-[20px] place-items-center rounded-full bg-danger px-1.5 text-[10.5px] font-bold text-white">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom Footer Section - Matches Indigo Theme */}
        <div className="mt-auto shrink-0 flex flex-col bg-indigo-950">
          {/* Collapse toggle (desktop only) */}
          <button
            className="hidden lg:flex items-center justify-center gap-2 border-t border-indigo-900 py-3 text-indigo-300 hover:text-white hover:bg-indigo-900 transition-colors"
            onClick={() => setCollapsed((v) => !v)}
          >
            {collapsed ? <ChevronRight size={16} /> : (
              <>
                <ChevronLeft size={14} />
                <span className="text-[11.5px] font-semibold">Collapse Menu</span>
              </>
            )}
          </button>

          {/* User Profile & Logout */}
          {!collapsed ? (
            <div className="border-t border-indigo-900 p-4 shrink-0">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-indigo-800 text-[13px] font-bold text-white shrink-0 border border-indigo-700 shadow-sm">
                  {initial}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-white">{username}</p>
                  <p className="text-[11px] text-indigo-300 font-medium">Super Admin</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="grid h-8 w-8 place-items-center rounded-lg text-indigo-300 hover:bg-red-500/20 hover:text-red-300 transition-colors"
                  title="Sign out"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          ) : (
            <div className="border-t border-indigo-900 p-3 shrink-0 flex flex-col items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-indigo-800 text-[13px] font-bold text-white shrink-0 border border-indigo-700 shadow-sm">
                {initial}
              </span>
              <button
                onClick={handleLogout}
                className="grid h-9 w-9 place-items-center rounded-lg text-indigo-300 hover:bg-red-500/20 hover:text-red-300 transition-colors"
                title="Sign out"
              >
                <LogOut size={18} />
              </button>
            </div>
          )}
        </div>
      </aside>

      {open && <div className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)} />}

      {/* Main Content Area (Unchanged) */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-line bg-white/90 px-4 backdrop-blur-md lg:px-6">
          <div className="flex items-center gap-3 min-w-0">
            <button className="lg:hidden text-primary-700 icon-btn" onClick={() => setOpen((v) => !v)}>
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="hidden sm:flex items-center gap-2 text-[13px]">
              <span className="text-muted font-medium">Admin</span>
              <span className="text-primary-300">/</span>
              <span className="font-semibold text-ink">{crumb}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <Link
              to="/profile"
              className="flex items-center gap-2 rounded-full border border-line bg-white px-1.5 py-1.5 hover:bg-primary-50 transition-colors shadow-sm"
            >
              <span className="grid h-7 w-7 place-items-center rounded-full bg-primary-100 text-[11px] font-bold text-primary-800 shrink-0">
                {initial}
              </span>
              <span className="hidden sm:block text-[12.5px] font-semibold text-primary-800 pr-2 pl-1">{username}</span>
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 xl:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}