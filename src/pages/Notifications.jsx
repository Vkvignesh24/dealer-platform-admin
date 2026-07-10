import { useState } from 'react';
import { Send, Bell, Globe, Store, User } from 'lucide-react';
import { adminApi } from '../api/admin';
import { useAdminData } from '../lib/useAdminData';
import { PageHeader, Loader, EmptyState, formatDateTime, titleCase, FormSection } from '../components/UI';

const AUDIENCE_ICON = { global: Globe, dealer: Store, customer: User };

export default function Notifications() {
  const { data, loading, refresh } = useAdminData(() => adminApi.notifications());
  const [form, setForm] = useState({ audience: 'global', target: '', title: '', body: '' });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setMsg('');
    try {
      const payload = { audience: form.audience, title: form.title, body: form.body };
      if (form.audience !== 'global') payload.target = form.target;
      await adminApi.sendNotification(payload);
      setMsg('Notification sent successfully.');
      setForm({ audience: 'global', target: '', title: '', body: '' });
      refresh();
    } catch (err) {
      setMsg(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Notifications" subtitle="Broadcast announcements & updates" onRefresh={refresh} loading={loading} />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <form onSubmit={submit} className="card card-p space-y-3 lg:col-span-1">
          <h3 className="panel-title">Send Notification</h3>
          {msg && <div className="rounded-xl bg-brand-50 px-3 py-2 text-sm text-brand-700">{msg}</div>}
          <div><label className="label">Audience</label>
            <select className="input" value={form.audience} onChange={(e) => set('audience', e.target.value)}>
              <option value="global">Global (everyone)</option>
              <option value="dealer">Specific Dealer</option>
              <option value="customer">Specific Customer</option>
            </select>
          </div>
          {form.audience !== 'global' && (
            <div><label className="label">Target User ID</label>
              <input className="input" value={form.target} onChange={(e) => set('target', e.target.value)} placeholder="User _id" required />
            </div>
          )}
          <div><label className="label">Title</label>
            <input className="input" value={form.title} onChange={(e) => set('title', e.target.value)} required />
          </div>
          <div><label className="label">Message</label>
            <textarea className="textarea h-28" value={form.body} onChange={(e) => set('body', e.target.value)} required />
          </div>
          <button className="btn-primary w-full" disabled={busy}>
            <Send size={15} /> {busy ? 'Sending…' : 'Send Notification'}
          </button>
        </form>

        <div className="card card-p lg:col-span-2">
          <h3 className="panel-title mb-3">History</h3>
          {loading && !data ? <Loader />
            : (data?.items || []).length === 0 ? <EmptyState label="No notifications yet" />
            : (
              <div className="space-y-2">
                {data.items.map((n) => {
                  const Icon = AUDIENCE_ICON[n.audience] || Bell;
                  return (
                    <div key={n._id} className="flex gap-3 rounded-xl border border-line p-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary-100 text-primary-700"><Icon size={15} /></span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold text-ink">{n.title}</p>
                          <span className="badge badge-neutral">{titleCase(n.audience)}</span>
                        </div>
                        <p className="text-sm text-primary-700">{n.body}</p>
                        <p className="mt-1 text-[11px] text-muted">{formatDateTime(n.createdAt)}{n.target ? ` · ${n.target.name || n.target}` : ''}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
