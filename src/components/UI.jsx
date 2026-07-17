import { Link } from 'react-router-dom';
import { RefreshCw, Inbox, AlertTriangle, Search, ArrowUpRight, ArrowDownRight, Minus, TrendingUp } from 'lucide-react';

/* ---------- Formatters ---------- */
export function formatCurrency(n) {
  const v = Number(n) || 0;
  if (v >= 10000000) return `₹${(v / 10000000).toFixed(2)} Cr`;
  if (v >= 100000) return `₹${(v / 100000).toFixed(2)} L`;
  return `₹${v.toLocaleString('en-IN')}`;
}
export function formatCurrencyFull(n) {
  const v = Number(n) || 0;
  return `₹${v.toLocaleString('en-IN')}`;
}
export function formatNumber(n) {
  const v = Number(n) || 0;
  return v.toLocaleString('en-IN');
}
export function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}
export function formatDateTime(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
export function titleCase(s = '') {
  return String(s).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
export function timeAgo(d) {
  if (!d) return '—';
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(d);
}

/* ---------- StatCard with trend ---------- */
export function StatCard({ label, value, sub, icon: Icon, accent = 'primary', trend, trendLabel, color, to }) {
  const accents = {
    primary: { bg: 'bg-primary-100', text: 'text-primary-700', dot: 'bg-primary-500' },
    brand: { bg: 'bg-brand-50', text: 'text-brand-600', dot: 'bg-brand-500' },
    info: { bg: 'bg-blue-50', text: 'text-blue-600', dot: 'bg-blue-500' },
    warn: { bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-500' },
    danger: { bg: 'bg-red-50', text: 'text-danger', dot: 'bg-danger' },
    success: { bg: 'bg-success-50', text: 'text-success-700', dot: 'bg-success-500' },
    slate: { bg: 'bg-primary-100', text: 'text-primary-500', dot: 'bg-primary-400' },
  };
  const a = accents[accent] || accents.primary;
  const TrendIcon = trend > 0 ? ArrowUpRight : trend < 0 ? ArrowDownRight : Minus;
  const trendCls = trend > 0 ? 'trend-up' : trend < 0 ? 'trend-down' : 'trend-flat';
  const Wrapper = to ? Link : 'div';
  const wrapperProps = to ? { to } : {};
  return (
    <Wrapper
      {...wrapperProps}
      className={`stat-card${to ? ' cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1' : ' card-hover'}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[13px] sm:text-[15px] font-semibold text-muted tracking-wide">{label}</span>
        {Icon && (
          <span className={`grid h-9 w-9 place-items-center rounded-xl ${a.bg} ${a.text}`}>
            <Icon size={16} />
          </span>
        )}
      </div>
      <span className="text-[18px] sm:text-[20px] lg:text-[22px] font-bold leading-tight text-ink">{value}</span>
      <div className="flex items-center gap-2">
        {typeof trend === 'number' && (
          <span className={trendCls}>
            <TrendIcon size={11} /> {Math.abs(trend)}%
          </span>
        )}
        {sub && <span className="text-[11.5px] text-muted">{sub}</span>}
        {trendLabel && <span className="text-[11.5px] text-muted">{trendLabel}</span>}
      </div>
    </Wrapper>
  );
}

/* ---------- Metric chip used inside panels ---------- */
export function MetricChip({ label, value, accent = 'neutral' }) {
  const cls = {
    neutral: 'bg-primary-50 text-primary-700',
    brand: 'bg-brand-50 text-brand-700',
    success: 'bg-success-50 text-success-700',
    warn: 'bg-amber-50 text-amber-700',
    danger: 'bg-red-50 text-danger',
  }[accent] || 'bg-primary-50 text-primary-700';
  return (
    <div className={`rounded-xl px-3 py-2.5 ${cls}`}>
      <p className="text-[10.5px] font-semibold uppercase tracking-wider opacity-70">{label}</p>
      <p className="text-base font-bold leading-tight mt-0.5">{value}</p>
    </div>
  );
}

/* ---------- Status maps ---------- */
export function StatusBadge({ status, map = {} }) {
  const cls = map[status] || 'badge-neutral';
  return <span className={`badge ${cls}`}>{titleCase(status || '—')}</span>;
}
export const PRODUCT_STATUS_MAP = {
  available: 'badge-success', reserved: 'badge-warning', sold: 'badge-info', archived: 'badge-neutral',
};
export const LEAD_STATUS_MAP = {
  new: 'badge-info', contacted: 'badge-info', interested: 'badge-warning', test_drive: 'badge-purple',
  visited: 'badge-purple', negotiation: 'badge-warning', booked: 'badge-success', sold: 'badge-success', lost: 'badge-danger',
};
export const LOAN_STATUS_MAP = {
  new: 'badge-info', documents_pending: 'badge-warning', under_review: 'badge-warning', bank_shared: 'badge-purple',
  approved: 'badge-success', rejected: 'badge-danger', disbursed: 'badge-success', processing: 'badge-warning', pending: 'badge-info',
};

/* ---------- Modal ---------- */
export function Modal({ open, onClose, title, subtitle, children, width = 'max-w-lg' }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className={`relative w-full ${width} max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-xl`}>
        <div className="sticky top-0 flex items-start justify-between gap-3 border-b border-line bg-white px-5 py-4 rounded-t-2xl">
          <div>
            <h3 className="text-lg font-bold text-ink">{title}</h3>
            {subtitle && <p className="text-xs text-muted mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="icon-btn" aria-label="Close">✕</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

/* ---------- Simple form field helpers ---------- */
export function Field({ label, children, className = '' }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs font-semibold text-muted">{label}</span>
      {children}
    </label>
  );
}
export const inputCls =
  'w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500';

/* ---------- Page header ---------- */
export function PageHeader({ title, subtitle, onRefresh, loading, children, badge }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="page-title">{title}</h1>
          {badge && <span className="badge badge-info text-[12px] px-2.5 py-1">{badge}</span>}
        </div>
        {subtitle && <p className="page-sub mt-1">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">
        {children}
        {onRefresh && (
          <button className="btn-outline" onClick={onRefresh} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        )}
      </div>
    </div>
  );
}

/* ---------- Search bar ---------- */
export function SearchBar({ value, onChange, placeholder = 'Search…', className = '' }) {
  return (
    <div className={`relative flex-1 min-w-[200px] ${className}`}>
      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400" />
      <input
        className="input pl-9"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

/* ---------- Filter panel ---------- */
export function FilterPanel({ children }) {
  return (
    <div className="card card-p mb-4 flex flex-wrap items-center gap-3">
      {children}
    </div>
  );
}

/* ---------- Chart card wrapper ---------- */
export function ChartCard({ title, subtitle, action, children, className = '' }) {
  return (
    <div className={`card card-p ${className}`}>
      <div className="mb-4 flex items-start justify-between gap-2">
        <div>
          <h3 className="panel-title">{title}</h3>
          {subtitle && <p className="text-xs text-muted mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

/* ---------- Loader / Empty / Error ---------- */
export function Loader({ label = 'Loading…' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-muted">
      <div className="h-8 w-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
      <span className="text-sm">{label}</span>
    </div>
  );
}
export function EmptyState({ label = 'No records found', sub, icon: Icon = Inbox }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-muted">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary-100 text-primary-400">
        <Icon size={24} />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-primary-700">{label}</p>
        {sub && <p className="text-xs text-muted mt-1">{sub}</p>}
      </div>
    </div>
  );
}
export function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-muted">
      <AlertTriangle size={28} className="text-danger" />
      <p className="text-sm text-center max-w-sm">{message}</p>
      {onRetry && <button className="btn-outline" onClick={onRetry}>Try again</button>}
    </div>
  );
}

/* ---------- Form section ---------- */
export function FormSection({ title, description, children }) {
  return (
    <div className="grid grid-cols-1 gap-4 border-t border-line py-5 md:grid-cols-3 first:border-0 first:pt-0">
      <div>
        <h4 className="text-sm font-bold text-ink">{title}</h4>
        {description && <p className="text-xs text-muted mt-1 leading-relaxed">{description}</p>}
      </div>
      <div className="md:col-span-2 space-y-4">{children}</div>
    </div>
  );
}

/* ---------- Pagination ---------- */
export function Pagination({ page, pages, total, onChange }) {
  if (!pages || pages <= 1) return null;
  const start = Math.max(1, page - 1);
  const end = Math.min(pages, page + 1);
  const nums = [];
  for (let i = start; i <= end; i++) nums.push(i);
  return (
    <div className="mt-4 flex items-center justify-between gap-3">
      <span className="text-xs text-muted">
        {total ? `${total.toLocaleString('en-IN')} records · ` : ''}Page {page} of {pages}
      </span>
      <div className="flex items-center gap-1">
        <button className="btn-outline px-3 py-1.5 text-xs" disabled={page <= 1} onClick={() => onChange(1)}>«</button>
        <button className="btn-outline px-3 py-1.5 text-xs" disabled={page <= 1} onClick={() => onChange(page - 1)}>‹</button>
        {nums.map((n) => (
          <button
            key={n}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors ${n === page ? 'bg-brand-500 text-white border-brand-500' : 'border-line bg-white text-primary-700 hover:bg-primary-50'
              }`}
            onClick={() => onChange(n)}
          >{n}</button>
        ))}
        <button className="btn-outline px-3 py-1.5 text-xs" disabled={page >= pages} onClick={() => onChange(page + 1)}>›</button>
        <button className="btn-outline px-3 py-1.5 text-xs" disabled={page >= pages} onClick={() => onChange(pages)}>»</button>
      </div>
    </div>
  );
}

