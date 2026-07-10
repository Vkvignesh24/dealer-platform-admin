import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Banknote, CheckCircle2, XCircle, Clock, Percent, Eye, X, TrendingUp } from 'lucide-react';
import { adminApi } from '../api/admin';
import { useAdminData } from '../lib/useAdminData';
import {
  PageHeader, Loader, ErrorState, EmptyState, StatCard, StatusBadge,
  LOAN_STATUS_MAP, formatCurrency, titleCase, SearchBar, FilterPanel, Pagination, formatDate, timeAgo, Avatar,
} from '../components/UI';

const STATUSES = ['new', 'under_review', 'bank_shared', 'approved', 'rejected'];

const FUNNEL = [
  { key: 'new', label: 'New' },
  { key: 'under_review', label: 'Under Review' },
  { key: 'bank_shared', label: 'Bank Shared' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
];

export default function Loans() {
  const [searchParams, setSearchParams] = useSearchParams();
  const productFilter = searchParams.get('product') || '';
  const [filters, setFilters] = useState({ search: '', status: '', page: 1 });
  const { data, loading, error, refresh } = useAdminData(
    () => adminApi.loans({ ...filters, product: productFilter || undefined }),
    [filters.search, filters.status, filters.page, productFilter]
  );
  const { data: stats, refresh: refreshStats } = useAdminData(() => adminApi.loanAnalytics());
  const set = (k, v) => setFilters((f) => ({ ...f, [k]: v, page: k === 'page' ? v : 1 }));
  const onRefresh = () => { refresh(); refreshStats(); };
  const productName = data?.items?.[0]?.product?.name;
  const br = stats?.statusBreakdown || {};
  const total = stats?.totalRequests || 0;

  return (
    <div className="space-y-5">
      <PageHeader title="Loan Requests" subtitle="Financing pipeline and approval management" onRefresh={onRefresh} loading={loading} />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-5">
        <StatCard label="Total Requests" value={stats?.totalRequests ?? 0} icon={Banknote} accent="primary" />
        <StatCard label="Pending" value={stats?.pending ?? 0} icon={Clock} accent="warn" />
        <StatCard label="Approved" value={stats?.approved ?? 0} icon={CheckCircle2} accent="success" />
        <StatCard label="Rejected" value={stats?.rejected ?? 0} icon={XCircle} accent="danger" />
        <StatCard label="Approval Rate" value={`${stats?.approvalRate ?? 0}%`} icon={Percent} accent="brand" />
      </div>

      {/* Approval funnel */}
      {total > 0 && (
        <div className="card card-p">
          <p className="panel-title mb-3">Approval Funnel</p>
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {FUNNEL.map((stage, i) => {
              const count = br[stage.key] || 0;
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              const isRejected = stage.key === 'rejected';
              return (
                <div key={stage.key} className="flex items-center gap-1 flex-1 min-w-[80px]">
                  <button
                    className={`flex-1 rounded-xl border px-2 py-2.5 text-center transition-colors ${
                      filters.status === stage.key
                        ? isRejected ? 'bg-danger border-danger text-white' : 'bg-brand-500 border-brand-500 text-white'
                        : 'border-line bg-white hover:bg-primary-50'
                    }`}
                    onClick={() => set('status', filters.status === stage.key ? '' : stage.key)}
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-wide opacity-70">{stage.label}</p>
                    <p className="text-lg font-bold leading-tight">{count}</p>
                    <p className="text-[10px] opacity-60">{pct}%</p>
                  </button>
                  {i < FUNNEL.length - 1 && <span className="text-muted shrink-0">›</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {productFilter && (
        <div className="flex items-center gap-2 rounded-xl bg-brand-50 border border-brand-200 px-3 py-2 text-sm text-brand-700">
          <Banknote size={14} />
          <span>Filtered by product: <strong>{productName || 'selected product'}</strong></span>
          <button onClick={() => setSearchParams({})} className="ml-auto flex items-center gap-1 font-semibold hover:underline">
            <X size={13} /> Clear
          </button>
        </div>
      )}

      <FilterPanel>
        <SearchBar value={filters.search} onChange={(v) => set('search', v)} placeholder="Search applicant name, phone, email…" />
        <select className="input w-auto min-w-[180px]" value={filters.status} onChange={(e) => set('status', e.target.value)}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{titleCase(s)}</option>)}
        </select>
      </FilterPanel>

      {loading && !data ? <Loader />
        : error && !data ? <ErrorState message={error} onRetry={refresh} />
        : (data?.items || []).length === 0 ? <EmptyState label="No loan requests found" />
        : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr><th>Applicant</th><th>Product</th><th>Monthly Income</th><th>Loan Amount</th><th>Tenure</th><th>Status</th><th>Submitted</th><th className="text-right">Actions</th></tr>
              </thead>
              <tbody>
                {data.items.map((l) => (
                  <tr key={l._id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <Avatar name={l.name} size={8} />
                        <div>
                          <Link to={`/loans/${l._id}`} className="font-semibold text-ink hover:text-brand-600">{l.name}</Link>
                          <p className="text-[11px] text-muted">{l.phone || l.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-[12.5px] text-primary-700 max-w-[160px]">
                      <span className="line-clamp-1">{l.product?.name || '—'}</span>
                    </td>
                    <td className="text-muted">{l.monthlySalary ? formatCurrency(l.monthlySalary) : '—'}</td>
                    <td><span className="font-bold text-ink">{formatCurrency(l.loanAmount)}</span></td>
                    <td className="text-muted">{l.tenureMonths ? `${l.tenureMonths} mo` : '—'}</td>
                    <td><StatusBadge status={l.status} map={LOAN_STATUS_MAP} /></td>
                    <td className="text-muted text-[12px]">{timeAgo(l.createdAt)}</td>
                    <td className="text-right">
                      <Link to={`/loans/${l._id}`} className="icon-btn"><Eye size={14} /></Link>
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
