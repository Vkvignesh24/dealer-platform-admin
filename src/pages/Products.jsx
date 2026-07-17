import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Eye, Pencil, Archive, Trash2, Package, CheckCircle2, Clock, ShoppingBag,
  LayoutGrid, List, MapPin, Fuel, Gauge, Calendar, TrendingUp, Target, Copy, Tag, KeyRound,
} from 'lucide-react';
import { adminApi } from '../api/admin';
import { useAdminData } from '../lib/useAdminData';
import {
  PageHeader, Loader, ErrorState, EmptyState, StatusBadge, PRODUCT_STATUS_MAP,
  formatDate, titleCase, SearchBar, FilterPanel, Pagination, StatCard,
} from '../components/UI';
import MarkSoldDialog from '../components/MarkSoldDialog';
import ReserveDialog from '../components/ReserveDialog';

const CATEGORIES = ['car', 'bike', 'ev', 'commercial', 'land', 'property'];
const STATUSES = ['available', 'reserved', 'sold', 'archived'];
const SORTS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'views', label: 'Most viewed' },
];

function formatPriceFull(n) {
  const v = Number(n) || 0;
  return `₹${v.toLocaleString('en-IN')}`;
}

export default function Products() {
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState({ search: '', category: '', status: searchParams.get('status') || '', sort: 'newest', page: 1 });
  const [view, setView] = useState('table');
  const [saleTarget, setSaleTarget] = useState(null);
  const [reserveTarget, setReserveTarget] = useState(null);
  const { data, loading, error, refresh } = useAdminData(
    () => adminApi.products(filters),
    [filters.search, filters.category, filters.status, filters.sort, filters.page]
  );
  const { data: dash } = useAdminData(() => adminApi.dashboard());
  const set = (k, v) => setFilters((f) => ({ ...f, [k]: v, page: k === 'page' ? v : 1 }));

  const onArchive = async (id) => {
    if (!confirm('Archive this product?')) return;
    await adminApi.archiveProduct(id); refresh();
  };
  const onDelete = async (id) => {
    if (!confirm('Permanently delete this product? This cannot be undone.')) return;
    await adminApi.deleteProduct(id); refresh();
  };
  const onDuplicate = async (id) => {
    await adminApi.duplicateProduct(id);
    refresh();
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Inventory" subtitle="Manage all products across your platform" onRefresh={refresh} loading={loading}>
        <Link to="/products/new/edit" className="btn-primary">
          + Add Product
        </Link>
      </PageHeader>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard label="Total Products" value={dash?.totalProducts ?? '—'} icon={Package} accent="primary" />
        <StatCard label="Available" value={dash?.availableProducts ?? '—'} icon={CheckCircle2} accent="success" />
        <StatCard label="Reserved" value={dash?.reservedProducts ?? '—'} icon={Clock} accent="warn" />
        <StatCard label="Sold" value={dash?.soldProducts ?? '—'} icon={ShoppingBag} accent="brand" />
      </div>

      <FilterPanel>
        <SearchBar value={filters.search} onChange={(v) => set('search', v)} placeholder="Search name, brand, model…" />
        <select className="input w-auto min-w-[150px]" value={filters.category} onChange={(e) => set('category', e.target.value)}>
          <option value="">All categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{titleCase(c)}</option>)}
        </select>
        <select className="input w-auto min-w-[150px]" value={filters.status} onChange={(e) => set('status', e.target.value)}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{titleCase(s)}</option>)}
        </select>
        <select className="input w-auto min-w-[170px]" value={filters.sort} onChange={(e) => set('sort', e.target.value)}>
          {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <div className="ml-auto flex items-center gap-1 rounded-xl border border-line bg-white p-1">
          <button
            className={`grid h-8 w-8 place-items-center rounded-lg transition-colors ${view === 'table' ? 'bg-primary-800 text-white' : 'text-muted hover:bg-primary-50'}`}
            onClick={() => setView('table')} title="Table view"
          ><List size={14} /></button>
          <button
            className={`grid h-8 w-8 place-items-center rounded-lg transition-colors ${view === 'grid' ? 'bg-primary-800 text-white' : 'text-muted hover:bg-primary-50'}`}
            onClick={() => setView('grid')} title="Grid view"
          ><LayoutGrid size={14} /></button>
        </div>
      </FilterPanel>

      {loading && !data ? <Loader />
        : error && !data ? <ErrorState message={error} onRetry={refresh} />
        : (data?.items || []).length === 0 ? <EmptyState label="No products match the filters" sub="Try adjusting your search or filters" />
        : view === 'table' ? (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th><th>Category</th><th>Price</th>
                  <th>Location</th><th>Status</th><th>Views</th><th>Leads</th><th>Added</th><th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <img src={p.images?.[0] || 'https://placehold.co/64x48?text=No+Img'}
                          alt={p.name} className="h-10 w-14 rounded-xl object-cover bg-primary-100 shrink-0" />
                        <div>
                          <Link to={`/products/${p._id}`} className="font-semibold text-ink hover:text-brand-600 line-clamp-1">
                            {p.name}
                          </Link>
                          <p className="text-[11px] text-muted">{[p.brand, p.model, p.year].filter(Boolean).join(' · ')}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-neutral capitalize">{p.category}</span>
                    </td>
                    <td>
                      <span className="font-bold text-ink">{formatPriceFull(p.price)}</span>
                    </td>
                    <td className="text-muted">
                      <div className="flex items-center gap-1"><MapPin size={11} />{p.location || '—'}</div>
                    </td>
                    <td><StatusBadge status={p.status} map={PRODUCT_STATUS_MAP} /></td>
                    <td className="text-muted">{p.views ?? 0}</td>
                    <td className="text-muted">{p.leadCount ?? 0}</td>
                    <td className="text-muted">{formatDate(p.createdAt)}</td>
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        {p.status === 'available' && (
                          <>
                            <button className="icon-btn hover:text-success-600" onClick={() => setSaleTarget(p)} title="Mark Sold"><Tag size={14} /></button>
                            <button className="icon-btn hover:text-amber-600" onClick={() => setReserveTarget(p)} title="Reserve"><KeyRound size={14} /></button>
                          </>
                        )}
                        {p.status === 'reserved' && (
                          <button className="icon-btn hover:text-success-600" onClick={() => setSaleTarget(p)} title="Mark Sold"><Tag size={14} /></button>
                        )}
                        <Link to={`/products/${p._id}`} className="icon-btn" title="View"><Eye size={14} /></Link>
                        <Link to={`/products/${p._id}/edit`} className="icon-btn" title="Edit"><Pencil size={14} /></Link>
                        <button className="icon-btn" onClick={() => onDuplicate(p._id)} title="Duplicate"><Copy size={14} /></button>
                        <button className="icon-btn hover:text-amber-600" onClick={() => onArchive(p._id)} title="Archive"><Archive size={14} /></button>
                        {/* <button className="icon-btn hover:text-danger" onClick={() => onDelete(p._id)} title="Delete"><Trash2 size={14} /></button> */}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.items.map((p) => (
              <ProductCard key={p._id} product={p} onArchive={onArchive} onDelete={onDelete} onDuplicate={onDuplicate}
                onMarkSold={() => setSaleTarget(p)} onReserve={() => setReserveTarget(p)} />
            ))}
          </div>
        )}

      <Pagination page={data?.page} pages={data?.pages} total={data?.total} onChange={(p) => set('page', p)} />

      <MarkSoldDialog key={`sold-${saleTarget?._id || 'none'}`} open={!!saleTarget} onClose={() => setSaleTarget(null)} product={saleTarget} onSuccess={refresh} />
      <ReserveDialog key={`reserve-${reserveTarget?._id || 'none'}`} open={!!reserveTarget} onClose={() => setReserveTarget(null)} product={reserveTarget} onSuccess={refresh} />
    </div>
  );
}

