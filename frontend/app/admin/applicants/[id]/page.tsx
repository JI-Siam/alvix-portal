'use client';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import ApplicationModal from '@/components/ApplicationModal';
import ApplicationsTable from '@/components/ApplicationsTable';
import DocumentsPanel from '@/components/DocumentsPanel';
import EntityForm, { buildPayload, initialForm } from '@/components/EntityForm';
import PasswordModal from '@/components/PasswordModal';
import ProfileView from '@/components/ProfileView';
import { PageHead, PdfButtons } from '@/components/ui';
import { api, del, patch } from '@/lib/api';
import { APPLICANT_FIELDS } from '@/lib/fields';
import { useSession } from '@/lib/session';

export default function ApplicantDetail() {
  const { id } = useParams<{ id: string }>(); const router = useRouter(); const { isSuper, toast } = useSession();
  const [a, setA] = useState<any>(null); const [docs, setDocs] = useState<any[]>([]); const [apps, setApps] = useState<any[]>([]);
  const [editing, setEditing] = useState(false); const [form, setForm] = useState<Record<string, any>>({}); const [err, setErr] = useState('');
  const [appModal, setAppModal] = useState<{ row?: any } | null>(null); const [pwOpen, setPwOpen] = useState(false); const [notFound, setNotFound] = useState(false);

  const loadApps = useCallback(() => api(`/applications?applicantId=${id}&limit=100`).then((r) => setApps(r.items)), [id]);
  useEffect(() => {
    api(`/applicants/${id}`).then(setA).catch(() => setNotFound(true));
    api(`/applicants/${id}/documents`).then(setDocs).catch(() => {}); loadApps().catch(() => {});
  }, [id, loadApps]);

  async function save(e: React.FormEvent) {
    e.preventDefault(); setErr('');
    try { setA(await patch(`/applicants/${id}`, buildPayload(APPLICANT_FIELDS, form, 'edit'))); setEditing(false); toast('Profile updated'); }
    catch (e: any) { setErr(e.message); }
  }
  async function remove() {
    if (!confirm('Delete this applicant and all their documents? Applicants with applications cannot be deleted.')) return;
    try { await del(`/applicants/${id}`); toast('Applicant deleted'); router.push('/admin/applicants'); } catch (e: any) { toast(e.message, 'err'); }
  }

  if (notFound) return <p>Applicant not found. <Link href="/admin/applicants">Back to applicants</Link></p>;
  if (!a) return <p className="muted">Loading…</p>;

  return (
    <>
      <Link href="/admin/applicants" className="crumb">← All applicants</Link>
      <PageHead title={`${a.firstName} ${a.lastName ?? ''}`} sub={`Passport ${a.passportNumber}`}>
        <PdfButtons path={`/reports/applicants/${id}/pdf`} />
        <button className="ghost" onClick={() => setPwOpen(true)}>🔑 Set password</button>
        {!editing && <button onClick={() => { setForm(initialForm(APPLICANT_FIELDS, a, 'edit')); setErr(''); setEditing(true); }}>Edit profile</button>}
        {isSuper && <button className="danger" onClick={remove}>Delete applicant</button>}
      </PageHead>

      <div className="card">
        <div className="card-head"><h3>Profile</h3></div>
        {editing ? (
          <form onSubmit={save}>
            <EntityForm fields={APPLICANT_FIELDS} form={form} setForm={setForm} mode="edit" />
            {err && <div className="err">{err}</div>}
            <div className="modal-foot"><button type="button" className="ghost" onClick={() => setEditing(false)}>Cancel</button><button>Save changes</button></div>
          </form>
        ) : <ProfileView a={a} />}
      </div>

      <DocumentsPanel applicantId={id} docs={docs} setDocs={setDocs} />

      <div className="card">
        <div className="card-head"><h3>Applications</h3><span className="muted">{apps.length}</span><span className="sp" />
          <button onClick={() => setAppModal({})}>+ New application</button></div>
        <ApplicationsTable rows={apps} hideApplicant onEdit={(r) => setAppModal({ row: r })} onChanged={loadApps} />
      </div>
      {pwOpen && <PasswordModal mode="reset" path={`/applicants/${id}/password`} subject={`${a.firstName} ${a.lastName ?? ''}`} minLength={8} onClose={() => setPwOpen(false)} />}
      {appModal && <ApplicationModal row={appModal.row} applicantId={id} onClose={() => setAppModal(null)} onSaved={loadApps} />}
    </>
  );
}
