import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, X } from 'lucide-react';
import { adminApi } from '../api/admin';
import { useAdminData } from '../lib/useAdminData';
import { PageHeader, Loader, ErrorState, FormSection, titleCase } from '../components/UI';

const CATEGORIES = ['car', 'bike', 'ev', 'commercial', 'land', 'property'];
const STATUSES = ['available', 'reserved', 'sold', 'archived'];

// FIX (real gap): the brief explicitly calls for "Dynamic Category Fields"
// in the product edit form, and the backend already validates/stores a
// `specifications` map keyed exactly like this (see SPEC_REQUIREMENTS in
// back/src/controllers/productController.js) — but this form never
// exposed it, so admins had no way to edit specs like fuel type, mileage,
// bedrooms, etc. after a product was created. Field keys below match the
// backend's required keys per category exactly.
const CATEGORY_SPECS = {
  car: [
    { key: 'fuel', label: 'Fuel Type', type: 'select', options: ['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid'] },
    { key: 'transmission', label: 'Transmission', type: 'select', options: ['Manual', 'Automatic'] },
    { key: 'year', label: 'Year', type: 'text' },
    { key: 'mileage', label: 'Mileage (km/l)', type: 'text' },
    { key: 'ownership', label: 'Ownership', type: 'select', options: ['1st Owner', '2nd Owner', '3rd Owner', '4th Owner+'] },
  ],
  bike: [
    { key: 'engine', label: 'Engine (cc)', type: 'text' },
    { key: 'mileage', label: 'Mileage (km/l)', type: 'text' },
    { key: 'year', label: 'Year', type: 'text' },
    { key: 'ownership', label: 'Ownership', type: 'select', options: ['1st Owner', '2nd Owner', '3rd Owner', '4th Owner+'] },
  ],
  ev: [
    { key: 'range', label: 'Range (km)', type: 'text' },
    { key: 'battery', label: 'Battery', type: 'text' },
    { key: 'year', label: 'Year', type: 'text' },
    { key: 'transmission', label: 'Transmission', type: 'select', options: ['Manual', 'Automatic'] },
  ],
  commercial: [
    { key: 'fuel', label: 'Fuel Type', type: 'select', options: ['Petrol', 'Diesel', 'CNG', 'Electric'] },
    { key: 'transmission', label: 'Transmission', type: 'select', options: ['Manual', 'Automatic'] },
    { key: 'year', label: 'Year', type: 'text' },
    { key: 'payload', label: 'Payload Capacity', type: 'text' },
  ],
  land: [
    { key: 'area', label: 'Area', type: 'text' },
    { key: 'unit', label: 'Unit', type: 'select', options: ['sqft', 'sqyd', 'acre', 'hectare'] },
    { key: 'surveyNumber', label: 'Survey Number', type: 'text' },
  ],
  property: [
    { key: 'bedrooms', label: 'Bedrooms', type: 'select', options: ['1', '2', '3', '4', '5+'] },
    { key: 'bathrooms', label: 'Bathrooms', type: 'select', options: ['1', '2', '3', '4+'] },
    { key: 'area', label: 'Area (sqft)', type: 'text' },
    { key: 'furnishing', label: 'Furnishing', type: 'select', options: ['Unfurnished', 'Semi-Furnished', 'Fully Furnished'] },
  ],
};

