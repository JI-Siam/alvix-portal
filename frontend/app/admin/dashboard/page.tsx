'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  RiUser3Line,
  RiFileList3Line,
  RiFileWarningLine,
  RiBuildingLine,
  RiGraduationCapLine,
  RiBookOpenLine,
  RiCalendarEventLine,
  RiMapPinLine,
  RiPassportLine,
  RiBankLine,
  RiArrowRightLine,
  RiTimeLine,
} from 'react-icons/ri';
import { Badge, PageHead } from '@/components/ui';
import { api, DOC_STATUSES, label, STATUSES } from '@/lib/api';

const TILE_META: Record<string, { icon: React.ReactNode; gradient: string }> = {
  Applicants: { icon: <RiUser3Line size={22} />, gradient: 'linear-gradient(135deg,#dbeafe,#ede9fe)' },
  Applications: { icon: <RiFileList3Line size={22} />, gradient: 'linear-gradient(135deg,#fce7f3,#fef3c7)' },
  'Pending documents': { icon: <RiFileWarningLine size={22} />, gradient: 'linear-gradient(135deg,#fef9c3,#fde68a)' },
  Universities: { icon: <RiBuildingLine size={22} />, gradient: 'linear-gradient(135deg,#d1fae5,#a7f3d0)' },
  Programs: { icon: <RiGraduationCapLine size={22} />, gradient: 'linear-gradient(135deg,#e0f2fe,#bae6fd)' },
  Majors: { icon: <RiBookOpenLine size={22} />, gradient: 'linear-gradient(135deg,#ede9fe,#ddd6fe)' },
  'Active intakes': { icon: <RiCalendarEventLine size={22} />, gradient: 'linear-gradient(135deg,#fce7f3,#fbcfe8)' },
  Areas: { icon: <RiMapPinLine size={22} />, gradient: 'linear-gradient(135deg,#ecfdf5,#d1fae5)' },
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#f59e0b',
  DOCUMENTS_COLLECTED: '#0ea5e9',
  SUBMITTED: '#8b5cf6',
  OFFER_RECEIVED: '#10b981',
  VISA_PROCESSING: '#6366f1',
  VISA_APPROVED: '#059669',
  REJECTED: '#ef4444',
  CANCELLED: '#94a3b8',
};

const DOC_COLORS: Record<string, string> = {
  PENDING: '#f59e0b',
  RECEIVED: '#0ea5e9',
  VERIFIED: '#10b981',
  REJECTED: '#ef4444',
};

