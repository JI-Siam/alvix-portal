'use client';
import ResourceCrud from '@/components/ResourceCrud';
import { MAJOR_FIELDS } from '@/lib/fields';

export default function Page() {
  return <ResourceCrud title="Majors" singular="Major" sub="Fields of study an applicant can choose" path="/majors" fields={MAJOR_FIELDS}
    columns={[{ label: 'Name', render: (r) => <b>{r.name}</b> }, { label: 'Description', render: (r) => r.description ?? '—' }]} />;
}
