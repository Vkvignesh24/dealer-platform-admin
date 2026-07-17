import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, Bell, Globe, Store, User, ArrowLeft } from 'lucide-react';
import { adminApi } from '../api/admin';
import { useAdminData } from '../lib/useAdminData';
import { PageHeader, Loader, EmptyState, formatDateTime, titleCase, Field } from '../components/UI';
import UserPicker from '../components/UserPicker';

const AUDIENCE_ICON = { global: Globe, dealer: Store, customer: User };
const AUDIENCE_OPTIONS = [
  { value: 'global', label: 'Global (everyone)' },
  { value: 'dealer', label: 'Specific Dealer' },
  { value: 'customer', label: 'Specific Customer' },
];

export default function NotificationsSend() {
  const { data, loading, refresh } = useAdminData(() => adminApi.notifications());
  const [audience, setAudience] = useState('global');
  const [targetUser, setTargetUser] = useState(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const setAudienceAndReset = (a) => { setAudience(a); setTargetUser(null); };

  const submit = async (e) => {
    e.preventDefault();
    if (audience !== 'global' && !targetUser) {
      setMsg('Search and select a person to notify.');
      return;
    }
    setBusy(true); setMsg('');
    try {
      const payload = { audience, title, body };
      if (audience !== 'global') payload.target = targetUser._id;
      await adminApi.sendNotification(payload);
      setMsg('Notification sent successfully.');
      setAudience('global'); setTargetUser(null); setTitle(''); setBody('');
      refresh();
    } catch (err) {
      setMsg(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Send Notification" subtitle="Broadcast announcements & targeted updates">
        <Link to="/notifications" className="btn-outline"><ArrowLeft size={14} /> Back to Inbox</Link>
      </PageHeader>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <form onSubmit={submit} className="card card-p space-y-3 lg:col-span-1">
          <h3 className="panel-title">Compose</h3>
          {msg && <div className="rounded-xl bg-brand-50 px-3 py-2 text-sm text-brand-700">{msg}</div>}

          <Field label="Audience">
            <select className="input" value={audience} onChange={(e) => setAudienceAndReset(e.target.value)}>
              {AUDIENCE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </Field>

          {audience !== 'global' && (
            <Field label={audience === 'dealer' ? 'Dealer' : 'Customer'}>
              <UserPicker role={audience} value={targetUser} onChange={setTargetUser} />
            </Field>
          )}

          <div><label className="label">Title</label>
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div><label className="label">Message</label>
            <textarea className="textarea h-28" value={body} onChange={(e) => setBody(e.target.value)} required />
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