function ProductCard({ product: p, onArchive, onDelete, onDuplicate, onMarkSold, onReserve }) {
  return (
    <div className="card overflow-hidden card-hover group">
      <div className="relative">
        <Link to={`/products/${p._id}`}>
          <img src={p.images?.[0] || 'https://placehold.co/320x200?text=No+Image'} alt={p.name}
            className="h-40 w-full object-cover bg-primary-100" />
        </Link>
        <div className="absolute top-2 right-2">
          <StatusBadge status={p.status} map={PRODUCT_STATUS_MAP} />
        </div>
        {p.featured && (
          <div className="absolute top-2 left-2">
            <span className="badge badge-warning">Featured</span>
          </div>
        )}
      </div>
      <div className="p-4 space-y-3">
        <div>
          <Link to={`/products/${p._id}`} className="font-semibold text-ink hover:text-brand-600 line-clamp-1 block">{p.name}</Link>
          <p className="text-[11px] text-muted mt-0.5">{[p.brand, p.model].filter(Boolean).join(' · ')}</p>
        </div>
        <p className="text-lg font-bold text-ink">{formatPriceFull(p.price)}</p>
        <div className="grid grid-cols-3 gap-2 text-[11px] text-muted">
          {p.year && <span className="flex items-center gap-1"><Calendar size={10} />{p.year}</span>}
          {p.fuel && <span className="flex items-center gap-1"><Fuel size={10} />{p.fuel}</span>}
          {p.location && <span className="flex items-center gap-1"><MapPin size={10} truncate>{p.location}</MapPin></span>}
        </div>
        <div className="flex items-center justify-between pt-1 border-t border-line">
          <div className="flex items-center gap-3 text-[11px] text-muted">
            <span className="flex items-center gap-1"><Eye size={11} />{p.views ?? 0}</span>
            <span className="flex items-center gap-1"><Target size={11} />{p.leadCount ?? 0}</span>
          </div>
          <div className="flex items-center gap-0.5">
            {p.status === 'available' && (
              <>
                <button className="icon-btn hover:text-success-600" onClick={onMarkSold} title="Mark Sold"><Tag size={13} /></button>
                <button className="icon-btn hover:text-amber-600" onClick={onReserve} title="Reserve"><KeyRound size={13} /></button>
              </>
            )}
            {p.status === 'reserved' && (
              <button className="icon-btn hover:text-success-600" onClick={onMarkSold} title="Mark Sold"><Tag size={13} /></button>
            )}
            <Link to={`/products/${p._id}/edit`} className="icon-btn" title="Edit"><Pencil size={13} /></Link>
            <button className="icon-btn" onClick={() => onDuplicate(p._id)} title="Duplicate"><Copy size={13} /></button>
            <button className="icon-btn hover:text-amber-600" onClick={() => onArchive(p._id)} title="Archive"><Archive size={13} /></button>
            <button className="icon-btn hover:text-danger" onClick={() => onDelete(p._id)} title="Delete"><Trash2 size={13} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
