'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { RiSearchLine, RiUser3Line, RiCloseLine } from 'react-icons/ri';
import { api, patch, post, STATUSES, label } from '@/lib/api';
import { useSession } from '@/lib/session';
import { Modal } from './ui';

/** Debounced applicant search-picker. Returns the selected applicant id. */
function ApplicantPicker({ value, onChange }: { value: string; onChange: (id: string, name: string) => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [selected, setSelected] = useState('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const r = await api(`/applicants?limit=20&q=${encodeURIComponent(query)}`);
        setResults(r.items);
        setOpen(true);
      } finally { setLoading(false); }
    }, 280);
    return () => clearTimeout(t);
  }, [query]);

  function pick(a: any) {
    const name = `${a.firstName} ${a.lastName ?? ''} (${a.passportNumber})`;
    setSelected(name);
    setQuery('');
    setResults([]);
    setOpen(false);
    onChange(a.id, name);
  }

  function clear() {
    setSelected('');
    setQuery('');
    setResults([]);
    onChange('', '');
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {selected ? (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 12px', border: '1.5px solid #2563eb',
          borderRadius: 8, background: '#eff6ff', fontSize: 13.5,
        }}>
          <RiUser3Line size={15} color="#2563eb" style={{ flexShrink: 0 }} />
          <span style={{ flex: 1, fontWeight: 500, color: '#1e40af' }}>{selected}</span>
          <button type="button" className="icon" onClick={clear} style={{ padding: 2 }}>
            <RiCloseLine size={15} />
          </button>
        </div>
      ) : (
        <>
          <div style={{ position: 'relative' }}>
            <div style={{
              position: 'absolute', left: 10, top: '50%',
              transform: 'translateY(-50%)', color: '#94a3b8',
            }}>
              <RiSearchLine size={15} />
            </div>
            <input
              style={{ paddingLeft: 32, width: '100%' }}
              placeholder="Type name or passport number…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => results.length && setOpen(true)}
              autoComplete="off"
            />
            {loading && (
              <div style={{
                position: 'absolute', right: 10, top: '50%',
                transform: 'translateY(-50%)',
              }}>
                <div style={{
                  width: 14, height: 14, borderRadius: '50%',
                  border: '2px solid #e2e8f0', borderTopColor: '#2563eb',
                  animation: 'spin 0.7s linear infinite',
                }} />
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              </div>
            )}
          </div>
          {open && results.length > 0 && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 60,
              background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10,
              boxShadow: '0 8px 24px rgba(0,0,0,0.1)', marginTop: 4,
              maxHeight: 260, overflowY: 'auto',
            }}>
              {results.map((a) => (
                <div
                  key={a.id}
                  onMouseDown={() => pick(a)}
                  style={{
                    padding: '10px 14px', cursor: 'pointer',
                    borderBottom: '1px solid #f1f5f9',
                    transition: 'background 0.1s',
                    display: 'flex', alignItems: 'center', gap: 10,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '#fff')}
                >
                  <div style={{
                    width: 30, height: 30, borderRadius: '50%',
                    background: 'linear-gradient(135deg,#dbeafe,#ede9fe)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#4f46e5', flexShrink: 0,
                    fontWeight: 700, fontSize: 11,
                  }}>
                    {a.firstName?.[0]}{a.lastName?.[0]}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13.5 }}>
                      {a.firstName} {a.lastName}
                    </div>
                    <div style={{ fontSize: 11.5, color: '#64748b' }}>{a.passportNumber}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {open && !loading && results.length === 0 && query.trim() && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 60,
              background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10,
              boxShadow: '0 8px 24px rgba(0,0,0,0.1)', marginTop: 4,
              padding: '14px', color: '#94a3b8', fontSize: 13, textAlign: 'center',
            }}>
              No applicants found for "{query}"
            </div>
          )}
        </>
      )}
    </div>
  );
}

