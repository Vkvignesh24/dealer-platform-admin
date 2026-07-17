import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, Calendar, Target, Banknote, Heart, MessageCircle, Clock, Activity, PackageCheck } from 'lucide-react';
import { adminApi } from '../api/admin';
import { useAdminData } from '../lib/useAdminData';
import {
  Loader, ErrorState, StatusBadge, LEAD_STATUS_MAP, LOAN_STATUS_MAP, PRODUCT_STATUS_MAP,
  formatCurrencyFull, formatDate, timeAgo, StatCard, KV, Avatar, MetricChip, TimelineItem, titleCase,
} from '../components/UI';

function buildActivity(leads, loans, purchases) {
  const events = [];
  leads.forEach((l) => events.push({ at: l.createdAt, label: `Enquiry: ${l.product?.name || 'Product'}`, sub: titleCase(l.status), icon: Target, cls: 'bg-blue-500' }));
  loans.forEach((l) => events.push({ at: l.createdAt, label: `Loan application: ${l.product?.name || 'Product'}`, sub: `${formatCurrencyFull(l.loanAmount)} · ${titleCase(l.status)}`, icon: Banknote, cls: 'bg-purple-500' }));
  purchases.forEach((s) => {
    events.push({ at: s.soldDate, label: `Purchased ${s.product?.name || 'a vehicle'}`, sub: formatCurrencyFull(s.salePrice), icon: PackageCheck, cls: s.status === 'active' ? 'bg-success-500' : 'bg-primary-300' });
    if (s.status === 'reversed' && s.reversedAt) {
      events.push({ at: s.reversedAt, label: 'Purchase reversed', sub: s.product?.name, icon: Clock, cls: 'bg-danger' });
    }
  });
  return events.filter((e) => e.at).sort((a, b) => new Date(b.at) - new Date(a.at));
}

