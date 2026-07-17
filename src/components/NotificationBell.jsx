import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck } from 'lucide-react';
import { adminApi } from '../api/admin';
import { timeAgo } from './UI';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);

  const loadUnread = async () => {
    try {
      const res = await adminApi.unreadNotificationCount();
      setUnread(res.count || 0);
    } catch { /* silent — bell just shows 0 if this fails */ }
  };

  // useEffect(() => {
  //   loadUnread();
  //   const id = setInterval(loadUnread, 60000); // poll every minute
  //   return () => clearInterval(id);
  // }, []);

  useEffect(() => {
    loadUnread();
  }, []);




  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const toggle = async () => {
    const next = !open;
    setOpen(next);
    if (next) {
      setLoading(true);
      try {
        const res = await adminApi.myNotifications({ limit: 8 });
        setItems(res.items || []);
      } finally {
        setLoading(false);
      }
    }
  };

  const markAll = async () => {
    await adminApi.markAllNotificationsRead();
    setUnread(0);
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markOne = async (id) => {
    await adminApi.markNotificationRead(id);
    setItems((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
    setUnread((u) => Math.max(0, u - 1));
  };

  return (
    <div className="relative" ref={ref}>
      <button className="icon-btn relative" title="Notifications" onClick={toggle}>
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 grid h-4 min-w-[16px] place-items-center rounded-full bg-danger px-1 text-[10px] font-bold text-white border-2 border-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-80 sm:w-96 rounded-2xl border border-line bg-white shadow-pop overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <p className="font-semibold text-ink text-sm">Notifications</p>
            {unread > 0 && (
              <button onClick={markAll} className="flex items-center gap-1 text-[11.5px] font-semibold text-brand-600 hover:text-brand-700">
                <CheckCheck size={13} /> Mark all read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <p className="py-8 text-center text-sm text-muted">Loading…</p>
            ) : items.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted">You're all caught up.</p>
            ) : (
              items.map((n) => (
                <button
                  key={n._id}
                  onClick={() => !n.read && markOne(n._id)}
                  className={`flex w-full flex-col items-start gap-0.5 border-b border-line/60 px-4 py-3 text-left transition-colors hover:bg-primary-50 ${!n.read ? 'bg-brand-50/40' : ''}`}
                >
                  <div className="flex w-full items-center gap-2">
                    {!n.read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />}
                    <p className="flex-1 text-[13px] font-semibold text-ink truncate">{n.title}</p>
                  </div>
                  <p className="text-[12px] text-primary-600 line-clamp-2">{n.body}</p>
                  <p className="text-[10.5px] text-muted">{timeAgo(n.createdAt)}</p>
                </button>
              ))
            )}
          </div>
          <Link
            to="/notifications"
            onClick={() => setOpen(false)}
            className="block border-t border-line px-4 py-2.5 text-center text-[12.5px] font-semibold text-brand-600 hover:bg-primary-50"
          >
            View all notifications
          </Link>
        </div>
      )}
    </div>
  );
}
