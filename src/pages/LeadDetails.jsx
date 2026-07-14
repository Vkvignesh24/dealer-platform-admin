import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Phone, MessageCircle, Mail, Save, Clock, CheckCircle2, AlertCircle, Tag } from 'lucide-react';
import { adminApi } from '../api/admin';
import { useAdminData } from '../lib/useAdminData';
import {
  Loader, ErrorState, StatusBadge, LEAD_STATUS_MAP, formatDate, formatDateTime, formatCurrency, titleCase, KV, TimelineItem, Avatar,
} from '../components/UI';

const STATUSES = ['new', 'contacted', 'interested', 'test_drive', 'visited', 'negotiation', 'booked', 'sold', 'lost'];

const STATUS_ICONS = {
  new: AlertCircle, contacted: Phone, interested: Tag, test_drive: CheckCircle2, visited: CheckCircle2,
  negotiation: Clock, booked: CheckCircle2, sold: CheckCircle2, lost: AlertCircle,
};
const STATUS_COLORS = {
  new: 'bg-blue-500', contacted: 'bg-blue-500', interested: 'bg-amber-500',
  test_drive: 'bg-purple-500', visited: 'bg-purple-500', negotiation: 'bg-amber-500',
  booked: 'bg-success-500', sold: 'bg-success-600', lost: 'bg-danger',
};