export default function Dashboard() {
  const [s, setS] = useState<any>(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    api('/dashboard/stats').then(setS).catch((e) => setErr(e.message));
  }, []);

  if (err)
    return (
      <div style={{
        padding: '20px', background: '#fef2f2', border: '1px solid #fca5a5',
        borderRadius: 12, color: '#dc2626', fontWeight: 500,
      }}>
        ⚠️ {err}
      </div>
    );

  if (!s)
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, animation: 'pulse 1.5s ease infinite' }}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ height: 80, background: '#f1f5f9', borderRadius: 14 }} />
        ))}
        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }`}</style>
      </div>
    );

  const cnt = (list: any[], k: string) => list.find((x) => x.status === k)?.count ?? 0;
  const T = s.totals;

  const tiles: [string, number, string][] = [
    ['Applicants', T.applicants, '/admin/applicants'],
    ['Applications', T.applications, '/admin/applications'],
    ['Pending documents', T.pendingDocuments, '/admin/applicants'],
    ['Universities', T.universities, '/admin/universities'],
    ['Programs', T.programs, '/admin/programs'],
    ['Majors', T.majors, '/admin/majors'],
    ['Active intakes', T.intakes, '/admin/intakes'],
    ['Areas', T.areas, '/admin/areas'],
  ];

  const alertList = (rows: any[], empty: string) =>
    rows.length === 0 ? (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '14px 0', color: '#10b981', fontWeight: 500,
      }}>
        <span style={{ fontSize: 20 }}>🎉</span> {empty}
      </div>
    ) : (
      <div className="table-wrap" style={{ marginTop: 4 }}>
        <table>
          <thead>
            <tr>
              <th>Applicant</th>
              <th>Passport No.</th>
              <th className="r">Date</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const isExpired = new Date(r.date) < new Date();
              return (
                <tr key={r.id}>
                  <td>
                    <Link href={`/admin/applicants/${r.id}`} style={{ fontWeight: 600 }}>
                      {r.firstName} {r.lastName}
                    </Link>
                  </td>
                  <td><span className="muted" style={{ fontSize: 12 }}>{r.passportNumber}</span></td>
                  <td className="r">
                    <span style={{
                      color: isExpired ? '#dc2626' : '#d97706',
                      fontWeight: 700,
                      background: isExpired ? '#fef2f2' : '#fffbeb',
                      padding: '2px 10px',
                      borderRadius: 99,
                      fontSize: 12,
                      border: `1px solid ${isExpired ? '#fca5a5' : '#fcd34d'}`,
                    }}>
                      {r.date}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );

  return (
    <>
      <PageHead
        title="Dashboard"
        sub={`Welcome back — ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`}
      />

      {/* Stats grid */}
      <div className="stats">
        {tiles.map(([t, n, href]) => {
          const meta = TILE_META[t] ?? { icon: null, gradient: 'linear-gradient(135deg,#f1f5f9,#e2e8f0)' };
          return (
            <Link key={t} href={href} className="stat">
              <div style={{
                width: 42, height: 42, borderRadius: 10,
                background: meta.gradient,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 10, color: '#374151',
              }}>
                {meta.icon}
              </div>
              <b>{n ?? 0}</b>
              <span>{t}</span>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 4,
                marginTop: 6, fontSize: 12, color: '#3b82f6', fontWeight: 500,
              }}>
                View all <RiArrowRightLine size={13} />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Status charts */}
      <div className="two">
        {/* Applications by status */}
        <div className="card">
          <div className="card-head">
            <div style={{
              width: 34, height: 34, borderRadius: 8,
              background: '#ede9fe', display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: '#7c3aed',
            }}>
              <RiFileList3Line size={18} />
            </div>
            <h3 style={{ margin: 0 }}>Applications by Status</h3>
          </div>
          {STATUSES.map((st) => {
            const c = cnt(s.applicationsByStatus, st);
            const pct = T.applications ? (c / T.applications) * 100 : 0;
            const color = STATUS_COLORS[st] ?? '#94a3b8';
            return (
              <div key={st} className="row-bar">
                <span style={{ fontSize: 12.5 }}>{label(st)}</span>
                <div style={{ height: 8, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{
                    width: `${pct}%`, height: '100%',
                    background: color, borderRadius: 99,
                    transition: 'width 0.6s ease',
                  }} />
                </div>
                <b style={{ color }}>{c}</b>
              </div>
            );
          })}
        </div>

        {/* Documents by status */}
        <div className="card">
          <div className="card-head">
            <div style={{
              width: 34, height: 34, borderRadius: 8,
              background: '#dbeafe', display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: '#2563eb',
            }}>
              <RiFileWarningLine size={18} />
            </div>
            <h3 style={{ margin: 0 }}>Documents by Status</h3>
          </div>
          {DOC_STATUSES.map((st) => {
            const tot = s.documentsByStatus.reduce((a: number, x: any) => a + x.count, 0);
            const c = cnt(s.documentsByStatus, st);
            const pct = tot ? (c / tot) * 100 : 0;
            const color = DOC_COLORS[st] ?? '#94a3b8';
            return (
              <div key={st} className="row-bar">
                <span style={{ fontSize: 12.5 }}>{label(st)}</span>
                <div style={{ height: 8, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{
                    width: `${pct}%`, height: '100%',
                    background: color, borderRadius: 99,
                    transition: 'width 0.6s ease',
                  }} />
                </div>
                <b style={{ color }}>{c}</b>
              </div>
            );
          })}
        </div>
      </div>

      {/* Alert cards */}
      <div className="two">
        <div className="card">
          <div className="card-head">
            <div style={{
              width: 34, height: 34, borderRadius: 8,
              background: '#fef3c7', display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: '#d97706',
            }}>
              <RiPassportLine size={18} />
            </div>
            <h3 style={{ margin: 0 }}>Passports Expiring</h3>
            <span className="muted" style={{ fontSize: 12 }}>within 6 months</span>
            {s.passportsExpiring.length > 0 && (
              <span style={{
                marginLeft: 'auto',
                background: '#fef3c7', color: '#d97706',
                borderRadius: 99, padding: '2px 10px',
                fontSize: 12, fontWeight: 700,
                border: '1px solid #fcd34d',
              }}>
                {s.passportsExpiring.length}
              </span>
            )}
          </div>
          {alertList(s.passportsExpiring, 'No passports expiring soon')}
        </div>

        <div className="card">
          <div className="card-head">
            <div style={{
              width: 34, height: 34, borderRadius: 8,
              background: '#fee2e2', display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: '#dc2626',
            }}>
              <RiBankLine size={18} />
            </div>
            <h3 style={{ margin: 0 }}>Bank Maturity</h3>
            <span className="muted" style={{ fontSize: 12 }}>within 30 days</span>
            {s.bankMaturing.length > 0 && (
              <span style={{
                marginLeft: 'auto',
                background: '#fee2e2', color: '#dc2626',
                borderRadius: 99, padding: '2px 10px',
                fontSize: 12, fontWeight: 700,
                border: '1px solid #fca5a5',
              }}>
                {s.bankMaturing.length}
              </span>
            )}
          </div>
          {alertList(s.bankMaturing, 'No bank statements maturing soon')}
        </div>
      </div>

      {/* Recent Applications */}
      <div className="card">
        <div className="card-head">
          <div style={{
            width: 34, height: 34, borderRadius: 8,
            background: '#ecfdf5', display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: '#059669',
          }}>
            <RiTimeLine size={18} />
          </div>
          <h3 style={{ margin: 0 }}>Recent Applications</h3>
          <Link href="/admin/applications" style={{
            marginLeft: 'auto', fontSize: 13, fontWeight: 500,
            color: '#2563eb', display: 'flex', alignItems: 'center', gap: 4,
          }}>
            View all <RiArrowRightLine size={14} />
          </Link>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Application ID</th>
                <th>Applicant</th>
                <th>University</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {s.recentApplications.length === 0 && (
                <tr>
                  <td colSpan={4} className="muted" style={{ textAlign: 'center', padding: '24px 0' }}>
                    No applications yet.
                  </td>
                </tr>
              )}
              {s.recentApplications.map((a: any) => (
                <tr key={a.id}>
                  <td>
                    <span style={{
                      fontWeight: 700, fontSize: 13,
                      color: '#1e40af', background: '#eff6ff',
                      padding: '2px 8px', borderRadius: 6,
                      border: '1px solid #bfdbfe',
                    }}>
                      {a.applicationId}
                    </span>
                  </td>
                  <td>
                    <Link href={`/admin/applicants/${a.applicantId}`} style={{ fontWeight: 600 }}>
                      {a.firstName} {a.lastName}
                    </Link>
                  </td>
                  <td style={{ color: '#374151' }}>{a.university}</td>
                  <td><Badge value={a.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
