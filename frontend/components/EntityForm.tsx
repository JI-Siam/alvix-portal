'use client';

export type Opt = { value: string; label: string };
export type Field = {
  key: string; label: string;
  type?: 'text' | 'textarea' | 'select' | 'multiselect' | 'password' | 'date' | 'number' | 'email' | 'checkbox' | 'section';
  options?: Opt[]; required?: boolean; noUpper?: boolean; only?: 'create' | 'edit'; hint?: string; wide?: boolean;
};

const visible = (f: Field, mode: 'create' | 'edit') => !f.only || f.only === mode;

export function initialForm(fields: Field[], row: any | null, mode: 'create' | 'edit') {
  const out: Record<string, any> = {};
  for (const f of fields) {
    if (f.type === 'section' || !visible(f, mode)) continue;
    const v = row?.[f.key];
    out[f.key] = f.type === 'checkbox' ? (row ? !!v : true) : f.type === 'multiselect' ? v ?? [] : v ?? '';
  }
  return out;
}

/** Create: omit empty values. Edit: empty optional values become null so they can be cleared. */
export function buildPayload(fields: Field[], form: Record<string, any>, mode: 'create' | 'edit') {
  const out: Record<string, any> = {};
  for (const f of fields) {
    if (f.type === 'section' || !visible(f, mode)) continue;
    let v = form[f.key];
    if (f.type === 'checkbox' || f.type === 'multiselect') { out[f.key] = v; continue; }
    if (v === '' || v == null) {
      if (mode === 'edit' && !f.required && f.type !== 'password') out[f.key] = null;
      continue;
    }
    out[f.key] = f.type === 'number' ? Number(v) : v;
  }
  return out;
}

export default function EntityForm({ fields, form, setForm, mode }: {
  fields: Field[]; form: Record<string, any>; setForm: (f: Record<string, any>) => void; mode: 'create' | 'edit';
}) {
  const set = (k: string, v: any) => setForm({ ...form, [k]: v });
  return (
    <div className="form-grid">
      {fields.filter((f) => visible(f, mode)).map((f) => {
        const k = `${f.key}-${f.only ?? ''}`;
        if (f.type === 'section') return <h4 key={k} className="section">{f.label}</h4>;
        const req = f.required;
        if (f.type === 'checkbox')
          return <label key={k} className="check"><input type="checkbox" checked={!!form[f.key]} onChange={(e) => set(f.key, e.target.checked)} /> {f.label}</label>;
        if (f.type === 'multiselect')
          return (
            <div key={k} className="field full"><span className="lbl">{f.label}</span>
              <div className="multi">{(f.options ?? []).length === 0 && <em className="muted">Nothing available yet</em>}
                {(f.options ?? []).map((o) => (
                  <label key={o.value} className="check">
                    <input type="checkbox" checked={(form[f.key] ?? []).includes(o.value)}
                      onChange={(e) => set(f.key, e.target.checked ? [...(form[f.key] ?? []), o.value] : (form[f.key] ?? []).filter((x: string) => x !== o.value))} /> {o.label}
                  </label>))}
              </div>
            </div>);
        return (
          <label key={k} className={`field ${f.type === 'textarea' || f.wide ? 'full' : ''}`}><span className="lbl">{f.label}{req && ' *'}</span>
            {f.type === 'textarea' ? <textarea className="upper" rows={3} value={form[f.key] ?? ''} onChange={(e) => set(f.key, e.target.value)} required={req} />
              : f.type === 'select' ? (
                <select value={form[f.key] ?? ''} onChange={(e) => set(f.key, e.target.value)} required={req}>
                  <option value="">{req ? 'Select…' : '— none —'}</option>
                  {(f.options ?? []).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>)
              : <input className={!f.noUpper && (f.type ?? 'text') === 'text' ? 'upper' : ''} type={f.type ?? 'text'} value={form[f.key] ?? ''} required={req} step={f.type === 'number' ? '0.01' : undefined}
                  min={f.type === 'number' ? 0 : undefined} autoComplete={f.type === 'password' ? 'new-password' : undefined}
                  onChange={(e) => set(f.key, e.target.value)} />}
            {f.hint && <small className="muted">{f.hint}</small>}
          </label>);
      })}
    </div>
  );
}