export default function LeadDetails() {
  const { id } = useParams();
  const { data, loading, error, refresh } = useAdminData(() => adminApi.lead(id), [id]);
  const [status, setStatus] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  if (loading && !data) return <Loader />;
  if (error) return <ErrorState message={error} onRetry={refresh} />;
  if (!data) return null;

  const l = data;
  const current = status || l.status;
  const phone = l.customerPhone || l.customer?.phone;
  const email = l.customerEmail || l.customer?.email;

  const save = async () => {
    setBusy(true);
    try {
      await adminApi.updateLead(id, { status: current, note });
      setNote('');
      refresh();
    } finally { setBusy(false); }
  };

  const timeline = timelineOf(l);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link to="/leads" className="icon-btn"><ArrowLeft size={17} /></Link>
          <div>
            <h1 className="page-title">{l.customerName}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-muted text-sm">Lead</span>
              <span className="text-primary-300">·</span>
              <StatusBadge status={l.status} map={LEAD_STATUS_MAP} />
              <span className="text-primary-300">·</span>
              <span className="text-muted text-sm">{formatDate(l.createdAt)}</span>
            </div>
          </div>
        </div>
        {phone && (
          <div className="flex items-center gap-2">
            <a href={`tel:${phone}`} className="btn-primary"><Phone size={14} /> Call</a>
            <a href={`https://wa.me/${phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer"
              className="btn-accent" style={{ background: '#25D366' }}>
              <MessageCircle size={14} /> WhatsApp
            </a>
            {email && <a href={`mailto:${email}`} className="btn-outline"><Mail size={14} /> Email</a>}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Left: main info */}
        <div className="lg:col-span-2 space-y-4">
          {/* Customer card */}
          <div className="card card-p">
            <div className="flex items-center gap-4 mb-4 pb-4 border-b border-line">
              <Avatar name={l.customerName} size={12} />
              <div>
                <p className="font-bold text-ink text-lg">{l.customerName}</p>
                <div className="flex items-center gap-3 text-sm text-muted mt-0.5">
                  {phone && <span className="flex items-center gap-1"><Phone size={12} />{phone}</span>}
                  {email && <span className="flex items-center gap-1"><Mail size={12} />{email}</span>}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-6 divide-y divide-line">
              <KV label="Lead Status" value={titleCase(l.status)} highlight />
              <KV label="Created" value={formatDateTime(l.createdAt)} />
              <KV label="Last Updated" value={formatDateTime(l.updatedAt)} />
              <KV label="Source" value={l.source || 'Platform'} />
            </div>
          </div>

          {/* Messages */}
          {(l.message || l.response) && (
            <div className="card card-p space-y-4">
              <h3 className="panel-title">Enquiry Details</h3>
              {l.message && (
                <div className="rounded-xl bg-primary-50 p-4">
                  <p className="text-[10.5px] font-bold uppercase tracking-widest text-muted mb-2">Customer Message</p>
                  <p className="text-sm text-ink whitespace-pre-wrap leading-relaxed">{l.message}</p>
                </div>
              )}
              {l.response && (
                <div className="rounded-xl bg-brand-50 p-4">
                  <p className="text-[10.5px] font-bold uppercase tracking-widest text-brand-600 mb-2">Dealer Response</p>
                  <p className="text-sm text-ink whitespace-pre-wrap leading-relaxed">{l.response}</p>
                </div>
              )}
            </div>
          )}

          {/* Product */}
          {l.product && (
            <div className="card card-p">
              <h3 className="panel-title mb-3">Interested Product</h3>
              <Link to={`/products/${l.product._id}`}
                className="flex items-center gap-4 rounded-xl border border-line p-3 hover:bg-primary-50 hover:border-primary-300 transition-colors">
                <img src={l.product.images?.[0] || 'https://placehold.co/96x64?text=No+Img'} alt=""
                  className="h-16 w-24 rounded-xl object-cover bg-primary-100 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-ink">{l.product.name}</p>
                  <p className="text-xs text-muted capitalize mt-0.5">{l.product.category}</p>
                </div>
                <p className="font-bold text-lg text-ink shrink-0">
                  ₹{(l.product.price || 0).toLocaleString('en-IN')}
                </p>
              </Link>
            </div>
          )}

          {/* Conversion */}
          {l.converted && (
            <div className="card card-p border-l-4 border-l-success-400">
              <h3 className="panel-title mb-3">Conversion Information</h3>
              <div className="divide-y divide-line">
                <KV label="Converted To Sale" value="Yes" highlight />
                <KV label="Converted On" value={formatDateTime(l.convertedAt)} />
                {l.saleId && (
                  <>
                    <KV label="Sale Price" value={l.saleId.salePrice != null ? `₹${Number(l.saleId.salePrice).toLocaleString('en-IN')}` : '—'} />
                    <KV label="Sale Status" value={titleCase(l.saleId.status)} />
                  </>
                )}
              </div>
            </div>
          )}

          {/* Timeline */}
          {timeline.length > 0 && (
            <div className="card card-p">
              <h3 className="panel-title mb-4">Activity Timeline</h3>
              <ol className="space-y-0">
                {timeline.map((e, i) => {
                  const SIcon = e.status ? (STATUS_ICONS[e.status] || Clock) : null;
                  const iconCls = e.status ? (STATUS_COLORS[e.status] || 'bg-primary-500') : 'bg-primary-200';
                  return (
                    <TimelineItem
                      key={i}
                      icon={SIcon}
                      iconCls={iconCls}
                      label={e.status ? titleCase(e.status) : e.text}
                      sub={e.note || undefined}
                      time={e.at}
                      isLast={i === timeline.length - 1}
                    />
                  );
                })}
              </ol>
            </div>
          )}
        </div>

        {/* Right: actions */}
        <div className="space-y-4">
          <div className="card card-p">
            <h3 className="panel-title mb-4">Update Stage</h3>
            <div className="space-y-3">
              <div>
                <label className="label">Current Stage</label>
                <select className="input" value={current} onChange={(e) => setStatus(e.target.value)}>
                  {STATUSES.map((s) => <option key={s} value={s}>{titleCase(s)}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Note (optional)</label>
                <textarea className="textarea h-28" placeholder="Add a note about this update…"
                  value={note} onChange={(e) => setNote(e.target.value)} />
              </div>
              <button className="btn-primary w-full" disabled={busy} onClick={save}>
                <Save size={14} /> {busy ? 'Saving…' : 'Save Update'}
              </button>
            </div>
          </div>

          {/* Stage progress */}
          <div className="card card-p">
            <h3 className="panel-title mb-3">Pipeline Progress</h3>
            <div className="space-y-2">
              {STATUSES.filter(s => s !== 'lost').map((s, i) => {
                const idx = STATUSES.indexOf(l.status);
                const isCurrent = s === l.status;
                const isDone = STATUSES.indexOf(s) < idx && l.status !== 'lost';
                return (
                  <div key={s} className={`flex items-center gap-3 rounded-xl px-3 py-2 ${
                    isCurrent ? 'bg-brand-50 border border-brand-200' : isDone ? 'opacity-60' : 'opacity-30'
                  }`}>
                    <div className={`h-2 w-2 rounded-full shrink-0 ${
                      isCurrent ? 'bg-brand-500 ring-2 ring-brand-200' : isDone ? 'bg-success-500' : 'bg-primary-300'
                    }`} />
                    <span className={`text-sm ${isCurrent ? 'font-semibold text-brand-700' : 'text-muted'}`}>
                      {titleCase(s)}
                    </span>
                    {isCurrent && <span className="ml-auto badge badge-info text-[10px]">Current</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function timelineOf(l) {
  const a = (l.history || []).map((s) => ({ status: s.status, at: s.at, note: s.note }));
  const b = (l.notes || []).map((n) => ({ text: n.text, at: n.at }));
  return [...a, ...b].sort((x, y) => new Date(y.at) - new Date(x.at));
}
