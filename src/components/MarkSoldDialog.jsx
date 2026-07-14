import { useState } from 'react';
import { adminApi } from '../api/admin';
import { Modal, Field, inputCls } from './UI';

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'loan', label: 'Loan' },
  { value: 'mixed', label: 'Mixed' },
];

export default function MarkSoldDialog({ open, onClose, product, onSuccess }) {
  const [customerType, setCustomerType] = useState('existing');
  const [customerId, setCustomerId] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerResults, setCustomerResults] = useState([]);
  const [selectedCustomerLabel, setSelectedCustomerLabel] = useState('');
  const [walkIn, setWalkIn] = useState({ name: '', phone: '', email: '' });
  const [salePrice, setSalePrice] = useState(product?.price ?? '');
  const [discount, setDiscount] = useState('');
  const [bookingAmount, setBookingAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [loanUsed, setLoanUsed] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [saleDate, setSaleDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const searchCustomers = async (q) => {
    setCustomerSearch(q);
    if (!q || q.trim().length < 2) { setCustomerResults([]); return; }
    try {
      const res = await adminApi.customerSearch(q.trim());
      setCustomerResults(res.items || []);
    } catch { /* ignore search errors */ }
  };

  const submit = async () => {
    setError('');
    if (customerType === 'existing' && !customerId) {
      setError('Select an existing customer, or switch to Walk-in Customer.');
      return;
    }
    if (customerType === 'walk_in' && (!walkIn.name || !walkIn.phone)) {
      setError('Walk-in customer needs at least a name and phone number.');
      return;
    }
    if (!salePrice || Number(salePrice) < 0) {
      setError('Enter a valid sale price.');
      return;
    }
    setSubmitting(true);
    try {
      await adminApi.createSale({
        productId: product._id,
        customerType,
        customerId: customerType === 'existing' ? customerId : undefined,
        walkIn: customerType === 'walk_in' ? walkIn : undefined,
        salePrice: Number(salePrice),
        discount: Number(discount) || 0,
        bookingAmount: Number(bookingAmount) || 0,
        paymentMethod,
        loanUsed,
        remarks,
        soldDate: saleDate,
      });
      onSuccess?.();
      onClose();
    } catch (e) {
      setError(e.message || 'Could not record this sale.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Mark As Sold" subtitle={product?.name}>
      <div className="space-y-4">
        {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-danger">{error}</div>}

        <Field label="Customer Type">
          <div className="flex gap-2">
            {['existing', 'walk_in'].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setCustomerType(t)}
                className={`flex-1 rounded-xl border px-3 py-2 text-sm font-semibold transition-colors ${
                  customerType === t ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-line text-primary-700 hover:bg-primary-50'
                }`}
              >
                {t === 'existing' ? 'Existing Customer' : 'Walk-in Customer'}
              </button>
            ))}
          </div>
        </Field>

        {customerType === 'existing' ? (
          <Field label="Customer">
            <input
              className={inputCls}
              placeholder="Search by name, phone, or email…"
              value={selectedCustomerLabel || customerSearch}
              onChange={(e) => { setSelectedCustomerLabel(''); setCustomerId(''); searchCustomers(e.target.value); }}
            />
            {customerResults.length > 0 && !customerId && (
              <div className="mt-1.5 max-h-40 overflow-y-auto rounded-xl border border-line">
                {customerResults.map((c) => (
                  <button
                    type="button"
                    key={c._id}
                    onClick={() => { setCustomerId(c._id); setSelectedCustomerLabel(`${c.name} — ${c.phone || c.email}`); setCustomerResults([]); }}
                    className="block w-full px-3 py-2 text-left text-sm hover:bg-primary-50"
                  >
                    <span className="font-semibold text-ink">{c.name}</span>{' '}
                    <span className="text-muted">{c.phone || c.email}</span>
                  </button>
                ))}
              </div>
            )}
          </Field>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <Field label="Full Name" className="col-span-2">
              <input className={inputCls} value={walkIn.name} onChange={(e) => setWalkIn({ ...walkIn, name: e.target.value })} />
            </Field>
            <Field label="Phone Number">
              <input className={inputCls} value={walkIn.phone} onChange={(e) => setWalkIn({ ...walkIn, phone: e.target.value })} />
            </Field>
            <Field label="Email (optional)">
              <input className={inputCls} value={walkIn.email} onChange={(e) => setWalkIn({ ...walkIn, email: e.target.value })} />
            </Field>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Field label="Sale Price (₹)">
            <input type="number" className={inputCls} value={salePrice} onChange={(e) => setSalePrice(e.target.value)} />
          </Field>
          <Field label="Sale Date">
            <input type="date" className={inputCls} value={saleDate} onChange={(e) => setSaleDate(e.target.value)} />
          </Field>
          <Field label="Booking Amount (₹)">
            <input type="number" className={inputCls} value={bookingAmount} onChange={(e) => setBookingAmount(e.target.value)} />
          </Field>
          <Field label="Final Discount (₹)">
            <input type="number" className={inputCls} value={discount} onChange={(e) => setDiscount(e.target.value)} />
          </Field>
          <Field label="Payment Method">
            <select className={inputCls} value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
              {PAYMENT_METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </Field>
          <Field label="Loan Used?">
            <select className={inputCls} value={loanUsed ? 'yes' : 'no'} onChange={(e) => setLoanUsed(e.target.value === 'yes')}>
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </Field>
        </div>

        <Field label="Remarks">
          <textarea className={inputCls} rows={2} value={remarks} onChange={(e) => setRemarks(e.target.value)} />
        </Field>

        <div className="flex justify-end gap-2 pt-1">
          <button className="btn-outline" onClick={onClose} type="button">Cancel</button>
          <button className="btn-primary" onClick={submit} disabled={submitting} type="button">
            {submitting ? 'Recording…' : 'Confirm Sale'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
