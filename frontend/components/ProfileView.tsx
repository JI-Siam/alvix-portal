import { money } from '@/lib/api';
import { APPLICANT_FIELDS } from '@/lib/fields';

/** Read-only applicant profile, grouped like the edit form. Used by the admin details page and the applicant portal. */
export default function ProfileView({ a }: { a: any }) {
  const groups: { title: string; items: [string, string][] }[] = [];
  for (const f of APPLICANT_FIELDS) {
    if (f.type === 'section') { groups.push({ title: f.label, items: [] }); continue; }
    if (f.key === 'password') continue;
    groups[groups.length - 1].items.push([f.label, f.key === 'fundUsd' ? money(a[f.key]) : a[f.key] || '—']);
  }
  return (<>{groups.map((g) => (
    <div key={g.title} style={{ marginBottom: 14 }}>
      <h4 className="section" style={{ margin: '0 0 8px' }}>{g.title}</h4>
      <div className="kv">{g.items.map(([k, v]) => <div key={k}><span>{k}</span><b>{v}</b></div>)}</div>
    </div>))}</>);
}
