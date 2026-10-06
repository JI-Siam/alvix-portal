'use client';
import ResourceCrud from '@/components/ResourceCrud';
import { AREA_FIELDS } from '@/lib/fields';

export default function Page() {
  return <ResourceCrud title="Areas" singular="Area" sub="Cities / regions where universities are located" path="/areas" fields={AREA_FIELDS}
    columns={[{ label: 'Name', render: (r) => <b>{r.name}</b> }, { label: 'Province', render: (r) => r.province ?? '—' }, { label: 'Country', render: (r) => r.country }]} />;
}
