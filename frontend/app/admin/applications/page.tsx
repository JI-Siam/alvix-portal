'use client';
import { useCallback, useEffect, useState } from 'react';
import { RiFilterLine, RiSearchLine, RiAddLine } from 'react-icons/ri';
import ApplicationModal from '@/components/ApplicationModal';
import ApplicationsTable from '@/components/ApplicationsTable';
import { ExcelButton, PageHead, Pagination } from '@/components/ui';
import { api, label, STATUSES } from '@/lib/api';
import { useSession } from '@/lib/session';

const SELECT_STYLE: React.CSSProperties = {
  minWidth: 150, fontSize: 13, padding: '7px 10px',
  border: '1.5px solid #e2e8f0', borderRadius: 8,
  background: '#fff', color: '#0f172a', width: 'auto',
};

export default function Page() {
  const { toast } = useSession();
  const [rows, setRows] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<{ row?: any } | null>(null);

  // ── Filter state ───────────────────────────────────────────────────────────
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [intakeId, setIntakeId] = useState('');
  const [universityId, setUniversityId] = useState('');
  const [programId, setProgramId] = useState('');
  const [areaId, setAreaId] = useState('');

  // ── Reference data ─────────────────────────────────────────────────────────
  const [intakes, setIntakes] = useState<any[]>([]);
  const [universities, setUniversities] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [areas, setAreas] = useState<any[]>([]);

  const limit = 15;

  useEffect(() => {
    api('/intakes?limit=500').then((r) => setIntakes(r.items));
    api('/universities?limit=500').then((r) => setUniversities(r.items));
    api('/programs?limit=500').then((r) => setPrograms(r.items));
    api('/areas?limit=500').then((r) => setAreas(r.items));
  }, []);

  // Programs filtered by selected university (if one is chosen)
  const visiblePrograms = universityId
    ? (universities.find((u) => u.id === universityId)?.programs ?? [])
    : programs;

  const load = useCallback(() => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (status) params.set('status', status);
    if (intakeId) params.set('intakeId', intakeId);
    if (universityId) params.set('universityId', universityId);
    if (programId) params.set('programId', programId);
    if (areaId) params.set('areaId', areaId);
    if (q) params.set('q', q);
    api(`/applications?${params}`).then((r) => { setRows(r.items); setTotal(r.total); }).catch((e) => toast(e.message, 'err'));
  }, [page, status, intakeId, universityId, programId, areaId, q, toast]);

  useEffect(() => { const t = setTimeout(load, q ? 250 : 0); return () => clearTimeout(t); }, [load, q]);

  function resetFilters() {
    setQ(''); setStatus(''); setIntakeId(''); setUniversityId(''); setProgramId(''); setAreaId('');
    setPage(1);
  }

  const hasFilters = q || status || intakeId || universityId || programId || areaId;

  return (
    <>
      <PageHead title="Applications" sub="Change a status straight from the table">
        <ExcelButton path="/applications/export" params={{ status, intakeId, universityId, programId, areaId, q }} />
        <button
          onClick={() => setModal({})}
          style={{ background: 'linear-gradient(135deg,#14213d,#213868)', border: 'none', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <RiAddLine size={15} /> New application
        </button>
      </PageHead>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Filter bar */}
        <div style={{
          padding: '14px 18px',
          borderBottom: '1px solid #f1f5f9',
          background: '#fafbfc',
          display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center',
        }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 180, maxWidth: 300 }}>
            <div style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
              <RiSearchLine size={15} />
            </div>
            <input
              style={{ paddingLeft: 30, width: '100%', fontSize: 13 }}
              placeholder="Search ID, name, passport…"
              value={q}
              onChange={(e) => { setQ(e.target.value); setPage(1); }}
            />
          </div>

          {/* Status */}
          <select style={SELECT_STYLE} value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            <option value="">All statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{label(s)}</option>)}
          </select>

          {/* Area */}
          <select style={SELECT_STYLE} value={areaId} onChange={(e) => { setAreaId(e.target.value); setPage(1); }}>
            <option value="">All areas</option>
            {areas.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>

          {/* University — resets program when changed */}
          <select style={SELECT_STYLE} value={universityId} onChange={(e) => { setUniversityId(e.target.value); setProgramId(''); setPage(1); }}>
            <option value="">All universities</option>
            {universities.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>

          {/* Program — filtered to selected university */}
          <select style={SELECT_STYLE} value={programId} onChange={(e) => { setProgramId(e.target.value); setPage(1); }}>
            <option value="">{universityId ? 'All programs' : 'All programs'}</option>
            {visiblePrograms.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>

          {/* Intake */}
          <select style={SELECT_STYLE} value={intakeId} onChange={(e) => { setIntakeId(e.target.value); setPage(1); }}>
            <option value="">All intakes</option>
            {intakes.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
          </select>

          {/* Active filter indicator + reset */}
          {hasFilters && (
            <button
              className="ghost"
              onClick={resetFilters}
              style={{ fontSize: 12.5, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 5, color: '#dc2626', borderColor: '#fca5a5' }}
            >
              <RiFilterLine size={14} /> Clear filters
            </button>
          )}
        </div>

        {/* Results summary */}
        {hasFilters && (
          <div style={{ padding: '8px 18px', background: '#eff6ff', borderBottom: '1px solid #bfdbfe', fontSize: 12.5, color: '#1e40af', display: 'flex', alignItems: 'center', gap: 6 }}>
            <RiFilterLine size={13} />
            Showing filtered results — {total} application{total !== 1 ? 's' : ''} found
          </div>
        )}

        <ApplicationsTable rows={rows} onEdit={(r) => setModal({ row: r })} onChanged={load} />

        <div style={{ padding: '0 18px 14px' }}>
          <Pagination page={page} total={total} limit={limit} onPage={setPage} />
        </div>
      </div>

      {modal && <ApplicationModal row={modal.row} onClose={() => setModal(null)} onSaved={load} />}
    </>
  );
}
