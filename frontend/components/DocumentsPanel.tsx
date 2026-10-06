'use client';
import { useState } from 'react';
import {
  RiAddLine,
  RiDeleteBinLine,
  RiFileCheckLine,
} from 'react-icons/ri';
import { del, DOC_STATUSES, label, patch, post, STANDARD_DOCS, today } from '@/lib/api';
import { useSession } from '@/lib/session';

const DOC_STATUS_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  PENDING: { bg: '#fffbeb', color: '#d97706', border: '#fcd34d' },
  RECEIVED: { bg: '#eff6ff', color: '#2563eb', border: '#93c5fd' },
  VERIFIED: { bg: '#f0fdf4', color: '#059669', border: '#6ee7b7' },
  REJECTED: { bg: '#fef2f2', color: '#dc2626', border: '#fca5a5' },
};

function DocRow({ d, onUpdate, onRemove }: { d: any; onUpdate: (d: any) => void; onRemove: (d: any) => void }) {
  const { toast, isSuper } = useSession();
  const [notes, setNotes] = useState(d.notes ?? '');

  async function save(body: Record<string, any>) {
    try {
      onUpdate(await patch(`/documents/${d.id}`, body));
    } catch (e: any) {
      toast(e.message, 'err');
    }
  }

  const setStatus = (status: string) =>
    save({
      status,
      ...((status === 'RECEIVED' || status === 'VERIFIED') && !d.receivedDate ? { receivedDate: today() } : {}),
    });

  const style = DOC_STATUS_STYLES[d.status] ?? DOC_STATUS_STYLES.PENDING;

  return (
    <tr>
      <td>
        <span style={{ fontWeight: 600, fontSize: 13 }}>{d.documentType}</span>
      </td>
      <td>
        <select
          value={d.status}
          onChange={(e) => setStatus(e.target.value)}
          style={{
            width: 'auto',
            fontSize: 12,
            padding: '4px 8px',
            background: style.bg,
            color: style.color,
            border: `1px solid ${style.border}`,
            borderRadius: 6,
            fontWeight: 600,
          }}
        >
          {DOC_STATUSES.map((s) => (
            <option key={s} value={s}>{label(s)}</option>
          ))}
        </select>
      </td>
      <td>
        <input
          type="date"
          value={d.receivedDate ?? ''}
          onChange={(e) => save({ receivedDate: e.target.value || null })}
          style={{ width: 'auto', fontSize: 12.5 }}
        />
      </td>
      <td>
        <input
          style={{ width: '100%', fontSize: 13 }}
          placeholder="Add a note…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={() => notes !== (d.notes ?? '') && save({ notes: notes || null })}
          onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
        />
      </td>
      <td className="r">
        {isSuper && (
          <button
            className="danger"
            onClick={() => onRemove(d)}
            style={{ padding: '4px 8px', fontSize: 12 }}
          >
            <RiDeleteBinLine size={14} />
          </button>
        )}
      </td>
    </tr>
  );
}

/** Document checklist for one applicant: every change saves instantly. */
export default function DocumentsPanel({
  applicantId,
  docs,
  setDocs,
}: {
  applicantId: string;
  docs: any[];
  setDocs: (d: any[]) => void;
}) {
  const { toast } = useSession();
  const [type, setType] = useState('');
  const [busy, setBusy] = useState(false);

  const done = docs.filter((d) => d.status === 'RECEIVED' || d.status === 'VERIFIED').length;
  const pct = docs.length ? Math.round((done / docs.length) * 100) : 0;

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!type.trim()) return;
    setBusy(true);
    try {
      const d = await post(`/applicants/${applicantId}/documents`, { documentType: type.trim() });
      setDocs([...docs, d]);
      setType('');
    } catch (e: any) {
      toast(e.message, 'err');
    } finally {
      setBusy(false);
    }
  }

  async function checklist() {
    setBusy(true);
    try {
      setDocs(await post(`/applicants/${applicantId}/documents/checklist`));
      toast('Standard checklist added');
    } catch (e: any) {
      toast(e.message, 'err');
    } finally {
      setBusy(false);
    }
  }

  async function remove(d: any) {
    if (!confirm(`Remove "${d.documentType}"?`)) return;
    try {
      await del(`/documents/${d.id}`);
      setDocs(docs.filter((x) => x.id !== d.id));
    } catch (e: any) {
      toast(e.message, 'err');
    }
  }

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid #f1f5f9',
        background: '#fafbfc',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        flexWrap: 'wrap',
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: '#ecfdf5',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#059669',
        }}>
          <RiFileCheckLine size={17} />
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: 14 }}>Documents</h3>
          <span style={{ fontSize: 12, color: '#64748b' }}>{done} of {docs.length} received</span>
        </div>
        <div style={{ flex: 1 }} />

        {/* Progress pill */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: pct === 100 ? '#d1fae5' : '#f1f5f9',
          borderRadius: 99, padding: '4px 14px',
          border: `1px solid ${pct === 100 ? '#6ee7b7' : '#e2e8f0'}`,
        }}>
          <div style={{
            width: 60, height: 6, background: '#e2e8f0',
            borderRadius: 99, overflow: 'hidden',
          }}>
            <div style={{
              width: `${pct}%`, height: '100%',
              background: pct === 100 ? '#059669' : '#2563eb',
              borderRadius: 99, transition: 'width 0.4s ease',
            }} />
          </div>
          <span style={{
            fontSize: 12, fontWeight: 700,
            color: pct === 100 ? '#059669' : '#374151',
          }}>
            {pct}%
          </span>
        </div>

        <button
          className="ghost"
          disabled={busy}
          onClick={checklist}
          style={{ fontSize: 12.5, padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 5 }}
        >
          <RiAddLine size={14} /> Standard checklist
        </button>
      </div>

      {/* Table */}
      <div className="table-wrap" style={{ border: 'none', borderRadius: 0 }}>
        <table>
          <thead>
            <tr>
              <th>Document</th>
              <th>Status</th>
              <th>Received on</th>
              <th>Notes</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {docs.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '28px 0', color: '#94a3b8' }}>
                  No documents yet. Add one below or use the standard checklist.
                </td>
              </tr>
            )}
            {docs.map((d) => (
              <DocRow
                key={d.id}
                d={d}
                onRemove={remove}
                onUpdate={(u) => setDocs(docs.map((x) => (x.id === u.id ? u : x)))}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Add document form */}
      <div style={{
        padding: '14px 20px',
        borderTop: '1px solid #f1f5f9',
        background: '#fafbfc',
        display: 'flex',
        gap: 8,
      }}>
        <input
          list="std-docs"
          style={{ flex: 1, maxWidth: 380, fontSize: 13 }}
          placeholder="Add a document (type or pick)…"
          value={type}
          onChange={(e) => setType(e.target.value)}
        />
        <datalist id="std-docs">
          {STANDARD_DOCS.map((s) => <option key={s} value={s} />)}
        </datalist>
        <button
          onClick={add as any}
          disabled={busy || !type.trim()}
          style={{
            background: 'linear-gradient(135deg, #14213d, #213868)',
            border: 'none',
            display: 'flex', alignItems: 'center', gap: 5, fontSize: 13,
          }}
        >
          <RiAddLine size={14} /> Add
        </button>
      </div>
    </div>
  );
}
