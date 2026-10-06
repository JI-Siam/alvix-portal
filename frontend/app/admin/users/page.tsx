'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import PasswordModal from '@/components/PasswordModal';
import ResourceCrud from '@/components/ResourceCrud';
import { Field } from '@/components/EntityForm';
import { Badge } from '@/components/ui';
import { useSession } from '@/lib/session';

const FIELDS: Field[] = [
  { key: 'name', label: 'Full name', required: true },
  { key: 'email', label: 'Email', type: 'email', required: true, only: 'create' },
  { key: 'password', label: 'Password', type: 'password', required: true, only: 'create', hint: 'Min 10 characters' },
  { key: 'role', label: 'Role', type: 'select', required: true, options: [{ value: 'ADMIN', label: 'Admin' }, { value: 'SUPER_ADMIN', label: 'Super admin' }] },
  { key: 'isActive', label: 'Active', type: 'checkbox', only: 'edit' },
];

export default function Page() {
  const { me, isSuper } = useSession(); const router = useRouter();
  useEffect(() => { if (me && !isSuper) router.replace('/admin/dashboard'); }, [me, isSuper, router]);
  const [target, setTarget] = useState<any>(null);
  if (!isSuper) return null;
  return (<><ResourceCrud extraActions={(r) => <button className="ghost" onClick={() => setTarget(r)}>Set password</button>}  title="Users" singular="User" sub="Admin and super admin accounts" path="/users" fields={FIELDS}
    canDelete={(r, myId) => r.id !== myId}
    columns={[{ label: 'Name', render: (r) => <b>{r.name}</b> }, { label: 'Email', render: (r) => r.email }, { label: 'Role', render: (r) => <Badge value={r.role} /> }]} />
    {target && <PasswordModal mode="reset" path={`/users/${target.id}/password`} subject={target.name} minLength={10} onClose={() => setTarget(null)} />}</>);
}
