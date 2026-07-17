import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Target, CheckCircle2, Percent, Eye, Phone, MessageCircle, X, TrendingUp, Users, Clock } from 'lucide-react';
import { adminApi } from '../api/admin';
import { useAdminData } from '../lib/useAdminData';
import {
  PageHeader, Loader, ErrorState, EmptyState, StatCard, StatusBadge,
  LEAD_STATUS_MAP, formatDate, titleCase, SearchBar, FilterPanel, Pagination, timeAgo, Avatar,
} from '../components/UI';

const STATUSES = ['new', 'contacted', 'interested', 'test_drive', 'visited', 'negotiation', 'booked', 'sold', 'lost'];

const PIPELINE = [
  { key: 'new', label: 'New' },
  { key: 'contacted', label: 'Contacted' },
  { key: 'interested', label: 'Interested' },
  { key: 'test_drive', label: 'Test Drive' },
  { key: 'visited', label: 'Visited' },
  { key: 'negotiation', label: 'Negotiation' },
  { key: 'booked', label: 'Booked' },
  { key: 'sold', label: 'Sold' },
];

export default function Leads() {
  const [searchParams, setSearchParams] = useSearchParams();
  const productFilter = searchParams.get('product') || '';
  const [filters, setFilters] = useState({ search: '', status: searchParams.get('status') || '', page: 1 });
  const { data, loading, error, refresh } = useAdminData(
    () => adminApi.leads({ ...filters, product: productFilter || undefined }),
    [filters.search, filters.status, filters.page, productFilter]
  );
  const { data: stats, refresh: refreshStats } = useAdminData(() => adminApi.leadAnalytics());
  const set = (k, v) => setFilters((f) => ({ ...f, [k]: v, page: k === 'page' ? v : 1 }));
  const onRefresh = () => { refresh(); refreshStats(); };
  const br = stats?.statusBreakdown || {};
  const productName = data?.items?.[0]?.product?.name;
  const total = stats?.totalLeads || 0;

  return (
    <div className="space-y-5">
      <PageHeader title="Leads" subtitle="Customer interest pipeline and CRM" onRefresh={onRefresh} loading={loading} />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard label="Total Leads" value={stats?.totalLeads ?? 0} icon={Target} accent="primary" />
        <StatCard label="Active" value={(br.new || 0) + (br.contacted || 0) + (br.interested || 0)} icon={Clock} accent="brand" />
        <StatCard label="Converted" value={stats?.convertedLeads ?? 0} icon={CheckCircle2} accent="success" />
        <StatCard label="Conversion Rate" value={`${stats?.conversionRate ?? 0}%`} icon={Percent} accent="warn" />
      </div>

      {/* Visual pipeline */}
      {total > 0 && (
        <div className="card card-p">
          <p className="panel-title mb-3">Lead Funnel</p>
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {PIPELINE.map((stage, i) => {
              const count = br[stage.key] || 0;
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={stage.key} className="flex items-center gap-1 flex-1 min-w-[80px]">
                  <button
                    className={`flex-1 rounded-xl border px-2 py-2.5 text-center transition-colors ${
                      filters.status === stage.key
                        ? 'bg-brand-500 border-brand-500 text-white'
                        : 'border-line bg-white hover:bg-brand-50 hover:border-brand-300'
                    }`}
                    onClick={() => set('status', filters.status === stage.key ? '' : stage.key)}
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-wide opacity-70">{stage.label}</p>
                    <p className="text-lg font-bold leading-tight">{count}</p>
                    <p className="text-[10px] opacity-60">{pct}%</p>
                  </button>
                  {i < PIPELINE.length - 1 && <span className="text-muted shrink-0">›</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {productFilter && (
        <div className="flex items-center gap-2 rounded-xl bg-brand-50 border border-brand-200 px-3 py-2 text-sm text-brand-700">
          <Target size={14} />
          <span>Filtered by product: <strong>{productName || 'selected product'}</strong></span>
          <button onClick={() => setSearchParams({})} className="ml-auto flex items-center gap-1 font-semibold hover:underline">
            <X size={13} /> Clear
          </button>
        </div>
      )}

      <FilterPanel>
        <SearchBar value={filters.search} onChange={(v) => set('search', v)} placeholder="Search customer name, phone, email…" />
        <select className="input w-auto min-w-[180px]" value={filters.status} onChange={(e) => set('status', e.target.value)}>
          <option value="">All stages</option>
          {STATUSES.map((s) => <option key={s} value={s}>{titleCase(s)}</option>)}
        </select>
      </FilterPanel>

      {loading && !data ? <Loader />
        : error && !data ? <ErrorState message={error} onRetry={refresh} />
        : (data?.items || []).length === 0 ? <EmptyState label="No leads match the filters" />
        : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr><th>Customer</th><th>Product</th><th>Dealer</th><th>Stage</th><th>Activity</th><th className="text-right">Actions</th></tr>
              </thead>
              <tbody>
                {data.items.map((l) => (
                  <tr key={l._id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <Avatar name={l.customerName} size={8} />
                        <div>
                          <Link to={`/leads/${l._id}`} className="font-semibold text-ink hover:text-brand-600">{l.customerName}</Link>
                          <p className="text-[11px] text-muted">{l.customerPhone || l.customerEmail || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <p className="text-[13px] text-primary-700 line-clamp-1">{l.product?.name || '—'}</p>
                    </td>
                    <td className="text-muted text-[12.5px]">{l.product?.createdBy?.name || '—'}</td>
                    <td><StatusBadge status={l.status} map={LEAD_STATUS_MAP} /></td>
                    <td className="text-muted text-[12px]">{timeAgo(l.updatedAt)}</td>
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        {l.customerPhone && (
                          <>
                            <a href={`tel:${l.customerPhone}`} className="icon-btn hover:text-brand-600" title="Call"><Phone size={14} /></a>
                            <a href={`https://wa.me/${l.customerPhone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer"
                              className="icon-btn hover:text-[#25D366]" title="WhatsApp"><MessageCircle size={14} /></a>
                          </>
                        )}
                        <Link to={`/leads/${l._id}`} className="icon-btn" title="View"><Eye size={14} /></Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      <Pagination page={data?.page} pages={data?.pages} total={data?.total} onChange={(p) => set('page', p)} />
    </div>
  );
}
