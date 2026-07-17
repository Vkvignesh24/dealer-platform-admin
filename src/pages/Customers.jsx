import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Users, UserPlus, Heart, Banknote, Target, Mail, Phone } from 'lucide-react';
import { adminApi } from '../api/admin';
import { useAdminData } from '../lib/useAdminData';
import {
  PageHeader, Loader, ErrorState, EmptyState, formatDate, timeAgo, formatCurrencyFull,
  StatCard, SearchBar, FilterPanel, Pagination, Avatar,
} from '../components/UI';

export default function Customers() {
  const [filters, setFilters] = useState({ search: '', page: 1 });
  const { data, loading, error, refresh } = useAdminData(
    () => adminApi.customers(filters), [filters.search, filters.page]
  );
  const set = (k, v) => setFilters((f) => ({ ...f, [k]: v, page: k === 'page' ? v : 1 }));
  const items = data?.items || [];

  return (
    <div className="space-y-5">
      <PageHeader title="Customers" subtitle="People engaging with the platform" onRefresh={refresh} loading={loading} />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard label="Total Customers" value={data?.total ?? '—'} icon={Users} accent="primary" />
        <StatCard label="With Leads" value={items.filter((c) => c.totalLeads > 0).length} icon={Target} accent="brand" />
        <StatCard label="Loan Applicants" value={items.filter((c) => c.loanRequests > 0).length} icon={Banknote} accent="success" />
        {/* <StatCard label="With Wishlist" value={items.filter((c) => c.interestedProducts > 0).length} icon={Heart} accent="warn" /> */}
      </div>
      <FilterPanel>
        <SearchBar value={filters.search} onChange={(v) => set('search', v)} placeholder="Search name, email or phone…" />
      </FilterPanel>

      {loading && !data ? <Loader />
        : error && !data ? <ErrorState message={error} onRetry={refresh} />
        : items.length === 0 ? <EmptyState label="No customers found" />
        : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr><th>Customer</th><th>Contact</th><th>Leads</th><th>Loans</th><th>Lifetime Value</th><th>Joined</th><th className="text-right">Actions</th></tr>
              </thead>
              <tbody>
                {items.map((c) => (
                  <tr key={c._id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <Avatar name={c.name || c.email} size={9} />
                        <div>
                          <Link to={`/customers/${c._id}`} className="font-semibold text-ink hover:text-brand-600">
                            {c.name || '—'}
                          </Link>
                          <p className="text-[11px] text-muted truncate max-w-[160px]">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        {c.phone && (
                          <a href={`tel:${c.phone}`} className="icon-btn hover:text-brand-600" title={c.phone}>
                            <Phone size={13} />
                          </a>
                        )}
                        <a href={`mailto:${c.email}`} className="icon-btn hover:text-brand-600" title={c.email}>
                          <Mail size={13} />
                        </a>
                        <span className="text-[12px] text-muted">{c.phone || '—'}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${c.totalLeads > 0 ? 'badge-info' : 'badge-neutral'}`}>{c.totalLeads}</span>
                    </td>
                    <td>
                      <span className={`badge ${c.loanRequests > 0 ? 'badge-success' : 'badge-neutral'}`}>{c.loanRequests}</span>
                    </td>
                    {/* <td>
                      <span className={`badge ${c.interestedProducts > 0 ? 'badge-warning' : 'badge-neutral'}`}>{c.interestedProducts}</span>
                    </td> */}
                    <td>
                      <span className={`font-bold ${c.lifetimeValue > 0 ? 'text-success-700' : 'text-muted'}`}>
                        {c.lifetimeValue > 0 ? formatCurrencyFull(c.lifetimeValue) : '—'}
                      </span>
                    </td>
                    <td className="text-muted text-[12px]">{timeAgo(c.createdAt)}</td>
                    <td className="text-right">
                      <Link to={`/customers/${c._id}`} className="icon-btn"><Eye size={14} /></Link>
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