export default function CustomerDetails() {
  const { id } = useParams();
  const [tab, setTab] = useState('leads');
  const { data, loading, error, refresh } = useAdminData(() => adminApi.customer(id), [id]);

  if (loading && !data) return <Loader />;
  if (error) return <ErrorState message={error} onRetry={refresh} />;
  if (!data) return null;

  const c = data.profile;
  const leads = data.leadHistory || [];
  const loans = data.loanRequests || [];
  
  const purchases = data.purchases || [];
  const activePurchases = purchases.filter((p) => p.status === 'active');
  const activity = buildActivity(leads, loans, purchases);

  const TABS = [
    { key: 'leads', label: 'Leads', count: leads.length, icon: Target },
    { key: 'loans', label: 'Loans', count: loans.length, icon: Banknote },
    { key: 'purchases', label: 'Purchases', count: activePurchases.length, icon: PackageCheck },

    { key: 'activity', label: 'Activity', count: activity.length, icon: Activity },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link to="/customers" className="icon-btn"><ArrowLeft size={17} /></Link>
        <div>
          <h1 className="page-title">{c.name || c.email}</h1>
          <p className="page-sub">Customer profile · Joined {formatDate(c.createdAt)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-4">
        {/* Left sidebar: profile */}
        <div className="lg:col-span-1 space-y-4">
          <div className="card card-p text-center">
            <Avatar name={c.name || c.email} size={16} className="mx-auto mb-3" />
            <p className="font-bold text-ink text-lg">{c.name || '—'}</p>
            <p className="text-sm text-muted mt-0.5">{c.email}</p>
            {c.phone && <p className="text-sm text-muted mt-0.5">{c.phone}</p>}

            <div className="mt-4 flex flex-col gap-2">
              {c.phone && (
                <>
                  <a href={`tel:${c.phone}`} className="btn-primary justify-center">
                    <Phone size={14} /> Call
                  </a>
                  <a href={`https://wa.me/${c.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer"
                    className="btn-outline justify-center" style={{ color: '#25D366', borderColor: '#25D366' }}>
                    <MessageCircle size={14} /> WhatsApp
                  </a>
                </>
              )}
              <a href={`mailto:${c.email}`} className="btn-outline justify-center">
                <Mail size={14} /> Email
              </a>
            </div>
          </div>

          <div className="card card-p">
            <h3 className="panel-title mb-3">Account Details</h3>
            <div className="divide-y divide-line">
              <KV label="Full Name" value={c.name || '—'} />
              <KV label="Email" value={c.email} />
              <KV label="Phone" value={c.phone || '—'} />
              <KV label="Joined" value={formatDate(c.createdAt)} />
              <KV label="Last Active" value={timeAgo(c.updatedAt)} />
            </div>
          </div>

          <div className="card card-p">
            <h3 className="panel-title mb-3">Engagement Summary</h3>
            <div className="grid grid-cols-1 gap-2">
              <MetricChip label="Total Leads" value={leads.length} accent="brand" />
              <MetricChip label="Loan Applications" value={loans.length} accent="success" />
              <MetricChip label="Purchases" value={activePurchases.length} accent="success" />
              <MetricChip label="Lifetime Value" value={formatCurrencyFull(activePurchases.reduce((sum, p) => sum + (p.salePrice || 0), 0))} accent="success" />
              
            </div>
          </div>
        </div>

        {/* Right: tabbed content */}
        <div className="lg:col-span-3 space-y-4">
          {/* Tab nav */}
          <div className="flex gap-1 rounded-xl border border-line bg-white p-1 shadow-card w-fit">
            {TABS.map(({ key, label, count, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                  tab === key ? 'bg-primary-900 text-white shadow-sm' : 'text-muted hover:text-ink hover:bg-primary-50'
                }`}
              >
                <Icon size={14} />
                {label}
                <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                  tab === key ? 'bg-white/20 text-white' : 'bg-primary-100 text-primary-600'
                }`}>{count}</span>
              </button>
            ))}
          </div>

          {/* Leads tab */}
          {tab === 'leads' && (
            <div className="card card-p">
              <h3 className="panel-title mb-4">Lead History</h3>
              {leads.length === 0 ? (
                <p className="text-sm text-muted py-8 text-center">No leads yet.</p>
              ) : (
                <div className="space-y-2">
                  {leads.map((l) => (
                    <Link key={l._id} to={`/leads/${l._id}`}
                      className="flex items-center gap-4 rounded-xl border border-line px-4 py-3 hover:bg-primary-50 hover:border-primary-300 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-ink truncate">{l.product?.name || 'Product'}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] text-muted capitalize">{l.product?.category}</span>
                          {l.product?.price && (
                            <span className="text-[11px] text-muted">· {formatCurrencyFull(l.product.price)}</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <StatusBadge status={l.status} map={LEAD_STATUS_MAP} />
                        <p className="text-[11px] text-muted mt-1">{timeAgo(l.createdAt)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Loans tab */}
          {tab === 'loans' && (
            <div className="card card-p">
              <h3 className="panel-title mb-4">Loan Applications</h3>
              {loans.length === 0 ? (
                <p className="text-sm text-muted py-8 text-center">No loan applications yet.</p>
              ) : (
                <div className="space-y-2">
                  {loans.map((l) => (
                    <Link key={l._id} to={`/loans/${l._id}`}
                      className="flex items-center gap-4 rounded-xl border border-line px-4 py-3 hover:bg-primary-50 hover:border-primary-300 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-ink truncate">{l.product?.name || 'Product'}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] font-semibold text-ink">{formatCurrencyFull(l.loanAmount)}</span>
                          {l.tenureMonths && <span className="text-[11px] text-muted">· {l.tenureMonths} months</span>}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <StatusBadge status={l.status} map={LOAN_STATUS_MAP} />
                        <p className="text-[11px] text-muted mt-1">{timeAgo(l.createdAt)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Purchases tab */}
          {tab === 'purchases' && (
            <div className="card card-p">
              <h3 className="panel-title mb-4">Purchase History</h3>
              {purchases.length === 0 ? (
                <p className="text-sm text-muted py-8 text-center">No purchases yet.</p>
              ) : (
                <div className="space-y-2">
                  {purchases.map((s) => (
                    <Link key={s._id} to={`/products/${s.product?._id}`}
                      className="flex items-center gap-4 rounded-xl border border-line px-4 py-3 hover:bg-primary-50 hover:border-primary-300 transition-colors">
                      <img src={s.product?.images?.[0] || 'https://placehold.co/64x48?text=img'} alt=""
                        className="h-12 w-16 rounded-lg object-cover bg-primary-100 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-ink truncate">{s.product?.name || 'Vehicle'}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] font-semibold text-ink">{formatCurrencyFull(s.salePrice)}</span>
                          <span className="text-[11px] text-muted">· {formatDate(s.soldDate)}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`badge ${s.status === 'active' ? 'badge-success' : 'badge-neutral'}`}>{titleCase(s.status)}</span>
                        {s.status === 'reversed' && s.reverseReason && (
                          <p className="text-[11px] text-muted mt-1">{titleCase(s.reverseReason)}</p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Wishlist tab */}
          {/* {tab === 'wishlist' && (
            <div className="card card-p">
              <h3 className="panel-title mb-4">Wishlist</h3>
              {wishlist.length === 0 ? (
                <p className="text-sm text-muted py-8 text-center">No items in wishlist.</p>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {wishlist.map((p) => (
                    <Link key={p._id} to={`/products/${p._id}`}
                      className="flex items-center gap-3 rounded-xl border border-line p-3 hover:bg-primary-50 hover:border-primary-300 transition-colors">
                      <img src={p.images?.[0] || 'https://placehold.co/64x48?text=img'} alt=""
                        className="h-12 w-16 rounded-lg object-cover bg-primary-100 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-ink truncate">{p.name}</p>
                        <p className="text-[11px] text-muted capitalize">{p.category}</p>
                        <p className="text-[12px] font-bold text-ink mt-0.5">{formatCurrencyFull(p.price)}</p>
                      </div>
                      <StatusBadge status={p.status} map={PRODUCT_STATUS_MAP} />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )} */}

          {/* Activity tab */}
          {tab === 'activity' && (
            <div className="card card-p">
              <h3 className="panel-title mb-4">Activity Timeline</h3>
              {activity.length === 0 ? (
                <p className="text-sm text-muted py-8 text-center">No activity yet.</p>
              ) : (
                <ol>
                  {activity.map((e, i) => (
                    <TimelineItem
                      key={i}
                      icon={e.icon}
                      iconCls={e.cls}
                      label={e.label}
                      sub={e.sub}
                      time={e.at}
                      isLast={i === activity.length - 1}
                    />
                  ))}
                </ol>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