/* ---------- KV row used in detail pages ---------- */
export function KV({ label, value, mono, highlight }) {
  return (
    <div className="flex flex-col gap-0.5 py-2.5">
      <span className="text-[10.5px] font-bold uppercase tracking-widest text-muted">{label}</span>
      <span className={`text-sm ${mono ? 'font-mono' : 'font-medium'} ${highlight ? 'text-brand-600 font-bold' : 'text-ink'}`}>
        {value ?? '—'}
      </span>
    </div>
  );
}

/* ---------- Timeline item ---------- */
export function TimelineItem({ icon: Icon, iconCls = 'bg-brand-500', label, sub, time, isLast }) {
  return (
    <li className="flex gap-4">
      <div className="flex flex-col items-center">
        <span className={`grid h-8 w-8 place-items-center rounded-full text-white shrink-0 ${iconCls}`}>
          {Icon ? <Icon size={14} /> : <span className="h-2 w-2 rounded-full bg-current" />}
        </span>
        {!isLast && <div className="w-px flex-1 bg-line mt-1" />}
      </div>
      <div className="pb-5 min-w-0 flex-1">
        <p className="text-sm font-semibold text-ink">{label}</p>
        {sub && <p className="text-xs text-muted mt-0.5">{sub}</p>}
        {time && <p className="text-[11px] text-muted mt-1">{formatDateTime(time)}</p>}
      </div>
    </li>
  );
}

/* ---------- Section divider with label ---------- */
export function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <span className="section-label">{children}</span>
      <div className="flex-1 h-px bg-line" />
    </div>
  );
}

/* ---------- Avatar ---------- */
export function Avatar({ name = '', size = 9, className = '' }) {
  const initial = (name || 'U')[0].toUpperCase();
  const colors = [
    'bg-brand-500', 'bg-success-500', 'bg-amber-500', 'bg-purple-500', 'bg-pink-500',
  ];
  const idx = (initial.charCodeAt(0) - 65) % colors.length;
  return (
    <span className={`grid h-${size} w-${size} place-items-center rounded-full ${colors[idx]} text-white text-[12px] font-bold shrink-0 ${className}`}>
      {initial}
    </span>
  );
}
