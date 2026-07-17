import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { adminApi } from '../api/admin';
import { inputCls } from './UI';

/**
 * Search-select for picking one specific person by name, phone, or email
 * — instead of typing a raw database ID. Used anywhere an admin needs to
 * target a specific customer or dealer (e.g. sending a notification,
 * recording a sale/reservation for an existing customer).
 */
export default function UserPicker({ role, value, onChange, placeholder }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const search = async (q) => {
    setQuery(q);
    if (!q || q.trim().length < 2) {
      setResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = role === 'dealer' ? await adminApi.dealerSearch(q.trim()) : await adminApi.customerSearch(q.trim());
      setResults(res.items || []);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  if (value) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-line px-3 py-2.5">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ink truncate">{value.name}</p>
          <p className="text-xs text-muted truncate">{value.phone || value.email}</p>
        </div>
        <button type="button" className="icon-btn shrink-0" onClick={() => { onChange(null); setQuery(''); setResults([]); }}>
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          className={`${inputCls} pl-9`}
          placeholder={placeholder || `Search ${role} by name, phone, or email…`}
          value={query}
          onChange={(e) => search(e.target.value)}
        />
      </div>
      {searching && <p className="mt-1.5 text-xs text-muted">Searching…</p>}
      {results.length > 0 && (
        <div className="mt-1.5 max-h-44 overflow-y-auto rounded-xl border border-line">
          {results.map((u) => (
            <button
              type="button"
              key={u._id}
              onClick={() => { onChange(u); setResults([]); }}
              className="block w-full px-3 py-2 text-left text-sm hover:bg-primary-50"
            >
              <span className="font-semibold text-ink">{u.name}</span>{' '}
              <span className="text-muted">{u.phone || u.email}</span>
            </button>
          ))}
        </div>
      )}
      {!searching && query.trim().length >= 2 && results.length === 0 && (
        <p className="mt-1.5 text-xs text-muted">No {role}s found for "{query}".</p>
      )}
    </div>
  );
}
