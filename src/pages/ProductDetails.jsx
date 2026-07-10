import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Pencil, Archive, Trash2, MapPin, Eye, Target, Banknote,
  Heart, Calendar, Fuel, Gauge, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { adminApi } from '../api/admin';
import { useAdminData } from '../lib/useAdminData';
import {
  Loader, ErrorState, KV, StatusBadge, PRODUCT_STATUS_MAP, LEAD_STATUS_MAP, LOAN_STATUS_MAP,
  formatCurrency, formatDate, formatDateTime, titleCase, MetricChip, SectionLabel,
} from '../components/UI';

function formatPriceFull(n) {
  const v = Number(n) || 0;
  return `₹${v.toLocaleString('en-IN')}`;
}

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, loading, error, refresh } = useAdminData(() => adminApi.product(id), [id]);
  const [active, setActive] = useState(0);

  const onArchive = async () => {
    if (!confirm('Archive this product?')) return;
    await adminApi.archiveProduct(id); refresh();
  };
  const onDelete = async () => {
    if (!confirm('Delete this product permanently?')) return;
    await adminApi.deleteProduct(id);
    navigate('/products');
  };

  if (loading && !data) return <Loader />;
  if (error) return <ErrorState message={error} onRetry={refresh} />;
  if (!data) return null;

  const p = data;
  const images = p.images?.length ? p.images : ['https://placehold.co/800x500?text=No+Image'];

  const prev = () => setActive((i) => (i - 1 + images.length) % images.length);
  const next = () => setActive((i) => (i + 1) % images.length);

  const specs = [
    { label: 'Year', value: p.year, icon: Calendar },
    { label: 'Fuel', value: p.fuel, icon: Fuel },
    { label: 'Transmission', value: p.transmission, icon: Gauge },
    { label: 'Mileage', value: p.mileage ? `${p.mileage} km` : null },
    { label: 'Color', value: p.color },
    { label: 'Engine', value: p.engine },
    { label: 'Seats', value: p.seats },
    { label: 'Body Type', value: p.bodyType },
  ].filter((s) => s.value);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link to="/products" className="icon-btn"><ArrowLeft size={17} /></Link>
          <div>
            <h1 className="page-title">{p.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="badge badge-neutral capitalize">{p.category}</span>
              <StatusBadge status={p.status} map={PRODUCT_STATUS_MAP} />
              {p.featured && <span className="badge badge-warning">Featured</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link to={`/products/${id}/edit`} className="btn-primary"><Pencil size={14} /> Edit</Link>
          <button className="btn-outline" onClick={onArchive}><Archive size={14} /> Archive</button>
          <button className="btn-outline text-danger border-red-200 hover:bg-red-50" onClick={onDelete}><Trash2 size={14} /> Delete</button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        {/* Gallery & Description */}
        <div className="lg:col-span-3 space-y-4">
          {/* Main image with nav */}
          <div className="card overflow-hidden">
            <div className="relative">
              <img src={images[active]} alt={p.name} className="h-[380px] w-full object-cover bg-primary-100" />
              {images.length > 1 && (
                <>
                  <button onClick={prev}
                    className="absolute left-3 top-1/2 -translate-y-1/2 grid h-9 w-9 place-items-center rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors">
                    <ChevronLeft size={18} />
                  </button>
                  <button onClick={next}
                    className="absolute right-3 top-1/2 -translate-y-1/2 grid h-9 w-9 place-items-center rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors">
                    <ChevronRight size={18} />
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {images.map((_, i) => (
                      <button key={i} onClick={() => setActive(i)}
                        className={`h-1.5 transition-all rounded-full ${i === active ? 'w-6 bg-white' : 'w-1.5 bg-white/50'}`} />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="grid grid-cols-6 gap-2">
              {images.map((src, i) => (
                <button key={i} onClick={() => setActive(i)}
                  className={`overflow-hidden rounded-xl border-2 transition-colors ${active === i ? 'border-brand-500' : 'border-line hover:border-primary-300'}`}>
                  <img src={src} alt="" className="h-14 w-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Specs */}
          {specs.length > 0 && (
            <div className="card card-p">
              <h3 className="panel-title mb-4">Specifications</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {specs.map(({ label, value }) => (
                  <MetricChip key={label} label={label} value={titleCase(String(value))} />
                ))}
              </div>
            </div>
          )}

          {p.description && (
            <div className="card card-p">
              <h3 className="panel-title mb-3">Description</h3>
              <p className="text-sm text-primary-700 whitespace-pre-line leading-relaxed">{p.description}</p>
            </div>
          )}

          {p.features?.length > 0 && (
            <div className="card card-p">
              <h3 className="panel-title mb-3">Features</h3>
              <div className="flex flex-wrap gap-2">
                {p.features.map((f, i) => (
                  <span key={i} className="rounded-lg border border-line bg-primary-50 px-3 py-1 text-[12px] font-medium text-primary-700">{f}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: details & metrics */}
        <div className="lg:col-span-2 space-y-4">
          {/* Price card */}
          <div className="card card-p">
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted mb-1">Asking Price</p>
            <p className="text-3xl font-extrabold text-ink">{formatPriceFull(p.price)}</p>
            {p.location && (
              <div className="flex items-center gap-1.5 mt-2 text-sm text-muted">
                <MapPin size={13} /> {p.location}
              </div>
            )}
          </div>

          {/* Business metrics */}
          <div className="card card-p">
            <h3 className="panel-title mb-3">Business Metrics</h3>
            <div className="grid grid-cols-2 gap-3">
              <MetricChip label="Views" value={p.views ?? 0} />
              <MetricChip label="Leads" value={p.leadCount ?? 0} accent="brand" />
              <MetricChip label="Wishlist" value={p.wishlistCount ?? 0} accent="warn" />
              <MetricChip label="Loan Requests" value={p.loanCount ?? 0} accent="success" />
            </div>
          </div>

          {/* Product details */}
          <div className="card card-p">
            <h3 className="panel-title mb-3">Product Details</h3>
            <div className="divide-y divide-line">
              <KV label="Product ID" value={p._id} mono />
              <KV label="Category" value={titleCase(p.category)} />
              {p.brand && <KV label="Brand" value={p.brand} />}
              {p.model && <KV label="Model" value={p.model} />}
              <KV label="Status" value={titleCase(p.status)} highlight />
              <KV label="Listed On" value={formatDate(p.createdAt)} />
              <KV label="Last Updated" value={formatDate(p.updatedAt)} />
            </div>
          </div>

          {/* Dealer info */}
          {p.createdBy && (
            <div className="card card-p">
              <h3 className="panel-title mb-3">Listed By</h3>
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-primary-800 text-white font-bold shrink-0">
                  {(p.createdBy.name || 'D')[0].toUpperCase()}
                </span>
                <div>
                  <p className="font-semibold text-ink">{p.createdBy.name || '—'}</p>
                  <p className="text-xs text-muted">{p.createdBy.email || '—'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Related Leads */}
          {p.leads?.length > 0 && (
            <div className="card card-p">
              <div className="flex items-center justify-between mb-3">
                <h3 className="panel-title">Recent Leads</h3>
                <Link to={`/leads?product=${id}`} className="text-xs font-semibold text-brand-600 hover:text-brand-700">
                  View all →
                </Link>
              </div>
              <div className="space-y-2">
                {p.leads.slice(0, 4).map((l) => (
                  <Link key={l._id} to={`/leads/${l._id}`}
                    className="flex items-center justify-between rounded-xl border border-line px-3 py-2 hover:bg-primary-50 transition-colors">
                    <div>
                      <p className="text-sm font-semibold text-ink">{l.customerName}</p>
                      <p className="text-[11px] text-muted">{formatDate(l.createdAt)}</p>
                    </div>
                    <StatusBadge status={l.status} map={LEAD_STATUS_MAP} />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Related Loans */}
          {p.loans?.length > 0 && (
            <div className="card card-p">
              <div className="flex items-center justify-between mb-3">
                <h3 className="panel-title">Loan Requests</h3>
                <Link to={`/loans?product=${id}`} className="text-xs font-semibold text-brand-600 hover:text-brand-700">
                  View all →
                </Link>
              </div>
              <div className="space-y-2">
                {p.loans.slice(0, 3).map((l) => (
                  <Link key={l._id} to={`/loans/${l._id}`}
                    className="flex items-center justify-between rounded-xl border border-line px-3 py-2 hover:bg-primary-50 transition-colors">
                    <div>
                      <p className="text-sm font-semibold text-ink">{l.name}</p>
                      <p className="text-[11px] text-muted">{formatCurrency(l.loanAmount)}</p>
                    </div>
                    <StatusBadge status={l.status} map={LOAN_STATUS_MAP} />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
