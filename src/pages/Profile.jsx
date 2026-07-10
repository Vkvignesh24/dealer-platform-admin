import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { LogOut, KeyRound, Shield, Mail, User as UserIcon } from 'lucide-react';
import { PageHeader, KV } from '../components/UI';

export default function Profile() {
  const navigate = useNavigate();
  const user = auth.currentUser;
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

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
          <span className="badge badge-success mt-2"><Shield size={11} /> Administrator</span>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="card card-p">
            <h3 className="panel-title mb-2">Account Details</h3>
            <div className="grid grid-cols-2 gap-x-6 divide-y divide-line">
              <KV label="Display name" value={user?.displayName || '—'} />
              <KV label="Email" value={user?.email} />
              <KV label="User ID" value={user?.uid} mono />
              <KV label="Provider" value={user?.providerData?.[0]?.providerId || 'password'} />
              <KV label="Email verified" value={user?.emailVerified ? 'Yes' : 'No'} />
              <KV label="Last sign-in" value={user?.metadata?.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleString('en-IN') : '—'} />
            </div>
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
          </div>
        </div>
      </div>
    </div>
  );
}
