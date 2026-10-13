'use client';
import Link from 'next/link';
import { RiExternalLinkLine } from 'react-icons/ri';
import { del, patch, STATUSES, label } from '@/lib/api';
import { useSession } from '@/lib/session';
import { Badge } from './ui';

/** Shared table: inline status change, edit and delete. `hideApplicant` is used on the applicant page. */
export default function ApplicationsTable({
  rows,
  hideApplicant,
  onEdit,
  onChanged,
}: {
  rows: any[];
  hideApplicant?: boolean;
  onEdit: (r: any) => void;
  onChanged: () => void;
}) {
  const { isSuper, toast } = useSession();

  async function setStatus(r: any, status: string) {
    try {
      await patch(`/applications/${r.id}`, { status });
      toast(`${r.applicationId} → ${label(status)}`);
      onChanged();
    } catch (e: any) {
      toast(e.message, 'err');
    }
  }

  async function remove(r: any) {
    if (!confirm(`Delete application ${r.applicationId}?`)) return;
    try {
      await del(`/applications/${r.id}`);
      toast('Application deleted');
      onChanged();
    } catch (e: any) {
      toast(e.message, 'err');
    }
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Application ID</th>
            {!hideApplicant && <th>Applicant</th>}
            <th>University</th>
            <th>Program</th>
            <th>Major</th>
            <th>Intake</th>
            <th>Date</th>
            <th>Status</th>
            <th className="r">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={9} style={{ textAlign: 'center', padding: '28px 0', color: '#94a3b8' }}>
                No applications.
              </td>
            </tr>
          )}
          {rows.map((r) => (
            <tr key={r.id}>
              <td>
                <span style={{
                  fontWeight: 700, fontSize: 12.5,
                  color: '#1e40af', background: '#eff6ff',
                  padding: '2px 8px', borderRadius: 6,
                  border: '1px solid #bfdbfe',
                }}>
                  {r.applicationId}
                </span>
              </td>
              {!hideApplicant && (
                <td>
                  <Link href={`/admin/applicants/${r.applicantId}`} style={{ fontWeight: 600 }}>
                    {r.applicant?.firstName} {r.applicant?.lastName}
                  </Link>
                </td>
              )}
              <td style={{ color: '#374151' }}>{r.university?.name}</td>
              <td style={{ color: '#374151' }}>{r.program?.name}</td>
              <td style={{ color: '#374151' }}>{r.major?.name}</td>
              <td style={{ color: '#374151' }}>{r.intake?.name}</td>
              <td style={{ color: '#64748b', fontSize: 13 }}>{r.applicationDate ?? '—'}</td>
              <td>
                <select
                  value={r.status}
                  onChange={(e) => setStatus(r, e.target.value)}
                  style={{
                    width: 'auto',
                    fontSize: 12,
                    padding: '4px 8px',
                    border: '1px solid #e2e8f0',
                    borderRadius: 6,
                    background: '#fafbfc',
                  }}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{label(s)}</option>
                  ))}
                </select>
              </td>
              <td className="r nowrap">
                <a
                  className="btn ghost"
                  href={`/api/reports/applications/${r.id}/pdf`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ fontSize: 12, padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                >
                  <RiExternalLinkLine size={12} /> PDF
                </a>
                <button
                  className="ghost"
                  onClick={() => onEdit(r)}
                  style={{ fontSize: 12, padding: '4px 10px' }}
                >
                  Edit
                </button>
                {isSuper && (
                  <button
                    className="danger"
                    onClick={() => remove(r)}
                    style={{ fontSize: 12, padding: '4px 10px' }}
                  >
                    Delete
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
