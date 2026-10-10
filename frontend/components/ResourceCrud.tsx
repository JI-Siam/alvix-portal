'use client';
import Link from 'next/link';
import { ReactNode, useCallback, useEffect, useState } from 'react';
import { RiAddLine, RiSearchLine } from 'react-icons/ri';
import { api, del, patch, post } from '@/lib/api';
import { useSession } from '@/lib/session';
import EntityForm, { buildPayload, Field, initialForm } from './EntityForm';
import { Modal, PageHead, Pagination } from './ui';

export type Column = { label: string; render: (row: any) => ReactNode };

/** Generic list + create + edit + delete screen used by every master-data entity. */
export default function ResourceCrud(props: {
  title: string; singular: string; sub?: string; path: string; fields: Field[]; columns: Column[];
  searchable?: boolean; wide?: boolean; hideEdit?: boolean; rowHref?: (r: any) => string;
  headerExtra?: (q: string) => ReactNode; extraActions?: (row: any) => ReactNode;
  toForm?: (row: any) => Record<string, any>; onCreated?: (row: any) => void; canDelete?: (row: any, myId?: string) => boolean;
}) {
  const { title, singular, path, fields, columns } = props;
  const { me, isSuper, toast } = useSession();
  const [rows, setRows] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ mode: 'create' | 'edit'; row?: any } | null>(null);
  const [form, setForm] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const limit = 15;
  const hasActive = fields.some((f) => f.key === 'isActive');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api(`${path}?page=${page}&limit=${limit}${q ? `&q=${encodeURIComponent(q)}` : ''}`);
      setRows(r.items);
      setTotal(r.total);
    } catch (e: any) {
      toast(e.message, 'err');
    } finally {
      setLoading(false);
    }
  }, [path, page, q, toast]);

  useEffect(() => {
    const t = setTimeout(load, q ? 250 : 0);
    return () => clearTimeout(t);
  }, [load, q]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get('create') === 'true') {
        open('create');
        window.history.replaceState(null, '', window.location.pathname);
      }
    }
  }, []);

  const open = (mode: 'create' | 'edit', row?: any) => {
    setErr('');
    setModal({ mode, row });
    setForm(row && props.toForm ? props.toForm(row) : initialForm(fields, row ?? null, mode));
  };

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!modal) return;
    setSaving(true);
    setErr('');
    try {
      const body = buildPayload(fields, form, modal.mode);
      const saved =
        modal.mode === 'create'
          ? await post(path, body)
          : await patch(`${path}/${modal.row.id}`, body);
      toast(`${singular} ${modal.mode === 'create' ? 'created' : 'updated'}`);
      setModal(null);
      if (modal.mode === 'create' && props.onCreated) props.onCreated(saved);
      else load();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(row: any) {
    if (!confirm(`Delete this ${singular.toLowerCase()}? This cannot be undone.`)) return;
    try {
      await del(`${path}/${row.id}`);
      toast(`${singular} deleted`);
      if (rows.length === 1 && page > 1) setPage(page - 1);
      else load();
    } catch (e: any) {
      toast(e.message, 'err');
    }
  }

  async function toggle(row: any) {
    try {
      await patch(`${path}/${row.id}`, { isActive: !row.isActive });
      load();
    } catch (e: any) {
      toast(e.message, 'err');
    }
  }

  return (
    <>
      <PageHead title={title} sub={props.sub}>
        {props.headerExtra?.(q)}
        <button
          onClick={() => open('create')}
          style={{
            background: 'linear-gradient(135deg, #14213d, #213868)',
            border: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <RiAddLine size={16} /> New {singular.toLowerCase()}
        </button>
      </PageHead>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {props.searchable !== false && (
          <div style={{
            padding: '14px 18px',
            borderBottom: '1px solid #f1f5f9',
            background: '#fafbfc',
          }}>
            <div style={{ position: 'relative', maxWidth: 360 }}>
              <div style={{
                position: 'absolute', left: 10, top: '50%',
                transform: 'translateY(-50%)', color: '#94a3b8',
              }}>
                <RiSearchLine size={16} />
              </div>
              <input
                style={{ paddingLeft: 34 }}
                placeholder={`Search ${title.toLowerCase()}…`}
                value={q}
                onChange={(e) => { setQ(e.target.value); setPage(1); }}
              />
            </div>
          </div>
        )}

        <div className="table-wrap" style={{ border: 'none', borderRadius: 0 }}>
          <table>
            <thead>
              <tr>
                {columns.map((c) => <th key={c.label}>{c.label}</th>)}
                {hasActive && <th>Status</th>}
                <th className="r">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={columns.length + 2} style={{ textAlign: 'center', padding: '28px 0', color: '#94a3b8' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      <div style={{
                        width: 16, height: 16, borderRadius: '50%',
                        border: '2px solid #e2e8f0',
                        borderTopColor: '#2563eb',
                        animation: 'spin 0.7s linear infinite',
                      }} />
                      Loading…
                    </div>
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                  </td>
                </tr>
              )}
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={columns.length + 2} style={{ textAlign: 'center', padding: '32px 0', color: '#94a3b8' }}>
                    No records found.
                  </td>
                </tr>
              )}
              {!loading && rows.map((r) => (
                <tr key={r.id}>
                  {columns.map((c) => <td key={c.label}>{c.render(r)}</td>)}
                  {hasActive && (
                    <td>
                      <button
                        className={`pill ${r.isActive ? 'on' : 'off'}`}
                        onClick={() => toggle(r)}
                        title="Click to toggle"
                      >
                        {r.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                  )}
                  <td className="r nowrap">
                    {props.extraActions?.(r)}
                    {props.rowHref && (
                      <Link className="btn ghost" href={props.rowHref(r)} style={{ fontSize: 12.5, padding: '5px 12px' }}>
                        View
                      </Link>
                    )}
                    {!props.hideEdit && (
                      <button className="ghost" onClick={() => open('edit', r)} style={{ fontSize: 12.5, padding: '5px 12px' }}>
                        Edit
                      </button>
                    )}
                    {isSuper && (props.canDelete ? props.canDelete(r, me?.sub) : true) && (
                      <button className="danger" onClick={() => remove(r)} style={{ fontSize: 12.5, padding: '5px 12px' }}>
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ padding: '0 18px 14px' }}>
          <Pagination page={page} total={total} limit={limit} onPage={setPage} />
        </div>
      </div>

      {modal && (
        <Modal
          title={`${modal.mode === 'create' ? 'New' : 'Edit'} ${singular.toLowerCase()}`}
          wide={props.wide}
          onClose={() => setModal(null)}
        >
          <form onSubmit={save}>
            <EntityForm fields={fields} form={form} setForm={setForm} mode={modal.mode} />
            {err && <div className="err">⚠️ {err}</div>}
            <div className="modal-foot">
              <button type="button" className="ghost" onClick={() => setModal(null)}>Cancel</button>
              <button disabled={saving} style={{
                background: saving ? '#94a3b8' : 'linear-gradient(135deg, #14213d, #213868)',
                border: 'none',
              }}>
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
