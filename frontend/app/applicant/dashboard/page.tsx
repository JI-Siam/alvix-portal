'use client';
import { useEffect, useState } from 'react';
import ProfileView from '@/components/ProfileView';
import { Badge, PageHead, PdfButtons } from '@/components/ui';
import { api } from '@/lib/api';

/** Read-only view of everything the consultancy holds about the logged-in applicant. */
export default function Dashboard() {
  const [me, setMe] = useState<any>(null); const [apps, setApps] = useState<any[]>([]); const [docs, setDocs] = useState<any[]>([]); const [err, setErr] = useState('');
  useEffect(() => {
    api('/applicants/me').then((m) => { setMe(m); api(`/applicants/${m.id}/documents`).then(setDocs); }).catch((e) => setErr(e.message));
    api('/applications?limit=100').then((r) => setApps(r.items));
  }, []);
  if (err) return <p className="err">{err}</p>;
  if (!me) return <p className="muted">Loading…</p>;
  const done = docs.filter((d) => d.status === 'RECEIVED' || d.status === 'VERIFIED').length;
  return (
    <>
      <PageHead title={`Welcome, ${me.firstName}`} sub={`Passport ${me.passportNumber}`}><PdfButtons path="/reports/me/pdf" /></PageHead>
      <div className="card"><div className="card-head"><h3>My applications</h3><span className="muted">{apps.length}</span></div>
        <div className="table-wrap"><table>
          <thead><tr><th>Application ID</th><th>University</th><th>Program</th><th>Major</th><th>Intake</th><th>Date</th><th>Status</th><th /></tr></thead>
          <tbody>{apps.length === 0 && <tr><td colSpan={8} className="muted">No applications yet.</td></tr>}
            {apps.map((a) => (<tr key={a.id}><td><b>{a.applicationId}</b></td><td>{a.university?.name}</td><td>{a.program?.name}</td><td>{a.major?.name}</td><td>{a.intake?.name}</td>
              <td>{a.applicationDate ?? '—'}</td><td><Badge value={a.status} /></td>
              <td className="r"><a className="btn ghost" href={`/api/reports/applications/${a.id}/pdf`} target="_blank" rel="noreferrer">PDF</a></td></tr>))}</tbody></table></div></div>
      <div className="card"><div className="card-head"><h3>My documents</h3><span className="muted">{done} of {docs.length} received</span></div>
        <div className="bar ok" style={{ marginBottom: 12 }}><i style={{ width: `${docs.length ? (done / docs.length) * 100 : 0}%` }} /></div>
        <div className="table-wrap"><table>
          <thead><tr><th>Document</th><th>Status</th><th>Received on</th><th>Notes</th></tr></thead>
          <tbody>{docs.length === 0 && <tr><td colSpan={4} className="muted">No documents recorded yet.</td></tr>}
            {docs.map((d) => (<tr key={d.id}><td><b>{d.documentType}</b></td><td><Badge value={d.status} /></td><td>{d.receivedDate ?? '—'}</td><td>{d.notes ?? '—'}</td></tr>))}</tbody></table></div></div>
      <div className="card"><div className="card-head"><h3>My information</h3></div><ProfileView a={me} /></div>
    </>
  );
}
