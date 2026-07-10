import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area,
} from 'recharts';
import { adminApi } from '../api/admin';
import { useAdminData } from '../lib/useAdminData';
import {
  PageHeader, Loader, StatCard, ChartCard, formatCurrency, titleCase, SectionLabel,
} from '../components/UI';
import { TrendingUp, Wallet, Target, Banknote, Package, Clock, CheckCircle2, XCircle, Percent } from 'lucide-react';

const PALETTE = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
const PIE_PALETTE = ['#10B981', '#F59E0B', '#2563EB', '#94A3B8'];

const CustomTooltip = ({ active, payload, label, formatter }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="card shadow-pop py-2 px-3 text-xs">
      {label && <p className="font-semibold text-ink mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} className="text-muted">
          {p.name}: <span className="font-bold text-ink">{formatter ? formatter(p.value) : p.value}</span>
        </p>
      ))}
    </div>
  );
};

export default function Analytics() {
  const inv = useAdminData(() => adminApi.inventoryAnalytics());
  const lead = useAdminData(() => adminApi.leadAnalytics());
  const loan = useAdminData(() => adminApi.loanAnalytics());
  const rev = useAdminData(() => adminApi.revenueAnalytics());
  const aging = useAdminData(() => adminApi.aging());

  const onRefresh = () => { inv.refresh(); lead.refresh(); loan.refresh(); rev.refresh(); aging.refresh(); };
  const loading = inv.loading || lead.loading || rev.loading || aging.loading;

  const i = inv.data || {}, l = lead.data || {}, ln = loan.data || {}, r = rev.data || {}, a = aging.data || {};
  const invStatus = [
    { name: 'Available', value: i.available || 0 },
    { name: 'Reserved', value: i.reserved || 0 },
    { name: 'Sold', value: i.sold || 0 },
    { name: 'Archived', value: i.archived || 0 },
  ];
  const leadBreakdown = Object.entries(l.statusBreakdown || {}).map(([k, v]) => ({ name: titleCase(k), value: v }));
  const loanBreakdown = Object.entries(ln.statusBreakdown || {}).map(([k, v]) => ({ name: titleCase(k), value: v }));
  const agingBuckets = [
    { name: '≤30d', value: a.buckets?.['30'] || 0 },
    { name: '31–60d', value: a.buckets?.['60'] || 0 },
    { name: '61–90d', value: a.buckets?.['90'] || 0 },
    { name: '90d+', value: a.buckets?.['180'] || 0 },
  ];

  const axisStyle = { fontSize: 11, fill: '#94A3B8' };
  const gridStyle = { strokeDasharray: '3 3', stroke: '#F1F5F9' };

  return (
    <div className="space-y-8">
      <PageHeader title="Analytics" subtitle="Business insights, trends, and performance reporting" onRefresh={onRefresh} loading={loading} />

      {/* Revenue */}
      <section className="space-y-4">
        <SectionLabel>Revenue Overview</SectionLabel>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
          <StatCard label="Monthly Revenue" value={formatCurrency(r.monthlyRevenue)} icon={TrendingUp} accent="brand" />
          <StatCard label="Yearly Revenue" value={formatCurrency(r.yearlyRevenue)} icon={TrendingUp} accent="info" />
          <StatCard label="Total Sold Value" value={formatCurrency(r.soldValue)} icon={Wallet} accent="primary" />
          <StatCard label="Inventory Value" value={formatCurrency(i.inventoryValue)} icon={Wallet} accent="warn" />
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ChartCard title="Revenue Trend" subtitle="12-month rolling view">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={r.revenueTrend || []}>
                <defs>
                  <linearGradient id="revGrad2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563EB" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid {...gridStyle} />
                <XAxis dataKey="month" tick={axisStyle} axisLine={false} tickLine={false} />
                <YAxis tick={axisStyle} tickFormatter={(v) => formatCurrency(v)} width={76} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip formatter={formatCurrency} />} />
                <Area type="monotone" dataKey="value" stroke="#2563EB" fill="url(#revGrad2)" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
          <ChartCard title="Revenue by Dealer" subtitle="Top-performing dealers">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={(r.dealerRevenue || []).slice(0, 8)} layout="vertical">
                <CartesianGrid {...gridStyle} horizontal={false} />
                <XAxis type="number" tick={axisStyle} tickFormatter={(v) => formatCurrency(v)} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="dealerName" width={100} tick={axisStyle} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip formatter={formatCurrency} />} />
                <Bar dataKey="value" radius={[0, 8, 8, 0]} fill="#2563EB" maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </section>

      {/* Inventory */}
      <section className="space-y-4">
        <SectionLabel>Inventory Analytics</SectionLabel>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
          <StatCard label="Available" value={i.available ?? 0} icon={CheckCircle2} accent="success" />
          <StatCard label="Reserved" value={i.reserved ?? 0} icon={Clock} accent="warn" />
          <StatCard label="Sold" value={i.sold ?? 0} icon={Package} accent="brand" />
          <StatCard label="Archived" value={i.archived ?? 0} icon={Package} accent="slate" />
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ChartCard title="Inventory Distribution" subtitle="Current stock by status">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={invStatus} dataKey="value" nameKey="name" innerRadius={62} outerRadius={100} paddingAngle={3} strokeWidth={0}>
                  {invStatus.map((_, n) => <Cell key={n} fill={PIE_PALETTE[n % PIE_PALETTE.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
          <ChartCard title="Inventory Aging" subtitle="Unsold stock by age bucket">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={agingBuckets}>
                <CartesianGrid {...gridStyle} vertical={false} />
                <XAxis dataKey="name" tick={axisStyle} axisLine={false} tickLine={false} />
                <YAxis tick={axisStyle} allowDecimals={false} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} fill="#F59E0B" maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </section>

      {/* Pipeline */}
      <section className="space-y-4">
        <SectionLabel>Pipeline Analytics</SectionLabel>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
          <StatCard label="Total Leads" value={l.totalLeads ?? 0} icon={Target} accent="info" />
          <StatCard label="Lead Conversion" value={`${l.conversionRate ?? 0}%`} icon={Percent} accent="brand" />
          <StatCard label="Total Loans" value={ln.totalRequests ?? 0} icon={Banknote} accent="primary" />
          <StatCard label="Loan Approval" value={`${ln.approvalRate ?? 0}%`} icon={Percent} accent="warn" />
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ChartCard title="Lead Stage Breakdown" subtitle="Leads by pipeline stage">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={leadBreakdown}>
                <CartesianGrid {...gridStyle} vertical={false} />
                <XAxis dataKey="name" tick={axisStyle} axisLine={false} tickLine={false} />
                <YAxis tick={axisStyle} allowDecimals={false} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#2563EB" maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
          <ChartCard title="Loan Status Breakdown" subtitle="Applications by approval stage">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={loanBreakdown}>
                <CartesianGrid {...gridStyle} vertical={false} />
                <XAxis dataKey="name" tick={axisStyle} axisLine={false} tickLine={false} />
                <YAxis tick={axisStyle} allowDecimals={false} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#10B981" maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </section>

      {/* Aging table */}
      <section className="space-y-4">
        <SectionLabel>Oldest Unsold Inventory</SectionLabel>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr><th>Product</th><th>Category</th><th>Listed By</th><th>Days Unsold</th><th>Value</th></tr>
            </thead>
            <tbody>
              {(a.items || []).slice(0, 25).map((p) => (
                <tr key={p._id}>
                  <td className="font-semibold text-ink">{p.productName}</td>
                  <td><span className="badge badge-neutral capitalize">{p.category}</span></td>
                  <td className="text-muted">{p.dealer}</td>
                  <td>
                    <span className={`badge ${p.daysUnsold >= 90 ? 'badge-danger' : p.daysUnsold >= 60 ? 'badge-warning' : 'badge-neutral'}`}>
                      {p.daysUnsold}d
                    </span>
                  </td>
                  <td className="font-bold text-ink">{formatCurrency(p.price)}</td>
                </tr>
              ))}
              {(a.items || []).length === 0 && (
                <tr><td colSpan={5} className="text-center text-muted py-10">No aging inventory</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
