'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  RiDashboardLine,
  RiUser3Line,
  RiFileList3Line,
  RiBuildingLine,
  RiGraduationCapLine,
  RiBookOpenLine,
  RiCalendarEventLine,
  RiMapPinLine,
  RiShieldUserLine,
  RiKeyLine,
  RiLogoutBoxRLine,
  RiMenuLine,
  RiCloseLine,
} from 'react-icons/ri';
import { api, post } from '@/lib/api';
import { Me, SessionProvider } from '@/lib/session';
import PasswordModal from './PasswordModal';

const LINKS: { href: string; label: string; icon: React.ReactNode; superOnly?: boolean }[] = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: <RiDashboardLine size={17} /> },
  { href: '/admin/applicants', label: 'Applicants', icon: <RiUser3Line size={17} /> },
  { href: '/admin/applications', label: 'Applications', icon: <RiFileList3Line size={17} /> },
  { href: '/admin/universities', label: 'Universities', icon: <RiBuildingLine size={17} /> },
  { href: '/admin/programs', label: 'Programs', icon: <RiGraduationCapLine size={17} /> },
  { href: '/admin/majors', label: 'Majors', icon: <RiBookOpenLine size={17} /> },
  { href: '/admin/intakes', label: 'Intakes', icon: <RiCalendarEventLine size={17} /> },
  { href: '/admin/areas', label: 'Areas', icon: <RiMapPinLine size={17} /> },
  { href: '/admin/users', label: 'Users', icon: <RiShieldUserLine size={17} />, superOnly: true },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const path = usePathname();
  const [me, setMe] = useState<Me | null>(null);
  const [pwOpen, setPwOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    api('/auth/me')
      .then((m: Me) => (m.role === 'APPLICANT' ? router.replace('/applicant/dashboard') : setMe(m)))
      .catch(() => router.replace('/admin-login'));
  }, [router]);

  if (!me)
    return (
      <div className="boot">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            border: '3px solid #e2e8f0',
            borderTopColor: '#2563eb',
            animation: 'spin 0.7s linear infinite',
          }} />
          <span>Loading…</span>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );

  const initials = (me as any).name
    ? (me as any).name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
    : me.role.slice(0, 2).toUpperCase();

  const Sidebar = () => (
    <aside>
      {/* Brand */}
      <div className="brand">
        <img
          src="/logo.jpg"
          alt="Alvix logo"
          style={{ width: 34, height: 34, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }}
        />
        <div>
          <span>Alvix</span>
          <div style={{ fontSize: 10, color: '#475569', fontWeight: 500, marginTop: -2, WebkitTextFillColor: '#475569' }}>Education Portal</div>
        </div>
      </div>

      {/* Nav section */}
      <div className="nav-section">Navigation</div>
      {LINKS.filter((l) => !l.superOnly || me.role === 'SUPER_ADMIN').map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className={path.startsWith(l.href) ? 'active' : ''}
          onClick={() => setMobileOpen(false)}
        >
          {l.icon}
          {l.label}
        </Link>
      ))}

      <span className="grow" />

      {/* User card */}
      <div className="user-card">
        <div className="user-avatar">{initials}</div>
        <div style={{ minWidth: 0 }}>
          <div style={{ color: '#e2e8f0', fontWeight: 600, fontSize: 12.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {me.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}
          </div>
          <div style={{ color: '#475569', fontSize: 11 }}>{(me as any).email || ''}</div>
        </div>
      </div>

      <a
        href="#"
        onClick={(e) => { e.preventDefault(); setPwOpen(true); }}
        style={{ marginTop: 2 }}
      >
        <RiKeyLine size={16} />
        Change password
      </a>
      <a
        href="#"
        onClick={async (e) => {
          e.preventDefault();
          await post('/auth/logout');
          router.push('/admin-login');
        }}
      >
        <RiLogoutBoxRLine size={16} />
        Log out
      </a>
    </aside>
  );

  return (
    <SessionProvider me={me}>
      <div className="shell">
        <Sidebar />

        {/* Mobile overlay */}
        {mobileOpen && (
          <div
            style={{
              position: 'fixed', inset: 0, zIndex: 40,
              background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)',
            }}
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Mobile sidebar */}
        {mobileOpen && (
          <div style={{
            position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 50,
            width: 240,
          }}>
            <Sidebar />
          </div>
        )}

        <main>
          {/* Mobile topbar */}
          <div style={{
            display: 'none',
            alignItems: 'center',
            gap: 12,
            padding: '12px 0 20px',
            borderBottom: '1px solid #e2e8f0',
            marginBottom: 20,
          }} className="mobile-topbar">
            <button className="icon" onClick={() => setMobileOpen(true)}>
              <RiMenuLine size={20} />
            </button>
            <span style={{ fontWeight: 700, fontSize: 15 }}>Alvix Portal</span>
          </div>

          {children}
        </main>
        {pwOpen && <PasswordModal mode="self" minLength={10} onClose={() => setPwOpen(false)} />}
      </div>
    </SessionProvider>
  );
}
