import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { LogOut, KeyRound, Shield, ShieldCheck, Package, Target, Banknote, ShoppingBag, Undo2 } from 'lucide-react';
import { PageHeader, KV, timeAgo, titleCase } from '../components/UI';
import { adminApi } from '../api/admin';

const ACTIVITY_ICONS = {
  product_created: Package, product_updated: Package,
  lead_updated: Target, loan_updated: Banknote,
  sale_created: ShoppingBag, sale_reversed: Undo2,
};
const ACTIVITY_LABELS = {
  product_created: 'Last Product Created', product_updated: 'Last Product Update',
  lead_updated: 'Last Lead Update', loan_updated: 'Last Loan Update',
  sale_created: 'Last Sale', sale_reversed: 'Last Sale Reversal',
};

export default function Profile() {
  const navigate = useNavigate();
  const user = auth.currentUser;
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [backendUser, setBackendUser] = useState(null);
  const [activity, setActivity] = useState([]);

  useEffect(() => {
    adminApi.me().then(setBackendUser).catch(() => {});
    adminApi.recentActivity().then(setActivity).catch(() => {});
  }, []);

  const logout = async () => { await signOut(auth); navigate('/login', { replace: true }); };
  const sendReset = async () => {
    if (!user?.email) return;
    setBusy(true); setMsg('');
    try { await sendPasswordResetEmail(auth, user.email); setMsg('Password reset email sent.'); }
    catch (e) { setMsg(e.message || 'Failed to send reset email.'); }
    finally { setBusy(false); }
  };

  const initial = (user?.email || 'A')[0].toUpperCase();

  return (
    <div className="space-y-4 max-w-4xl">
      <PageHeader title="Profile" subtitle="Your admin account" />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="card card-p flex flex-col items-center text-center">
          <span className="grid h-20 w-20 place-items-center rounded-2xl bg-primary-800 text-3xl font-bold text-white">{initial}</span>
          <p className="mt-3 font-bold text-ink">{user?.displayName || user?.email?.split('@')[0] || 'Admin'}</p>
          <p className="text-xs text-muted">{user?.email}</p>
          <span className="badge badge-success mt-2"><Shield size={11} /> {titleCase(backendUser?.role || 'Administrator')}</span>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="card card-p">
            <h3 className="panel-title mb-2">Account Details</h3>
            <div className="grid grid-cols-2 gap-x-6 divide-y divide-line">
              <KV label="Display name" value={user?.displayName || '—'} />
              <KV label="Email" value={user?.email} />
              <KV label="Firebase UID" value={user?.uid} mono />
              <KV label="Provider" value={user?.providerData?.[0]?.providerId || 'password'} />
              <KV label="Role" value={titleCase(backendUser?.role || '—')} />
              <KV label="Email verified" value={user?.emailVerified ? 'Yes' : 'No'} />
              <KV label="Account created" value={backendUser?.createdAt ? new Date(backendUser.createdAt).toLocaleDateString('en-IN') : '—'} />
              <KV label="Last login" value={backendUser?.lastLoginAt ? new Date(backendUser.lastLoginAt).toLocaleString('en-IN') : (user?.metadata?.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleString('en-IN') : '—')} />
            </div>
          </div>

          <div className="card card-p">
            <h3 className="panel-title mb-3">Recent Activity</h3>
            {activity.length === 0 ? (
              <p className="text-sm text-muted py-2">No activity recorded yet.</p>
            ) : (
              <div className="divide-y divide-line">
                {activity.map((a) => {
                  const Icon = ACTIVITY_ICONS[a.action] || Package;
                  return (
                    <div key={a._id} className="flex items-center gap-3 py-2.5">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary-100 text-primary-700"><Icon size={14} /></span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-muted">{ACTIVITY_LABELS[a.action] || titleCase(a.action)}</p>
                        <p className="text-sm text-ink truncate">{a.entityLabel || '—'} {a.performedByName ? `· by ${a.performedByName}` : ''}</p>
                      </div>
                      <span className="shrink-0 text-[11px] text-muted">{timeAgo(a.createdAt)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="card card-p">
            <h3 className="panel-title mb-3">Security</h3>
            {msg && <div className="mb-3 rounded-xl bg-brand-50 px-3 py-2 text-sm text-brand-700">{msg}</div>}
            <div className="flex flex-wrap gap-2">
              <button className="btn-outline" onClick={sendReset} disabled={busy || !user?.email}>
                <KeyRound size={14} /> Send password reset email
              </button>
              <button className="btn-danger" onClick={logout}>
                <LogOut size={14} /> Sign out
              </button>
            </div>
            <div className="mt-4 flex items-center justify-between rounded-xl border border-dashed border-line px-3 py-2.5">
              <div className="flex items-center gap-2">
                <ShieldCheck size={15} className="text-muted" />
                <div>
                  <p className="text-sm font-semibold text-ink">Two-Factor Authentication</p>
                  <p className="text-[11.5px] text-muted">Add an extra layer of security to your account.</p>
                </div>
              </div>
              <span className="badge badge-neutral">Coming soon</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
