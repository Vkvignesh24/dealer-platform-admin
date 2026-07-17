import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Phone, MessageCircle, Mail, CheckCircle2, XCircle, Clock, Save, Banknote, FileText, Upload, Trash2 } from 'lucide-react';
import { adminApi } from '../api/admin';
import { useAdminData } from '../lib/useAdminData';
import {
  Loader, ErrorState, StatusBadge, LOAN_STATUS_MAP, formatCurrencyFull, formatDateTime, KV, titleCase, TimelineItem, Avatar,
} from '../components/UI';

const STATUSES = ['new', 'documents_pending', 'under_review', 'bank_shared', 'approved', 'rejected', 'disbursed'];

const STATUS_ICONS = {
  new: Clock, documents_pending: FileText, under_review: Clock, bank_shared: FileText,
  approved: CheckCircle2, rejected: XCircle, disbursed: Banknote,
};
const STATUS_COLORS = {
  new: 'bg-blue-500', documents_pending: 'bg-amber-500', under_review: 'bg-amber-500', bank_shared: 'bg-purple-500',
  approved: 'bg-success-500', rejected: 'bg-danger', disbursed: 'bg-success-600',
};

export default function LoanDetails() {
  const { id } = useParams();
  const { data, loading, error, refresh } = useAdminData(() => adminApi.loan(id), [id]);
  const [status, setStatus] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [editingBank, setEditingBank] = useState(false);
  const [bankForm, setBankForm] = useState({ bankName: '', bankBranch: '', bankContactPerson: '', bankRemarks: '' });
  const [docForm, setDocForm] = useState({ name: '', url: '' });
  const [addingDoc, setAddingDoc] = useState(false);

  if (loading && !data) return <Loader />;
  if (error) return <ErrorState message={error} onRetry={refresh} />;
  if (!data) return null;

  const l = data;
  const current = status || l.status;

  const update = async (next) => {
    setBusy(true);
    try {
      await adminApi.updateLoan(id, { status: next || current, note });
      setNote(''); setStatus(''); refresh();
    } finally { setBusy(false); }
  };

  const saveBankInfo = async () => {
    setBusy(true);
    try {
      await adminApi.updateLoan(id, bankForm);
      setEditingBank(false);
      refresh();
    } finally { setBusy(false); }
  };

  const addDocument = async () => {
    if (!docForm.name.trim() || !docForm.url.trim()) return;
    setAddingDoc(true);
    try {
      await adminApi.addLoanDocument(id, docForm);
      setDocForm({ name: '', url: '' });
      refresh();
    } finally { setAddingDoc(false); }
  };

  const removeDocument = async (docId) => {
    if (!confirm('Remove this document?')) return;
    await adminApi.removeLoanDocument(id, docId);
    refresh();
  };

  const timeline = timelineOf(l);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link to="/loans" className="icon-btn"><ArrowLeft size={17} /></Link>
          <div>
            <h1 className="page-title">{l.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-muted text-sm">Loan Request</span>
              <span className="text-primary-300">·</span>
              <StatusBadge status={l.status} map={LOAN_STATUS_MAP} />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {l.phone && <a href={`tel:${l.phone}`} className="btn-outline"><Phone size={14} /> Call</a>}
          {l.phone && (
            <a href={`https://wa.me/${l.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer"
              className="btn-accent" style={{ background: '#25D366' }}>
              <MessageCircle size={14} /> WhatsApp
            </a>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {/* Loan summary hero */}
          <div className="rounded-2xl bg-gradient-to-br from-primary-800 to-primary-900 p-6 text-white">
            <p className="text-[11px] font-semibold uppercase tracking-widest opacity-60 mb-1">Loan Amount Requested</p>
            <p className="text-4xl font-extrabold">{formatCurrencyFull(l.loanAmount)}</p>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <LoanMini label="Tenure" value={l.tenureMonths ? `${l.tenureMonths} months` : '—'} />
              <LoanMini label="Down Payment" value={l.downPayment ? formatCurrencyFull(l.downPayment) : '—'} />
              <LoanMini label="Monthly Income" value={l.monthlySalary ? formatCurrencyFull(l.monthlySalary) : '—'} />
            </div>
          </div>

          {/* Applicant details */}
          <div className="card card-p">
            <div className="flex items-center gap-4 mb-4 pb-4 border-b border-line">
              <Avatar name={l.name} size={12} />
              <div>
                <p className="font-bold text-ink text-lg">{l.name}</p>
                <div className="flex items-center gap-3 text-sm text-muted mt-0.5">
                  {l.phone && <span className="flex items-center gap-1"><Phone size={12} />{l.phone}</span>}
                  {l.email && <span className="flex items-center gap-1"><Mail size={12} />{l.email}</span>}
                </div>
              </div>
            </div>
            <h3 className="panel-title mb-3">Applicant Information</h3>
            <div className="grid grid-cols-2 gap-x-6 divide-y divide-line">
              <KV label="Full Name" value={l.name} />
              <KV label="Occupation" value={l.occupation || '—'} />
              <KV label="Phone" value={l.phone} />
              <KV label="Email" value={l.email} />
              <KV label="Submitted" value={formatDateTime(l.createdAt)} />
              <KV label="Last Updated" value={formatDateTime(l.updatedAt)} />
            </div>
          </div>

          {l.remarks && (
            <div className="card card-p">
              <h3 className="panel-title mb-3">Applicant Remarks</h3>
              <div className="rounded-xl bg-primary-50 p-4">
                <p className="text-sm text-ink whitespace-pre-wrap leading-relaxed">{l.remarks}</p>
              </div>
            </div>
          )}

          {l.product && (
            <div className="card card-p">
              <h3 className="panel-title mb-3">Loan For</h3>
              <Link to={`/products/${l.product._id}`}
                className="flex items-center gap-4 rounded-xl border border-line p-3 hover:bg-primary-50 hover:border-primary-300 transition-colors">
                <img src={l.product.images?.[0] || 'https://placehold.co/96x64?text=img'} alt=""
                  className="h-16 w-24 rounded-xl object-cover bg-primary-100 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-ink">{l.product.name}</p>
                  <p className="text-xs text-muted capitalize mt-0.5">{l.product.category}</p>
                </div>
                <p className="font-bold text-lg text-ink shrink-0">{formatCurrencyFull(l.product.price)}</p>
              </Link>
            </div>
          )}

          {/* Bank Information */}
          <div className="card card-p">
            <h3 className="panel-title mb-3">Bank Information</h3>
            {editingBank ? (
              <div className="space-y-3">
                <div>
                  <label className="label">Bank Name</label>
                  <input className="input" value={bankForm.bankName} onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })} />
                </div>
                <div>
                  <label className="label">Branch</label>
                  <input className="input" value={bankForm.bankBranch} onChange={(e) => setBankForm({ ...bankForm, bankBranch: e.target.value })} />
                </div>
                <div>
                  <label className="label">Bank Contact Person</label>
                  <input className="input" value={bankForm.bankContactPerson} onChange={(e) => setBankForm({ ...bankForm, bankContactPerson: e.target.value })} />
                </div>
                <div>
                  <label className="label">Bank Remarks</label>
                  <textarea className="textarea h-20" value={bankForm.bankRemarks} onChange={(e) => setBankForm({ ...bankForm, bankRemarks: e.target.value })} />
                </div>
                <div className="flex gap-2">
                  <button className="btn-primary flex-1" disabled={busy} onClick={saveBankInfo}>Save</button>
                  <button className="btn-outline" onClick={() => setEditingBank(false)}>Cancel</button>
                </div>
              </div>
            ) : l.bankName || l.bankBranch || l.bankContactPerson || l.bankRemarks ? (
              <div className="divide-y divide-line">
                <KV label="Bank Name" value={l.bankName || '—'} highlight />
                <KV label="Branch" value={l.bankBranch || '—'} />
                <KV label="Contact Person" value={l.bankContactPerson || '—'} />
                {l.bankRemarks && <KV label="Remarks" value={l.bankRemarks} />}
                <div className="pt-3">
                  <button className="btn-outline w-full" onClick={() => {
                    setBankForm({
                      bankName: l.bankName || '', bankBranch: l.bankBranch || '',
                      bankContactPerson: l.bankContactPerson || '', bankRemarks: l.bankRemarks || '',
                    });
                    setEditingBank(true);
                  }}>Edit Bank Details</button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-muted mb-3">No bank has been assigned to this application yet.</p>
                <button className="btn-outline" onClick={() => {
                  setBankForm({ bankName: '', bankBranch: '', bankContactPerson: '', bankRemarks: '' });
                  setEditingBank(true);
                }}>Add Bank Details</button>
              </div>
            )}
          </div>

          {/* Documents */}
          <div className="card card-p">
            <h3 className="panel-title mb-3">Documents</h3>
            {l.documents?.length > 0 && (
              <div className="mb-3 space-y-2">
                {l.documents.map((d) => (
                  <div key={d._id} className="flex items-center justify-between rounded-xl border border-line px-3 py-2">
                    <a href={d.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm font-semibold text-brand-600 hover:underline truncate">
                      <FileText size={14} className="shrink-0" /> {d.name}
                    </a>
                    <button className="icon-btn hover:text-danger shrink-0" onClick={() => removeDocument(d._id)} title="Remove">
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex flex-col gap-2 sm:flex-row">
              <input className="input" placeholder="Document name (e.g. PAN Card)" value={docForm.name} onChange={(e) => setDocForm({ ...docForm, name: e.target.value })} />
              <input className="input" placeholder="Document URL" value={docForm.url} onChange={(e) => setDocForm({ ...docForm, url: e.target.value })} />
              <button className="btn-outline shrink-0" disabled={addingDoc} onClick={addDocument}>
                <Upload size={14} /> Add
              </button>
            </div>
          </div>

          {timeline.length > 0 && (
            <div className="card card-p">
              <h3 className="panel-title mb-4">Status Timeline</h3>
              <ol className="space-y-0">
                {timeline.map((s, i) => {
                  const SIcon = s.status ? (STATUS_ICONS[s.status] || Clock) : null;
                  const iconCls = s.status ? (STATUS_COLORS[s.status] || 'bg-primary-500') : 'bg-primary-300';
                  return (
                    <TimelineItem
                      key={i}
                      icon={SIcon}
                      iconCls={iconCls}
                      label={s.status ? titleCase(s.status) : s.text}
                      sub={s.note || undefined}
                      time={s.at}
                      isLast={i === timeline.length - 1}
                    />
                  );
                })}
              </ol>
            </div>
          )}
        </div>

        {/* Right: quick actions */}
        <div className="space-y-4">
          {/* Quick approve/reject */}
          <div className="card card-p">
            <h3 className="panel-title mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                className="btn-accent py-3 flex-col gap-1 h-auto rounded-xl"
                onClick={() => update('approved')}
                disabled={busy || l.status === 'approved'}
              >
                <CheckCircle2 size={18} />
                <span className="text-xs">Approve</span>
              </button>
              <button
                className="btn-danger py-3 flex-col gap-1 h-auto rounded-xl"
                onClick={() => update('rejected')}
                disabled={busy || l.status === 'rejected'}
              >
                <XCircle size={18} />
                <span className="text-xs">Reject</span>
              </button>
            </div>
          </div>

          <div className="card card-p">
            <h3 className="panel-title mb-4">Update Status</h3>
            <div className="space-y-3">
              <div>
                <label className="label">New Status</label>
                <select className="input" value={current} onChange={(e) => setStatus(e.target.value)}>
                  {STATUSES.map((s) => <option key={s} value={s}>{titleCase(s)}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Remarks / Note</label>
                <textarea className="textarea h-28" placeholder="Add bank remarks, notes, or reasons…"
                  value={note} onChange={(e) => setNote(e.target.value)} />
              </div>
              <button className="btn-primary w-full" disabled={busy} onClick={() => update()}>
                <Save size={14} /> {busy ? 'Saving…' : 'Save Update'}
              </button>
            </div>
          </div>

          <div className="card card-p">
            <h3 className="panel-title mb-3">Status Flow</h3>
            <div className="space-y-2">
              {STATUSES.map((s) => {
                const isReject = s === 'rejected';
                const isCurrent = s === l.status;
                const idx = STATUSES.indexOf(l.status);
                const sIdx = STATUSES.indexOf(s);
                const isDone = sIdx < idx && !isReject && l.status !== 'rejected';
                return (
                  <div key={s} className={`flex items-center gap-3 rounded-xl px-3 py-2 ${
                    isCurrent ? (isReject ? 'bg-red-50 border border-red-200' : 'bg-brand-50 border border-brand-200') : isDone ? 'opacity-60' : 'opacity-30'
                  }`}>
                    <div className={`h-2 w-2 rounded-full shrink-0 ${
                      isCurrent ? (isReject ? 'bg-danger ring-2 ring-red-200' : 'bg-brand-500 ring-2 ring-brand-200') :
                      isDone ? 'bg-success-500' : 'bg-primary-300'
                    }`} />
                    <span className={`text-sm ${isCurrent ? `font-semibold ${isReject ? 'text-danger' : 'text-brand-700'}` : 'text-muted'}`}>
                      {titleCase(s)}
                    </span>
                    {isCurrent && <span className="ml-auto badge text-[10px] badge-info">Current</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoanMini({ label, value }) {
  return (
    <div className="rounded-xl bg-white/10 px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-wider opacity-60">{label}</p>
      <p className="font-semibold text-white mt-0.5">{value}</p>
    </div>
  );
}

function timelineOf(l) {
  const a = (l.statusHistory || []).map((s) => ({ status: s.status, at: s.at, note: s.note }));
  const b = (l.notes || []).map((n) => ({ text: n.text, at: n.at }));
  return [...a, ...b].sort((x, y) => new Date(y.at) - new Date(x.at));
}
