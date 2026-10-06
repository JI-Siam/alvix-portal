'use client';
import { useEffect, useState } from 'react';
import ResourceCrud from '@/components/ResourceCrud';
import { Field } from '@/components/EntityForm';
import { api } from '@/lib/api';

export default function Page() {
  const [areas, setAreas] = useState<any[] | null>(null); const [programs, setPrograms] = useState<any[]>([]);
  useEffect(() => {
    api('/areas?limit=500').then((r) => setAreas(r.items)); api('/programs?limit=500').then((r) => setPrograms(r.items));
  }, []);
  if (!areas) return <p className="muted">Loading…</p>;
  const fields: Field[] = [
    { key: 'name', label: 'Name', required: true },
    { key: 'areaId', label: 'Area', type: 'select', required: true, options: areas.filter((a) => a.isActive).map((a) => ({ value: a.id, label: a.name })) },
    { key: 'website', label: 'Website', noUpper: true, hint: 'Kept as typed (links are case-sensitive)' }, { key: 'description', label: 'Description', type: 'textarea' },
    { key: 'programIds', label: 'Programs offered', type: 'multiselect', options: programs.filter((p) => p.isActive).map((p) => ({ value: p.id, label: p.name })) },
    { key: 'isActive', label: 'Active', type: 'checkbox', only: 'edit' },
  ];
  return <ResourceCrud title="Universities" singular="University" sub="Each university offers a set of programs" path="/universities" fields={fields} wide
    toForm={(r) => ({ name: r.name, areaId: r.areaId, website: r.website ?? '', description: r.description ?? '', isActive: r.isActive, programIds: (r.programs ?? []).map((p: any) => p.id) })}
    columns={[
      { label: 'Name', render: (r) => <b>{r.name}</b> }, { label: 'Area', render: (r) => r.area?.name ?? '—' },
      { label: 'Programs', render: (r) => <div className="chips">{(r.programs ?? []).map((p: any) => <span key={p.id} className="badge">{p.name}</span>)}</div> },
      { label: 'Website', render: (r) => (r.website ? <a href={r.website.startsWith('http') ? r.website : `https://${r.website}`} target="_blank" rel="noreferrer">Visit ↗</a> : '—') },
    ]} />;
}
