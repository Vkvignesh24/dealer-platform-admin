import { useEffect, useState } from 'react';
import { Save, Loader2 } from 'lucide-react';
import { PageHeader, FormSection, Loader } from '../components/UI';
import { adminApi } from '../api/admin';

/**
 * FIX (real bug): this page used to save only to localStorage, with a
 * note saying it would "sync automatically when the backend API is
 * added" — but that API already exists (`GET/PUT /settings`) and is
 * already consumed by the customer-facing app's Settings screen. This
 * now reads and writes the real business-settings record, so changes
 * made here actually show up in the app (logo, contact details, social
 * links). The endpoint requires the 'dealer' or 'admin' role, which
 * every signed-in admin user already has.
 *
 * Fields were also aligned to the real Settings schema — `tagline`,
 * `hours`, and `about` had no backing field on the server at all, so
 * rather than keep fields that silently went nowhere, they were
 * replaced with the real fields the schema supports (logo, primary
 * color, youtube).
 */
const DEFAULTS = {
  businessName: '',
  logo: '',
  phone: '',
  whatsapp: '',
  email: '',
  address: '',
  primaryColor: '#1E293B',
  social: { facebook: '', instagram: '', youtube: '', website: '' },
};

export default function Settings() {
  const [form, setForm] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    adminApi.settings()
      .then((data) => {
        if (!alive || !data) return;
        setForm({
          businessName: data.businessName || '',
          logo: data.logo || '',
          phone: data.phone || '',
          whatsapp: data.whatsapp || '',
          email: data.email || '',
          address: data.address || '',
          primaryColor: data.primaryColor || '#1E293B',
          social: {
            facebook: data.social?.facebook || '',
            instagram: data.social?.instagram || '',
            youtube: data.social?.youtube || '',
            website: data.social?.website || '',
          },
        });
      })
      .catch(() => setError('Could not load settings. You can still fill the form and try saving.'))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setSocial = (k, v) => setForm((f) => ({ ...f, social: { ...f.social, [k]: v } }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await adminApi.updateSettings(form);
      setMsg('Settings saved — changes are now live in the app.');
      setTimeout(() => setMsg(''), 2500);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader label="Loading settings…" />;

  return (
    <div className="space-y-4 max-w-4xl">
      <PageHeader title="Settings" subtitle="Business information & branding — synced live with your app" />
      <form onSubmit={save} className="card card-p space-y-1">
        {msg && <div className="rounded-xl bg-brand-50 px-3 py-2 text-sm text-brand-700">{msg}</div>}
        {error && <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-danger">{error}</div>}

        <FormSection title="Business Information" description="Shown across the customer app and admin console.">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div><label className="label">Business Name</label><input className="input" value={form.businessName} onChange={(e) => set('businessName', e.target.value)} /></div>
            <div><label className="label">Logo URL</label><input className="input" value={form.logo} onChange={(e) => set('logo', e.target.value)} placeholder="https://…" /></div>
            <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={(e) => set('phone', e.target.value)} /></div>
            <div><label className="label">WhatsApp Number</label><input className="input" value={form.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} placeholder="91XXXXXXXXXX" /></div>
            <div><label className="label">Email</label><input className="input" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} /></div>
            <div className="flex items-end gap-2">
              <div className="flex-1"><label className="label">Brand Color</label><input className="input" value={form.primaryColor} onChange={(e) => set('primaryColor', e.target.value)} /></div>
              <span className="mb-[1px] h-9 w-9 shrink-0 rounded-lg border border-line" style={{ background: form.primaryColor || '#1E293B' }} />
            </div>
            <div className="md:col-span-2"><label className="label">Address</label><input className="input" value={form.address} onChange={(e) => set('address', e.target.value)} /></div>
          </div>
        </FormSection>

        <FormSection title="Social Links">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div><label className="label">Website</label><input className="input" value={form.social.website} onChange={(e) => setSocial('website', e.target.value)} /></div>
            <div><label className="label">Instagram</label><input className="input" value={form.social.instagram} onChange={(e) => setSocial('instagram', e.target.value)} /></div>
            <div><label className="label">Facebook</label><input className="input" value={form.social.facebook} onChange={(e) => setSocial('facebook', e.target.value)} /></div>
            <div><label className="label">YouTube</label><input className="input" value={form.social.youtube} onChange={(e) => setSocial('youtube', e.target.value)} /></div>
          </div>
        </FormSection>

        <div className="flex justify-end pt-4 border-t border-line">
          <button className="btn-primary" disabled={saving}>
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {saving ? 'Saving…' : 'Save settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
