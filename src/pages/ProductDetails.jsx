import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Pencil, Archive, Trash2, MapPin, Eye, Target, Banknote,
  Heart, Calendar, Fuel, Gauge, ChevronLeft, ChevronRight, Tag, KeyRound,
  History, Undo2, CheckCircle2, XCircle, Lock, PackageCheck, Maximize2, X
} from 'lucide-react';
import { adminApi } from '../api/admin';
import { useAdminData } from '../lib/useAdminData';
import {
  Loader, ErrorState, KV, StatusBadge, PRODUCT_STATUS_MAP, LEAD_STATUS_MAP, LOAN_STATUS_MAP,
  formatCurrencyFull, formatDate, formatDateTime, titleCase, MetricChip, SectionLabel, TimelineItem,
} from '../components/UI';
import MarkSoldDialog from '../components/MarkSoldDialog';
import ReserveDialog from '../components/ReserveDialog';
import ReverseSaleDialog from '../components/ReverseSaleDialog';

const TIMELINE_ICONS = {
  created: { icon: PackageCheck, cls: 'bg-primary-500' },
  status: { icon: History, cls: 'bg-primary-400' },
  lead: { icon: Target, cls: 'bg-blue-500' },
  reservation: { icon: Lock, cls: 'bg-amber-500' },
  reservation_released: { icon: Undo2, cls: 'bg-amber-400' },
  sale: { icon: CheckCircle2, cls: 'bg-success-500' },
  reverse: { icon: XCircle, cls: 'bg-danger' },
};

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, loading, error, refresh } = useAdminData(() => adminApi.product(id), [id]);
  const [active, setActive] = useState(0);
  const [showSold, setShowSold] = useState(false);
  const [showReserve, setShowReserve] = useState(false);
  const [showReverseSale, setShowReverseSale] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false); // NEW: Lightbox State

  const onArchive = async () => {
    if (!confirm('Archive this product?')) return;
    await adminApi.archiveProduct(id); refresh();
  };
  
  const onDelete = async () => {
    if (!confirm('Delete this product permanently?')) return;
    await adminApi.deleteProduct(id);
    navigate('/products');
  };
  
  const onReleaseReservation = async () => {
    if (!data?.reservation) return;
    if (!confirm('Release this reservation? The product will become available again.')) return;
    await adminApi.releaseReservation(data.reservation._id);
    refresh();
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
    <div className="space-y-5 pb-10">
      
      {/* --- FULL SCREEN LIGHTBOX --- */}
      {showLightbox && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 sm:p-8">
          <button 
            onClick={() => setShowLightbox(false)}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2.5 rounded-full backdrop-blur-md transition-all z-50"
          >
            <X size={24} />
          </button>
          
          <div className="relative w-full h-full flex items-center justify-center max-w-6xl">
            <img 
              src={images[active]} 
              alt="Full view" 
              className="max-h-full max-w-full object-contain rounded-xl shadow-2xl" 
            />
            
            {images.length > 1 && (
              <>
                <button onClick={prev} className="absolute left-0 sm:-left-12 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-black/40 hover:bg-black/60 p-3 sm:p-4 rounded-full backdrop-blur-md transition-all">
                  <ChevronLeft size={32} />
                </button>
                <button onClick={next} className="absolute right-0 sm:-right-12 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-black/40 hover:bg-black/60 p-3 sm:p-4 rounded-full backdrop-blur-md transition-all">
                  <ChevronRight size={32} />
                </button>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-2 p-3 rounded-full bg-black/50 backdrop-blur-md">
                  {images.map((_, i) => (
                    <button key={i} onClick={() => setActive(i)} className={`h-2 transition-all rounded-full ${i === active ? 'w-8 bg-white shadow-sm' : 'w-2 bg-white/50 hover:bg-white/80'}`} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* 1. Page Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Link to="/products" className="icon-btn mt-1 shrink-0"><ArrowLeft size={18} /></Link>
          <div>
            <h1 className="page-title leading-tight">{p.name}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="badge badge-neutral capitalize">{p.category}</span>
              <StatusBadge status={p.status} map={PRODUCT_STATUS_MAP} />
              {p.featured && <span className="badge badge-warning">Featured</span>}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {p.status === 'available' && (
            <>
              <button className="btn-primary" onClick={() => setShowSold(true)}><Tag size={14} /> Mark As Sold</button>
              <button className="btn-outline" onClick={() => setShowReserve(true)}><KeyRound size={14} /> Reserve</button>
            </>
          )}
          {p.status === 'reserved' && (
            <>
              <button className="btn-primary" onClick={() => setShowSold(true)}><Tag size={14} /> Mark As Sold</button>
              <button className="btn-outline" onClick={onReleaseReservation}>Release</button>
            </>
          )}
          {p.status === 'sold' && (
            <button className="btn-outline text-danger border-red-200 hover:bg-red-50" onClick={() => setShowReverseSale(true)}>Reverse Sale</button>
          )}
          <Link to={`/products/${id}/edit`} className="btn-outline"><Pencil size={14} /> Edit</Link>
          {p.status !== 'archived' && (
            <button className="btn-outline" onClick={onArchive}><Archive size={14} /> Archive</button>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <MarkSoldDialog open={showSold} onClose={() => setShowSold(false)} product={p} onSuccess={refresh} />
      <ReserveDialog open={showReserve} onClose={() => setShowReserve(false)} product={p} onSuccess={refresh} />
      {data?.sale && (
        <ReverseSaleDialog
          open={showReverseSale}
          onClose={() => setShowReverseSale(false)}
          sale={{ ...data.sale, product: p }}
          onSuccess={refresh}
        />
      )}

      {/* 2. Main Product Grid (Visuals Left, Core Data Right) */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5 items-start">
        
        {/* LEFT COLUMN: Visuals & Text */}
        <div className="lg:col-span-3 space-y-5">
          {/* Gallery */}
          <div className="card overflow-hidden">
            <div 
              className="relative group cursor-pointer" 
              onClick={() => setShowLightbox(true)}
            >
              <img 
                src={images[active]} 
                alt={p.name} 
                className="h-[350px] sm:h-[450px] w-full object-cover bg-primary-100 transition-all" 
              />
              <div className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                <Maximize2 size={18} />
              </div>
              
              {images.length > 1 && (
                <>
                  <button onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute left-3 top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 hover:bg-black/80 transition-all backdrop-blur-sm">
                    <ChevronLeft size={20} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); next(); }} className="absolute right-3 top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 hover:bg-black/80 transition-all backdrop-blur-sm">
                    <ChevronRight size={20} />
                  </button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 p-2 rounded-full bg-black/20 backdrop-blur-md">
                    {images.map((_, i) => (
                      <button key={i} onClick={(e) => { e.stopPropagation(); setActive(i); }} className={`h-1.5 transition-all rounded-full ${i === active ? 'w-6 bg-white shadow-sm' : 'w-1.5 bg-white/50 hover:bg-white/80'}`} />
                    ))}
                  </div>
                </>
              )}
            </div>
            
            {/* Thumbnails (Flex scroll instead of rigid grid) */}
            {images.length > 1 && (
              <div className="flex overflow-x-auto gap-2 p-3 bg-primary-50/50 border-t border-line scrollbar-hide">
                {images.map((src, i) => (
                  <button key={i} onClick={() => setActive(i)} className={`overflow-hidden shrink-0 rounded-lg border-2 transition-all ${active === i ? 'border-brand-500 shadow-sm opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                    <img src={src} alt="" className="h-16 w-24 object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Specs Grid */}
          {specs.length > 0 && (
            <div className="card card-p">
              <h3 className="panel-title mb-4">Specifications</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {specs.map(({ label, value }) => (
                  <MetricChip key={label} label={label} value={titleCase(String(value))} />
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {p.description && (
            <div className="card card-p">
              <h3 className="panel-title mb-3">Description</h3>
              <p className="text-sm text-primary-700 whitespace-pre-line leading-relaxed">{p.description}</p>
            </div>
          )}

          {/* Features */}
          {p.features?.length > 0 && (
            <div className="card card-p">
              <h3 className="panel-title mb-3">Features</h3>
              <div className="flex flex-wrap gap-2">
                {p.features.map((f, i) => (
                  <span key={i} className="rounded-lg border border-line bg-primary-50 px-3 py-1.5 text-[12px] font-medium text-primary-700">{f}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Operational Details (Kept short to avoid empty space) */}
        <div className="lg:col-span-2 space-y-5">
          {/* Price Card */}
          <div className="card card-p bg-gradient-to-br from-white to-primary-50/50">
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted mb-1">Asking Price</p>
            <p className="text-3xl font-extrabold text-ink">{formatCurrencyFull(p.price)}</p>
            {p.location && (
              <div className="flex items-center gap-1.5 mt-3 text-sm text-muted bg-white border border-line px-3 py-2 rounded-lg w-fit">
                <MapPin size={14} className="text-primary-400" /> {p.location}
              </div>
            )}
          </div>

          {/* Sold Details Highlight */}
          {p.status === 'sold' && p.sale && (
            <div className="card card-p border-l-4 border-l-success-500 bg-success-50/30">
              <h3 className="panel-title mb-3 text-success-800">Sold Details</h3>
              <div className="divide-y divide-success-200/50">
                <KV label="Sold To" value={p.sale.customer?.name || '—'} highlight />
                <KV label="Sold Date" value={formatDate(p.sale.soldDate)} />
                <KV label="Sale Price" value={formatCurrencyFull(p.sale.salePrice)} />
                <KV label="Payment Method" value={titleCase(p.sale.paymentMethod)} />
              </div>
            </div>
          )}

          {/* Reserved Details Highlight */}
          {p.status === 'reserved' && p.reservation && (
            <div className="card card-p border-l-4 border-l-amber-500 bg-amber-50/30">
              <h3 className="panel-title mb-3 text-amber-800">Reservation Details</h3>
              <div className="divide-y divide-amber-200/50">
                <KV label="Reserved By" value={p.reservation.customer?.name || '—'} highlight />
                <KV label="Booking Amount" value={formatCurrencyFull(p.reservation.bookingAmount)} />
                <KV label="Reservation Date" value={formatDate(p.reservation.reservedAt)} />
              </div>
            </div>
          )}

          {/* Business Metrics */}
          <div className="card card-p">
            <h3 className="panel-title mb-3">Performance Metrics</h3>
            <div className="grid grid-cols-2 gap-3">
              <MetricChip label="Views" value={p.views ?? 0} />
              <MetricChip label="Leads" value={p.leadCount ?? 0} accent="brand" />
              <MetricChip label="Wishlist" value={p.wishlistCount ?? 0} accent="warn" />
              <MetricChip label="Loan Requests" value={p.loanCount ?? 0} accent="success" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. System Data & Listed By (Moved BELOW the main grid to prevent awkward stretching) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-2">
        <div className="card card-p">
          <h3 className="panel-title mb-3">System Details</h3>
          <div className="divide-y divide-line">
            <KV label="Product ID" value={p._id} mono />
            <KV label="Listed On" value={formatDate(p.createdAt)} />
            <KV label="Last Updated" value={formatDate(p.updatedAt)} />
          </div>
        </div>

        {p.createdBy && (
          <div className="card card-p">
            <h3 className="panel-title mb-3">Listed By</h3>
            <div className="flex items-center gap-4 mt-2">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-indigo-100 text-indigo-700 font-bold text-lg shrink-0">
                {(p.createdBy.name || 'D')[0].toUpperCase()}
              </span>
              <div>
                <p className="font-semibold text-ink text-base">{p.createdBy.name || '—'}</p>
                <p className="text-sm text-muted">{p.createdBy.email || '—'}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. CRM (Leads & Loans) */}
      {(p.leads?.length > 0 || p.loans?.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-2">
          {p.leads?.length > 0 && (
            <div className="card card-p h-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="panel-title">Recent Leads</h3>
                <Link to={`/leads?product=${id}`} className="text-xs font-semibold text-brand-600 hover:text-brand-700">View all →</Link>
              </div>
              <div className="space-y-2">
                {p.leads.slice(0, 5).map((l) => (
                  <Link key={l._id} to={`/leads/${l._id}`} className="flex items-center justify-between rounded-xl border border-line px-4 py-3 hover:bg-primary-50 transition-colors">
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

          {p.loans?.length > 0 && (
            <div className="card card-p h-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="panel-title">Loan Requests</h3>
                <Link to={`/loans?product=${id}`} className="text-xs font-semibold text-brand-600 hover:text-brand-700">View all →</Link>
              </div>
              <div className="space-y-2">
                {p.loans.slice(0, 5).map((l) => (
                  <Link key={l._id} to={`/loans/${l._id}`} className="flex items-center justify-between rounded-xl border border-line px-4 py-3 hover:bg-primary-50 transition-colors">
                    <div>
                      <p className="text-sm font-semibold text-ink">{l.name}</p>
                      <p className="text-[11px] text-muted">{formatCurrencyFull(l.loanAmount)}</p>
                    </div>
                    <StatusBadge status={l.status} map={LOAN_STATUS_MAP} />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. Sale History (Full Width) */}
      {p.saleHistory?.length > 1 && (
        <div className="card card-p mt-2">
          <h3 className="panel-title mb-4">Complete Sale History</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {p.saleHistory.map((s) => (
              <div key={s._id} className={`flex flex-col rounded-xl border p-4 ${s.status === 'active' ? 'border-success-200 bg-success-50/40' : 'border-line bg-primary-50/40'}`}>
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm font-bold text-ink">{s.customer?.name || '—'}</p>
                  <span className={`badge ${s.status === 'active' ? 'badge-success' : 'badge-neutral'}`}>{titleCase(s.status)}</span>
                </div>
                <div className="text-[12px] text-muted space-y-1">
                  <p>Date: <span className="font-medium text-ink">{formatDate(s.soldDate)}</span></p>
                  <p>Price: <span className="font-medium text-ink">{formatCurrencyFull(s.salePrice)}</span></p>
                  {s.status === 'reversed' && s.reverseReason && (
                    <p className="text-danger mt-1">Reversed: {titleCase(s.reverseReason)}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Activity Timeline (Full Width) */}
      {p.timeline?.length > 0 && (
        <div className="card card-p mt-2">
          <h3 className="panel-title mb-5">Activity Timeline</h3>
          <ol className="ml-2">
            {p.timeline.map((e, i) => {
              const cfg = TIMELINE_ICONS[e.type] || TIMELINE_ICONS.status;
              return (
                <TimelineItem
                  key={i}
                  icon={cfg.icon}
                  iconCls={cfg.cls}
                  label={e.label}
                  sub={e.note}
                  time={e.at}
                  isLast={i === p.timeline.length - 1}
                />
              );
            })}
          </ol>
        </div>
      )}
      
    </div>
  );
}