/** Create or edit an application. If applicantId is given the applicant is locked (used on the applicant page). */
export default function ApplicationModal({ row, applicantId, onClose, onSaved }: {
  row?: any; applicantId?: string; onClose: () => void; onSaved: () => void;
}) {
  const { toast } = useSession();
  const edit = !!row;

  const [unis, setUnis] = useState<any[]>([]);
  const [majors, setMajors] = useState<any[]>([]);
  const [intakes, setIntakes] = useState<any[]>([]);
  const [f, setF] = useState({
    applicationId: row?.applicationId ?? '',
    applicantId: row?.applicantId ?? applicantId ?? '',
    universityId: row?.universityId ?? '',
    programId: row?.programId ?? '',
    majorId: row?.majorId ?? '',
    intakeId: row?.intakeId ?? '',
    status: row?.status ?? 'PENDING',
    applicationDate: row?.applicationDate ?? '',
    notes: row?.notes ?? '',
  });
  const [err, setErr] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api('/universities?limit=500').then((r) => setUnis(r.items.filter((u: any) => u.isActive || u.id === row?.universityId)));
    api('/majors?limit=500').then((r) => setMajors(r.items.filter((m: any) => m.isActive || m.id === row?.majorId)));
    api('/intakes?limit=500').then((r) => setIntakes(r.items.filter((i: any) => i.isActive || i.id === row?.intakeId)));
  }, [row]);

  const programs = (unis.find((u) => u.id === f.universityId)?.programs ?? []).filter((p: any) => p.isActive || p.id === row?.programId);
  const set = (k: string, v: string) => setF((s) => ({ ...s, [k]: v, ...(k === 'universityId' ? { programId: '' } : {}) }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErr('');
    try {
      if (edit) {
        await patch(`/applications/${row.id}`, {
          applicationId: f.applicationId || undefined,
          universityId: f.universityId, programId: f.programId,
          majorId: f.majorId, intakeId: f.intakeId, status: f.status,
          applicationDate: f.applicationDate || null, notes: f.notes || null,
        });
      } else {
        await post('/applications', {
          applicationId: f.applicationId || undefined,
          applicantId: f.applicantId,
          universityId: f.universityId, programId: f.programId,
          majorId: f.majorId, intakeId: f.intakeId, status: f.status,
          ...(f.applicationDate && { applicationDate: f.applicationDate }),
          ...(f.notes && { notes: f.notes }),
        });
      }
      toast(`Application ${edit ? 'updated' : 'created'}`);
      onSaved();
      onClose();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={edit ? `Edit ${row.applicationId}` : 'New application'} onClose={onClose}>
      <form onSubmit={submit}>
        <div className="form-grid">

          {/* Application ID — user-provided or left blank for auto-gen */}
          <label className="field">
            <span className="lbl">
              Application ID
              <span style={{ color: '#94a3b8', fontWeight: 400, marginLeft: 4 }}>
                (leave blank to auto-generate)
              </span>
            </span>
            <input
              value={f.applicationId}
              onChange={(e) => set('applicationId', e.target.value)}
              placeholder="e.g. KNU-2026-01234"
              style={{ textTransform: 'uppercase' }}
            />
          </label>

          {/* Applicant — searchable picker (locked when editing or on applicant page) */}
          {!applicantId && (
            <label className="field full">
              <span className="lbl">Applicant *</span>
              {edit ? (
                <input disabled value={`${row.applicant?.firstName} ${row.applicant?.lastName ?? ''} (${row.applicant?.passportNumber})`} />
              ) : (
                <>
                  <ApplicantPicker
                    value={f.applicantId}
                    onChange={(id) => set('applicantId', id)}
                  />
                  {/* Hidden required guard */}
                  <input
                    tabIndex={-1}
                    required
                    value={f.applicantId}
                    onChange={() => {}}
                    style={{ position: 'absolute', opacity: 0, height: 0, pointerEvents: 'none' }}
                  />
                </>
              )}
            </label>
          )}

          <label className="field">
            <span className="lbl">University *</span>
            <select required value={f.universityId} onChange={(e) => set('universityId', e.target.value)}>
              <option value="">Select…</option>
              {unis.map((u) => <option key={u.id} value={u.id}>{u.name}{u.area ? ` — ${u.area.name}` : ''}</option>)}
            </select>
          </label>

          <label className="field">
            <span className="lbl">Program * (offered by the university)</span>
            <select required value={f.programId} onChange={(e) => set('programId', e.target.value)} disabled={!f.universityId}>
              <option value="">{f.universityId ? (programs.length ? 'Select…' : 'No programs linked') : 'Pick a university first'}</option>
              {programs.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </label>

          <label className="field">
            <span className="lbl">Major *</span>
            <select required value={f.majorId} onChange={(e) => set('majorId', e.target.value)}>
              <option value="">Select…</option>
              {majors.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </label>

          <label className="field">
            <span className="lbl">Intake *</span>
            <select required value={f.intakeId} onChange={(e) => set('intakeId', e.target.value)}>
              <option value="">Select…</option>
              {intakes.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
            </select>
          </label>

          <label className="field">
            <span className="lbl">Status</span>
            <select value={f.status} onChange={(e) => set('status', e.target.value)}>
              {STATUSES.map((s) => <option key={s} value={s}>{label(s)}</option>)}
            </select>
          </label>

          <label className="field">
            <span className="lbl">Application date</span>
            <input type="date" value={f.applicationDate} onChange={(e) => set('applicationDate', e.target.value)} />
          </label>

          <label className="field full">
            <span className="lbl">Notes</span>
            <textarea rows={3} value={f.notes} onChange={(e) => set('notes', e.target.value)} />
          </label>
        </div>

        {err && (
          <div className="err" style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 12px' }}>
            ⚠️ {err}
          </div>
        )}
        <div className="modal-foot">
          <button type="button" className="ghost" onClick={onClose}>Cancel</button>
          <button disabled={saving} style={{ background: saving ? '#94a3b8' : 'linear-gradient(135deg, #14213d, #213868)', border: 'none' }}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
