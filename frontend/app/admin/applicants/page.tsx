'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ResourceCrud from '@/components/ResourceCrud';
import { APPLICANT_FIELDS } from '@/lib/fields';
import { money } from '@/lib/api';
import { ExcelButton } from '@/components/ui';

export default function Page() {
  const router = useRouter();
  return <ResourceCrud title="Applicants" singular="Applicant" sub="Open an applicant to manage profile, documents and applications"
    path="/applicants" fields={APPLICANT_FIELDS} wide hideEdit headerExtra={(q) => <ExcelButton path="/applicants/export" params={{ q }} />}
    extraActions={(r) => <a className="btn ghost" href={`/api/reports/applicants/${r.id}/pdf`} target="_blank" rel="noreferrer">PDF</a>} rowHref={(r) => `/admin/applicants/${r.id}`}
    onCreated={(a) => router.push(`/admin/applicants/${a.id}`)}
    columns={[
      { label: 'Passport', render: (r) => <Link href={`/admin/applicants/${r.id}`}><b>{r.passportNumber}</b></Link> },
      { label: 'Name', render: (r) => `${r.firstName} ${r.lastName ?? ''}` }, { label: 'Phone', render: (r) => r.phone ?? '—' },
      { label: 'Sponsor', render: (r) => r.sponsor ?? '—' }, { label: 'Fund (USD)', render: (r) => money(r.fundUsd) },
      { label: 'Bank maturity', render: (r) => r.bankMaturity ?? '—' },
    ]} />;
}
