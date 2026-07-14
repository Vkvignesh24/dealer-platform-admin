import { useState } from 'react';
import { adminApi } from '../api/admin';
import { Modal, Field, inputCls } from './UI';

export default function ReserveDialog({ open, onClose, product, onSuccess }) {
  const [customerType, setCustomerType] = useState('existing');
  const [customerId, setCustomerId] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerResults, setCustomerResults] = useState([]);
  const [selectedCustomerLabel, setSelectedCustomerLabel] = useState('');
  const [walkIn, setWalkIn] = useState({ name: '', phone: '', email: '' });
  const [bookingAmount, setBookingAmount] = useState('');
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const searchCustomers = async (q) => {
    setCustomerSearch(q);
    if (!q || q.trim().length < 2) { setCustomerResults([]); return; }
    try {
      const res = await adminApi.customerSearch(q.trim());
      setCustomerResults(res.items || []);
    } catch { /* ignore */ }
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
    setSubmitting(true);
    try {
      await adminApi.createReservation({
        productId: product._id,
        customerType,
        customerId: customerType === 'existing' ? customerId : undefined,
        walkIn: customerType === 'walk_in' ? walkIn : undefined,
        bookingAmount: Number(bookingAmount) || 0,
        expectedDeliveryDate: expectedDeliveryDate || undefined,
        remarks,
      });
      onSuccess?.();
      onClose();
    } catch (e) {
      setError(e.message || 'Could not create this reservation.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Reserve Product" subtitle={product?.name}>
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
          <Field label="Booking Amount (₹)">
            <input type="number" className={inputCls} value={bookingAmount} onChange={(e) => setBookingAmount(e.target.value)} />
          </Field>
          <Field label="Expected Delivery Date">
            <input type="date" className={inputCls} value={expectedDeliveryDate} onChange={(e) => setExpectedDeliveryDate(e.target.value)} />
          </Field>
        </div>

        <Field label="Remarks">
          <textarea className={inputCls} rows={2} value={remarks} onChange={(e) => setRemarks(e.target.value)} />
        </Field>

        <div className="flex justify-end gap-2 pt-1">
          <button className="btn-outline" onClick={onClose} type="button">Cancel</button>
          <button className="btn-primary" onClick={submit} disabled={submitting} type="button">
            {submitting ? 'Saving…' : 'Confirm Reservation'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
