import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck, Send, Target, Banknote, ShoppingBag, Undo2, Lock, Hourglass, UserPlus, Package } from 'lucide-react';
import { adminApi } from '../api/admin';
import { useAdminData } from '../lib/useAdminData';
import { PageHeader, Loader, EmptyState, timeAgo } from '../components/UI';

const TYPE_ICON = {
  lead_created: Target, lead_status_changed: Target,
  loan_created: Banknote, loan_approved: Banknote, loan_status_changed: Banknote,
  sale_created: ShoppingBag, sale_reversed: Undo2,
  product_reserved: Lock, inventory_aging: Hourglass,
  customer_registered: UserPlus,
};

export default function NotificationsInbox() {
  const { data, loading, refresh } = useAdminData(() => adminApi.myNotifications({ limit: 50 }));
  const [filter, setFilter] = useState('all'); // all | unread
  const [busyId, setBusyId] = useState(null);

  useEffect(() => { refresh(); }, []);

  const items = data?.items || [];
  const visible = filter === 'unread' ? items.filter((n) => !n.read) : items;
  const unreadCount = items.filter((n) => !n.read).length;

  const markRead = async (id) => {
    setBusyId(id);
    try { await adminApi.markNotificationRead(id); await refresh(); }
    finally { setBusyId(null); }
  };
  const markAll = async () => {
    await adminApi.markAllNotificationsRead();
    refresh();
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Notifications" subtitle="Leads, loans, sales, and account alerts you're subscribed to" onRefresh={refresh} loading={loading}>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button className="btn-outline" onClick={markAll}>
              <CheckCheck size={14} /> Mark all read
            </button>
          )}
          {/* <Link to="/notifications/send" className="btn-primary">
            <Send size={14} /> Send Notification
          </Link> */}
        </div>
      </PageHeader>

      <div className="flex gap-2">
        {['all', 'unread'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-xl border px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${
              filter === f ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-line text-primary-600 hover:bg-primary-50'
            }`}
          >
            {f === 'all' ? 'All' : `Unread (${unreadCount})`}
          </button>
        ))}
      </div>

      <div className="card card-p">
        {loading && !data ? <Loader />
          : visible.length === 0 ? <EmptyState icon={Bell} label={filter === 'unread' ? "You're all caught up" : 'No notifications yet'} />
          : (
            <div className="divide-y divide-line">
              {visible.map((n) => {
                const Icon = TYPE_ICON[n.type] || Package;
                return (
                  <button
                    key={n._id}
                    onClick={() => !n.read && markRead(n._id)}
                    disabled={busyId === n._id}
                    className={`flex w-full items-start gap-3 py-3.5 text-left transition-colors hover:bg-primary-50/60 ${!n.read ? 'bg-brand-50/30' : ''}`}
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary-100 text-primary-700"><Icon size={15} /></span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        {!n.read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />}
                        <p className="text-[13.5px] font-semibold text-ink truncate">{n.title}</p>
                      </div>
                      <p className="text-[12.5px] text-primary-600">{n.body}</p>
                    </div>
                    <span className="shrink-0 text-[11px] text-muted">{timeAgo(n.createdAt)}</span>
                  </button>
                );
              })}
            </div>
          )}
      </div>
    </div>
  );
}
