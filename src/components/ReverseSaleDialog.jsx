import { useState } from 'react';
import { adminApi } from '../api/admin';
import { Modal, Field, inputCls } from './UI';

const REASONS = [
  { value: 'customer_cancelled', label: 'Customer Cancelled' },
  { value: 'loan_rejected', label: 'Loan Rejected' },
  { value: 'wrong_entry', label: 'Wrong Entry' },
  { value: 'duplicate_entry', label: 'Duplicate Entry' },
  { value: 'other', label: 'Other' },
];

export default function ReverseSaleDialog({ open, onClose, sale, onSuccess }) {
  const [reason, setReason] = useState('customer_cancelled');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    setError('');
    setSubmitting(true);
    try {
      await adminApi.reverseSale(sale._id, { reason, note: note.trim() || undefined });
      onSuccess?.();
      onClose();
    } catch (e) {
      setError(e.message || 'Could not reverse this sale.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Reverse Sale" subtitle={sale?.product?.name}>
      <div className="space-y-4">
        {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-danger">{error}</div>}

        <div className="rounded-xl bg-amber-50 border border-amber-200 px-3 py-2.5 text-xs text-amber-800">
          The sale record is kept for history — this reopens the product as
          available and restores any linked lead, loan, and reservation to
          their state before the sale.
        </div>

        <Field label="Reason">
          <select className={inputCls} value={reason} onChange={(e) => setReason(e.target.value)}>
            {REASONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </Field>

        <Field label="Note (optional)">
          <textarea className={inputCls} rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
        </Field>

        <div className="flex justify-end gap-2 pt-1">
          <button className="btn-outline" onClick={onClose} type="button">Cancel</button>
          <button
            className="btn-danger"
            onClick={submit}
            disabled={submitting}
            type="button"
          >
            {submitting ? 'Reversing…' : 'Reverse Sale'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