export default function ProductEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, loading, error } = useAdminData(() => adminApi.product(id), [id]);
  const [form, setForm] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (data && !form) {
      setForm({
        name: data.name || '',
        category: data.category || '',
        subcategory: data.subcategory || '',
        brand: data.brand || '',
        model: data.model || '',
        variant: data.variant || '',
        year: data.year || '',
        price: data.price || '',
        status: data.status || 'available',
        description: data.description || '',
        location: data.location || '',
        featured: !!data.featured,
        images: (data.images || []).join('\n'),
        video: data.video || '',
        features: (data.features || []).join(', '),
        specifications: data.specifications || {},
      });
    }
  }, [data, form]);

  if (loading && !form) return <Loader />;
  if (error) return <ErrorState message={error} />;
  if (!form) return null;

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setSpec = (k, v) => setForm((f) => ({ ...f, specifications: { ...f.specifications, [k]: v } }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setMsg('');
    try {
      const payload = {
        ...form,
        price: Number(form.price) || 0,
        year: form.year ? Number(form.year) : undefined,
        images: form.images.split('\n').map((s) => s.trim()).filter(Boolean),
        features: form.features.split(',').map((s) => s.trim()).filter(Boolean),
        specifications: form.specifications,
        video: form.video.trim() || undefined,
      };
      await adminApi.updateProduct(id, payload);
      setMsg('Saved');
      setTimeout(() => navigate(`/products/${id}`), 500);
    } catch (err) {
      setMsg(err.message || 'Save failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link to={`/products/${id}`} className="icon-btn"><ArrowLeft size={17} /></Link>
        <div>
          <h1 className="page-title">Edit Product</h1>
          <p className="page-sub">Update product information</p>
        </div>
      </div>

      <form onSubmit={submit} className="card card-p space-y-2">
        {msg && (
          <div className={`rounded-xl px-3 py-2 text-sm ${msg === 'Saved' ? 'bg-brand-50 text-brand-700' : 'bg-red-50 text-danger'}`}>{msg}</div>
        )}

        <FormSection title="Basic Information" description="Core product details">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div><label className="label">Name</label><input className="input" value={form.name} onChange={(e) => set('name', e.target.value)} required /></div>
            <div><label className="label">Status</label>
              <select className="input" value={form.status} onChange={(e) => set('status', e.target.value)}>
                {STATUSES.map((s) => <option key={s} value={s}>{titleCase(s)}</option>)}
              </select>
            </div>
            <div><label className="label">Brand</label><input className="input" value={form.brand} onChange={(e) => set('brand', e.target.value)} /></div>
            <div><label className="label">Model</label><input className="input" value={form.model} onChange={(e) => set('model', e.target.value)} /></div>
            <div><label className="label">Variant</label><input className="input" value={form.variant} onChange={(e) => set('variant', e.target.value)} /></div>
            <div><label className="label">Year</label><input type="number" className="input" value={form.year} onChange={(e) => set('year', e.target.value)} /></div>
          </div>
        </FormSection>

        <FormSection title="Category" description="Classify the product">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div><label className="label">Category</label>
              <select className="input" value={form.category} onChange={(e) => set('category', e.target.value)} required>
                <option value="">Select</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{titleCase(c)}</option>)}
              </select>
            </div>
            <div><label className="label">Sub-category</label><input className="input" value={form.subcategory} onChange={(e) => set('subcategory', e.target.value)} /></div>
          </div>
        </FormSection>

        <FormSection title="Pricing & Location">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div><label className="label">Price (₹)</label><input type="number" className="input" value={form.price} onChange={(e) => set('price', e.target.value)} required /></div>
            <div><label className="label">Location</label><input className="input" value={form.location} onChange={(e) => set('location', e.target.value)} /></div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.featured} onChange={(e) => set('featured', e.target.checked)} /> Mark as featured
          </label>
        </FormSection>

        <FormSection title="Media" description="One image URL per line">
          <textarea className="textarea h-28 font-mono text-xs" value={form.images} onChange={(e) => set('images', e.target.value)} placeholder="https://…" />
          <div className="mt-3">
            <label className="label">Video URL (optional)</label>
            <input className="input" value={form.video} onChange={(e) => set('video', e.target.value)} placeholder="https://youtube.com/… or direct video URL" />
          </div>
        </FormSection>

        <FormSection title="Description & Features">
          <textarea className="textarea h-32" value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Describe the product…" />
          <div className="mt-3">
            <label className="label">Features (comma-separated)</label>
            <input className="input" value={form.features} onChange={(e) => set('features', e.target.value)} placeholder="Sunroof, Leather seats, …" />
          </div>
        </FormSection>

        {CATEGORY_SPECS[form.category] && (
          <FormSection
            title={`${titleCase(form.category)} Specifications`}
            description="These fields are validated and indexed by the backend for search and filtering."
          >
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {CATEGORY_SPECS[form.category].map((spec) => (
                <div key={spec.key}>
                  <label className="label">{spec.label}</label>
                  {spec.type === 'select' ? (
                    <select
                      className="input"
                      value={form.specifications[spec.key] || ''}
                      onChange={(e) => setSpec(spec.key, e.target.value)}
                    >
                      <option value="">— select —</option>
                      {spec.options.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input
                      className="input"
                      value={form.specifications[spec.key] || ''}
                      onChange={(e) => setSpec(spec.key, e.target.value)}
                      placeholder={spec.label}
                    />
                  )}
                </div>
              ))}
            </div>
          </FormSection>
        )}

        <div className="flex justify-end gap-2 border-t border-line pt-4">
          <Link to={`/products/${id}`} className="btn-outline"><X size={15} /> Cancel</Link>
          <button type="submit" className="btn-primary" disabled={busy}><Save size={15} /> {busy ? 'Saving…' : 'Save changes'}</button>
        </div>
      </form>
    </div>
  );
}
