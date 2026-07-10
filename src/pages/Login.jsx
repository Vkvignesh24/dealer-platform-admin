import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Loader2, Car, BarChart3, Users, Package } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => { if (user) navigate('/', { replace: true }); });
    return () => unsub();
  }, [navigate]);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      navigate('/', { replace: true });
    } catch (err) {
      setError('Invalid credentials. Please check your email and password.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-2 bg-canvas">
      {/* Left brand panel */}
      <div className="hidden lg:flex flex-col justify-between bg-primary-900 p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(circle at 15% 25%, rgba(37,99,235,0.25) 0%, transparent 45%), radial-gradient(circle at 85% 75%, rgba(16,185,129,0.15) 0%, transparent 45%)'
        }} />
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '32px 32px'
        }} />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-500 shadow-lg">
              <Car size={20} className="text-white" />
            </span>
            <div>
              <p className="font-bold text-white">DealerHub</p>
              <p className="text-[10px] uppercase tracking-widest text-primary-500">Admin Console</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <div>
            <h2 className="text-4xl font-extrabold leading-tight">
              The command center for<br />
              <span className="text-brand-400">modern dealerships.</span>
            </h2>
            <p className="mt-4 max-w-md text-primary-400 text-[15px] leading-relaxed">
              Manage your entire inventory, leads, customers, and financing pipeline from a single premium platform.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 max-w-sm">
            {[
              { icon: Package, label: 'Inventory', sub: 'Full control' },
              { icon: Users, label: 'Customers', sub: 'CRM ready' },
              { icon: BarChart3, label: 'Analytics', sub: 'Real-time' },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="rounded-xl border border-white/10 bg-white/5 p-3">
                <Icon size={18} className="text-brand-400 mb-2" />
                <p className="text-[12px] font-semibold text-white">{label}</p>
                <p className="text-[10px] text-primary-500">{sub}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs text-primary-600">© DealerHub Platform. All rights reserved.</p>
      </div>

      {/* Right: login form */}
      <div className="flex items-center justify-center p-6 min-h-screen lg:min-h-0">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-900">
              <Car size={20} className="text-white" />
            </span>
            <p className="font-bold text-ink text-lg">DealerHub Admin</p>
          </div>

          <div className="mb-6">
            <h1 className="text-[28px] font-bold text-ink">Welcome back</h1>
            <p className="text-sm text-muted mt-1">Sign in to your admin account to continue.</p>
          </div>

          <div className="card card-p shadow-soft">
            {error && (
              <div className="mb-4 flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-danger">
                <span className="mt-0.5 shrink-0">⚠</span>
                <span>{error}</span>
              </div>
            )}
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="label">Email address</label>
                <input
                  className="input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@dealerhub.com"
                  required
                  autoComplete="email"
                />
              </div>
              <div>
                <label className="label">Password</label>
                <input
                  className="input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
              </div>
              <button className="btn-primary w-full py-3 text-[15px]" disabled={busy}>
                {busy && <Loader2 size={16} className="animate-spin" />}
                {busy ? 'Signing in…' : 'Sign in'}
              </button>
            </form>
          </div>

          <p className="mt-4 text-center text-xs text-muted">
            Only accounts with the <span className="font-semibold text-primary-700">admin</span> role can access this panel.
          </p>
        </div>
      </div>
    </div>
  );
}
