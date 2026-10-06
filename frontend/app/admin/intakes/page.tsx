'use client';
import ResourceCrud from '@/components/ResourceCrud';
import { INTAKE_FIELDS } from '@/lib/fields';

export default function Page() {
  return <ResourceCrud title="Intakes" singular="Intake" sub="Admission intakes applications can be mapped to (e.g. SEPTEMBER-2026)" path="/intakes" fields={INTAKE_FIELDS}
    columns={[{ label: 'Name', render: (r) => <b>{r.name}</b> }, { label: 'Description', render: (r) => r.description ?? '—' }]} />;
}
