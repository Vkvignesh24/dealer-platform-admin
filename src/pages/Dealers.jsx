import { useState } from 'react';
import { Store, X, Package, Target, ShoppingBag, TrendingUp, Phone, Mail, Calendar, ChevronRight } from 'lucide-react';
import { adminApi } from '../api/admin';
import { useAdminData } from '../lib/useAdminData';
import {
  PageHeader, Loader, ErrorState, EmptyState, formatCurrency, formatDate,
  StatusBadge, PRODUCT_STATUS_MAP, LEAD_STATUS_MAP, SearchBar, FilterPanel, MetricChip, Avatar,
} from '../components/UI';

export default function Dealers() {
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const { data, loading, error, refresh } = useAdminData(() => adminApi.dealers({ search }), [search]);

  return (
    <div className="space-y-5">
      <PageHeader title="Dealers" subtitle="Dealer performance and business overview" onRefresh={refresh} loading={loading} />
      <FilterPanel>
        <SearchBar value={search} onChange={setSearch} placeholder="Search dealer name, email or phone…" />
      </FilterPanel>

      {loading && !data ? <Loader />
        : error && !data ? <ErrorState message={error} onRetry={refresh} />
        : (data?.items || []).length === 0 ? <EmptyState label="No dealers found" />
        : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {data.items.map((d) => (
              <DealerCard key={d._id} dealer={d} onSelect={() => setSelectedId(d._id)} />
            ))}
          </div>
        )}
      {selectedId && <DealerModal id={selectedId} onClose={() => setSelectedId(null)} />}
    </div>
  );
}

function DealerCard({ dealer: d, onSelect }) {
  return (
    <button
      className="card card-p card-hover text-left group"
      onClick={onSelect}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-primary-700 to-primary-900 text-white shrink-0">
            <Store size={18} />
          </span>
          <div>
            <p className="font-bold text-ink">{d.name}</p>
            <p className="text-[11.5px] text-muted">{d.email}</p>
          </div>
        </div>
        <ChevronRight size={16} className="text-muted group-hover:text-brand-500 transition-colors mt-1" />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <MetricChip label="Products" value={d.productCount} />
        <MetricChip label="Leads" value={d.leadCount} accent="brand" />
        <MetricChip label="Sold" value={d.soldCount} accent="success" />
        <MetricChip label="Revenue" value={formatCurrency(d.revenue)} accent="warn" />
      </div>

      {d.phone && (
        <div className="mt-3 pt-3 border-t border-line flex items-center gap-2 text-[11.5px] text-muted">
          <Phone size={11} /> {d.phone}
        </div>
      )}
    </button>
  );
}

function DealerModal({ id, onClose }) {
  const { data, loading } = useAdminData(() => adminApi.dealer(id), [id]);
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="card card-p w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-ink">Dealer Details</h3>
          <button onClick={onClose} className="icon-btn"><X size={18} /></button>
        </div>

        {loading || !data ? <Loader /> : (
          <div className="space-y-5">
            {/* Profile header */}
            <div className="flex items-center gap-4 pb-5 border-b border-line">
              <span className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-primary-700 to-primary-900 text-white">
                <Store size={24} />
              </span>
              <div>
                <p className="text-xl font-bold text-ink">{data.profile.name}</p>
                <div className="flex items-center gap-3 text-sm text-muted mt-1">
                  <span className="flex items-center gap-1"><Mail size={12} />{data.profile.email}</span>
                  {data.profile.phone && <span className="flex items-center gap-1"><Phone size={12} />{data.profile.phone}</span>}
                </div>
                <p className="text-xs text-muted mt-1 flex items-center gap-1">
                  <Calendar size={11} />Joined {formatDate(data.profile.createdAt)}
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-3">
              <MetricChip label="Products" value={data.stats.productCount} />
              <MetricChip label="Leads" value={data.stats.leadCount} accent="brand" />
              <MetricChip label="Sold" value={data.stats.soldCount} accent="success" />
              <MetricChip label="Revenue" value={formatCurrency(data.stats.revenue)} accent="warn" />
            </div>

            {/* Inventory */}
            {data.inventory?.length > 0 && (
              <div>
                <p className="panel-title mb-3">Inventory ({data.inventory.length})</p>
                <div className="space-y-2">
                  {data.inventory.slice(0, 10).map((p) => (
                    <div key={p._id}
                      className="flex items-center justify-between rounded-xl border border-line px-3 py-2.5">
                      <div className="flex items-center gap-3 min-w-0">
                        <img src={p.images?.[0] || 'https://placehold.co/40x30?text=img'} alt=""
                          className="h-8 w-11 rounded-lg object-cover bg-primary-100 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-ink truncate">{p.name}</p>
                          <p className="text-[11px] text-muted">{formatCurrency(p.price)}</p>
                        </div>
                      </div>
                      <StatusBadge status={p.status} map={PRODUCT_STATUS_MAP} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent leads */}
            {data.leads?.length > 0 && (
              <div>
                <p className="panel-title mb-3">Recent Leads ({data.leads.length})</p>
                <div className="space-y-2">
                  {data.leads.slice(0, 8).map((l) => (
                    <div key={l._id}
                      className="flex items-center justify-between rounded-xl border border-line px-3 py-2.5">
                      <div>
                        <p className="text-sm font-semibold text-ink">{l.customerName}</p>
                        <p className="text-[11px] text-muted">{l.product?.name}</p>
                      </div>
                      <StatusBadge status={l.status} map={LEAD_STATUS_MAP} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
