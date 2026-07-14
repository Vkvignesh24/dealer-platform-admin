import { Link } from 'react-router-dom';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area, LineChart, Line,
} from 'recharts';
import {
  Package, Users, Target, Banknote, Wallet, TrendingUp, Clock,
  CheckCircle2, ShoppingBag, Archive, ArrowUpRight, Activity, Store,
} from 'lucide-react';
import { adminApi } from '../api/admin';
import { useAdminData } from '../lib/useAdminData';
import {
  StatCard, PageHeader, Loader, ErrorState, ChartCard,
  formatCurrency, formatCurrencyFull, formatNumber, formatDate, timeAgo,
  StatusBadge, PRODUCT_STATUS_MAP, LEAD_STATUS_MAP, LOAN_STATUS_MAP, Avatar,
} from '../components/UI';

const PIE_COLORS = ['#10B981', '#F59E0B', '#2563EB', '#94A3B8'];
const CAT_COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const CustomTooltip = ({ active, payload, label, formatter }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="card card-p shadow-pop py-2 px-3 text-xs">
      {label && <p className="font-semibold text-ink mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} className="text-muted">
          {p.name}: <span className="font-bold text-ink">{formatter ? formatter(p.value) : p.value}</span>
        </p>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const { data, loading, error, refresh } = useAdminData(() => adminApi.dashboard());
  const { data: rev } = useAdminData(() => adminApi.revenueAnalytics());
  const { data: leadStats } = useAdminData(() => adminApi.leadAnalytics());
  const { data: loanStats } = useAdminData(() => adminApi.loanAnalytics());

  if (loading && !data) return <Loader />;
  if (error && !data) return <ErrorState message={error} onRetry={refresh} />;

  const d = data || {};
  const statusData = [
    { name: 'Available', value: d.availableProducts || 0 },
    { name: 'Reserved', value: d.reservedProducts || 0 },
    { name: 'Sold', value: d.soldProducts || 0 },
    { name: 'Archived', value: d.archivedProducts || 0 },
  ];
  const leadBreakdown = Object.entries(leadStats?.statusBreakdown || {})
    .map(([k, v]) => ({ name: k.replace(/_/g, ' '), value: v }));
  const categoryData = (d.categoryBreakdown || []).map((c) => ({
    name: c.category.charAt(0).toUpperCase() + c.category.slice(1),
    count: c.count,
  }));

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" subtitle="Live business overview and operations snapshot" onRefresh={refresh} loading={loading} />

      {/* Primary KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard label="Total Products" value={formatNumber(d.totalProducts)} icon={Package} accent="primary"
          sub={`${d.availableProducts || 0} available`} trend={d.newProductsThisMonth ? 5 : undefined} trendLabel="vs last month" />
        <StatCard label="Total Customers" value={formatNumber(d.totalCustomers)} icon={Users} accent="brand"
          sub={d.newCustomersThisMonth ? `+${d.newCustomersThisMonth} this month` : undefined} />
        <StatCard label="Active Leads" value={formatNumber(d.totalLeads)} icon={Target} accent="warn"
          sub={`${leadStats?.conversionRate ?? 0}% conversion`} />
        <StatCard label="Loan Requests" value={formatNumber(d.totalLoanRequests)} icon={Banknote} accent="info"
          sub={`${loanStats?.approvalRate ?? 0}% approval`} />
      </div>

      {/* Revenue strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <RevenueCard label="Inventory Value" value={formatCurrencyFull(d.inventoryValue)} accent="bg-gradient-to-br from-primary-800 to-primary-900" icon={Wallet} />
        <RevenueCard label="Total Sold Value" value={formatCurrencyFull(d.soldValue)} accent="bg-gradient-to-br from-success-600 to-success-700" icon={ShoppingBag} />
        <RevenueCard label="Monthly Revenue" value={formatCurrencyFull(d.monthlyRevenue)} accent="bg-gradient-to-br from-brand-500 to-brand-700" icon={TrendingUp} />
        <RevenueCard label="Yearly Revenue" value={formatCurrencyFull(d.yearlyRevenue)} accent="bg-gradient-to-br from-amber-500 to-amber-600" icon={Activity} />
      </div>

      {/* Inventory status mini-cards */}
      <div>
        <p className="section-label mb-3">Inventory Status</p>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
          <MiniStat icon={CheckCircle2} accent="success" label="Available" value={d.availableProducts ?? 0} />
          <MiniStat icon={Clock} accent="warn" label="Reserved" value={d.reservedProducts ?? 0} />
          <MiniStat icon={ShoppingBag} accent="brand" label="Sold" value={d.soldProducts ?? 0} />
          <MiniStat icon={Archive} accent="slate" label="Archived" value={d.archivedProducts ?? 0} />
          <MiniStat icon={Clock} accent="danger" label="Aging >90d" value={d.longTermUnsold ?? 0} hint="Long-term unsold" />
        </div>
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard title="Inventory Distribution" subtitle="Products by current status">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={95} paddingAngle={3} strokeWidth={0}>
                {statusData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <div className="lg:col-span-2">
          <ChartCard title="Revenue Trend" subtitle="Last 12 months">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={rev?.revenueTrend || []}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563EB" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} tickFormatter={(v) => formatCurrency(v)} width={72} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip formatter={formatCurrency} />} />
                <Area type="monotone" dataKey="value" stroke="#2563EB" fill="url(#revGrad)" strokeWidth={2.5} dot={false} activeDot={{ r: 4, fill: '#2563EB' }} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {categoryData.length > 0 && (
          <ChartCard title="Top Categories" subtitle="Active inventory by type">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={categoryData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#94A3B8' }} allowDecimals={false} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} width={80} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[0, 8, 8, 0]} maxBarSize={32}>
                  {categoryData.map((_, i) => <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {leadBreakdown.length > 0 && (
          <ChartCard title="Lead Pipeline" subtitle="Leads by stage">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={leadBreakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} allowDecimals={false} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#2563EB" maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}
      </div>

      {/* Recent activity tables */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <RecentCard
          title="Recent Products"
          to="/products"
          items={d.recentProducts}
          head={['Product', 'Status']}
          render={(p) => (
            <>
              <td>
                <div className="flex items-center gap-3">
                  <img src={p.images?.[0] || 'https://placehold.co/40x30?text=img'} alt=""
                    className="h-8 w-11 rounded-lg object-cover bg-primary-100 shrink-0" />
                  <div>
                    <Link to={`/products/${p._id}`} className="font-semibold text-ink hover:text-brand-600 text-[12.5px] line-clamp-1">{p.name}</Link>
                    <p className="text-[11px] text-muted capitalize">{p.category}</p>
                  </div>
                </div>
              </td>
              <td><StatusBadge status={p.status} map={PRODUCT_STATUS_MAP} /></td>
            </>
          )}
        />
        <RecentCard
          title="Recent Leads"
          to="/leads"
          items={d.recentLeads}
          head={['Customer', 'Status']}
          render={(l) => (
            <>
              <td>
                <div className="flex items-center gap-2">
                  <Avatar name={l.customerName} size={8} />
                  <div>
                    <Link to={`/leads/${l._id}`} className="font-semibold text-ink hover:text-brand-600 text-[12.5px]">{l.customerName}</Link>
                    <p className="text-[11px] text-muted truncate max-w-[120px]">{l.product?.name || '—'}</p>
                  </div>
                </div>
              </td>
              <td><StatusBadge status={l.status} map={LEAD_STATUS_MAP} /></td>
            </>
          )}
        />
        <RecentCard
          title="Recent Loans"
          to="/loans"
          items={d.recentLoans}
          head={['Applicant', 'Status']}
          render={(l) => (
            <>
              <td>
                <div className="flex items-center gap-2">
                  <Avatar name={l.name} size={8} />
                  <div>
                    <Link to={`/loans/${l._id}`} className="font-semibold text-ink hover:text-brand-600 text-[12.5px]">{l.name}</Link>
                    <p className="text-[11px] text-muted">{formatCurrencyFull(l.loanAmount)}</p>
                  </div>
                </div>
              </td>
              <td><StatusBadge status={l.status} map={LOAN_STATUS_MAP} /></td>
            </>
          )}
        />
      </div>

      {/* Recent Customers */}
      {(d.recentCustomers || []).length > 0 && (
        <div className="card card-p">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="panel-title">Recent Customers</h3>
              <p className="text-xs text-muted mt-0.5">Newest platform registrations</p>
            </div>
            <Link to="/customers" className="btn-ghost text-xs text-brand-600 hover:text-brand-700 flex items-center gap-1">
              View all <ArrowUpRight size={13} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead><tr><th>Customer</th><th>Email</th><th>Phone</th><th>Joined</th></tr></thead>
              <tbody>
                {d.recentCustomers.slice(0, 5).map((c) => (
                  <tr key={c._id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <Avatar name={c.name || c.email} size={8} />
                        <Link to={`/customers/${c._id}`} className="font-semibold text-ink hover:text-brand-600">{c.name || '—'}</Link>
                      </div>
                    </td>
                    <td className="text-muted">{c.email}</td>
                    <td className="text-muted">{c.phone || '—'}</td>
                    <td className="text-muted">{timeAgo(c.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function RevenueCard({ label, value, accent, icon: Icon }) {
  return (
    <div className={`rounded-2xl ${accent} p-5 text-white`}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11.5px] font-semibold opacity-80 uppercase tracking-wider">{label}</p>
        <span className="grid h-8 w-8 place-items-center rounded-xl bg-white/15">
          <Icon size={15} />
        </span>
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

function MiniStat({ icon: Icon, label, value, hint, accent = 'primary' }) {
  const map = {
    primary: 'bg-primary-100 text-primary-700',
    brand: 'bg-brand-50 text-brand-600',
    info: 'bg-blue-50 text-blue-600',
    warn: 'bg-amber-50 text-amber-700',
    danger: 'bg-red-50 text-danger',
    success: 'bg-success-50 text-success-700',
    slate: 'bg-primary-100 text-primary-500',
  };
  return (
    <div className="stat-card card-hover">
      <div className="flex items-center gap-3">
        <span className={`grid h-9 w-9 place-items-center rounded-xl shrink-0 ${map[accent]}`}><Icon size={16} /></span>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">{label}</p>
          <p className="text-xl font-bold text-ink leading-tight">{value}</p>
        </div>
      </div>
      {hint && <p className="text-[11px] text-muted">{hint}</p>}
    </div>
  );
}

function RecentCard({ title, items = [], head, render, to }) {
  return (
    <div className="card card-p">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="panel-title">{title}</h3>
        {to && (
          <Link to={to} className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700">
            View all <ArrowUpRight size={12} />
          </Link>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="data-table">
          <thead><tr>{head.map((h) => <th key={h}>{h}</th>)}</tr></thead>
          <tbody>
            {(items || []).length === 0
              ? <tr><td colSpan={head.length} className="text-center text-muted py-8">No data</td></tr>
              : items.slice(0, 5).map((it) => <tr key={it._id}>{render(it)}</tr>)}
          </tbody>
        </table>
      </div>
    </div>
  );
}
