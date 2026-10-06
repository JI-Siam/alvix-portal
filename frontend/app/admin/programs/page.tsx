'use client';
import ResourceCrud from '@/components/ResourceCrud';
import { PROGRAM_FIELDS } from '@/lib/fields';

export default function Page() {
  return <ResourceCrud title="Programs" singular="Program" sub="Visa / education programs" path="/programs" fields={PROGRAM_FIELDS}
    columns={[{ label: 'Name', render: (r) => <b>{r.name}</b> }, { label: 'Visa type', render: (r) => r.visaType ?? '—' },
      { label: 'Duration', render: (r) => r.duration ?? '—' }, { label: 'Description', render: (r) => r.description ?? '—' }]} />;
}
