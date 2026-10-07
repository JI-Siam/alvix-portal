'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { RiKeyLine, RiLogoutBoxRLine, RiGraduationCapLine, RiMenuLine } from 'react-icons/ri';
import { api, post } from '@/lib/api';
import { Me, SessionProvider } from '@/lib/session';
import PasswordModal from './PasswordModal';

export default function ApplicantShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [pw, setPw] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    api('/auth/me')
      .then((m: Me) => (m.role !== 'APPLICANT' ? router.replace('/admin/dashboard') : setMe(m)))
      .catch(() => router.replace('/applicant-login'));
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

  return (
    <SessionProvider me={me}>
      {/* Mobile topbar */}
      <div style={{
        alignItems: 'center',
        gap: 12,
        padding: '12px 20px',
        background: 'linear-gradient(135deg, #0e1630, #14213d)',
        color: '#fff',
      }} className="mobile-topbar">
        <button className="icon" style={{ color: '#fff' }} onClick={() => setMobileOpen(true)}>
          <RiMenuLine size={20} />
        </button>
        <span style={{ fontWeight: 700, fontSize: 15 }}>Applicant Portal</span>
      </div>

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

      {/* Navigation Menu */}
      <nav className={mobileOpen ? 'open' : ''}>
        <div className="nav-brand" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img
            src="/logo.jpg"
            alt="Alvix logo"
            style={{ width: 34, height: 34, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }}
          />
          <strong style={{ color: '#fff', fontSize: 15, letterSpacing: '-0.01em' }}>
            ALVIX Applicant Portal
          </strong>
        </div>
        <span className="sp" />
        <a
          href="#"
          onClick={(e) => { e.preventDefault(); setPw(true); setMobileOpen(false); }}
          style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13.5 }}
        >
          <RiKeyLine size={15} /> Change password
        </a>
        <a
          href="#"
          onClick={async (e) => {
            e.preventDefault();
            await post('/auth/logout');
            router.push('/applicant-login');
          }}
          style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13.5 }}
        >
          <RiLogoutBoxRLine size={15} /> Log out
        </a>
      </nav>
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 24px' }}>
        {children}
      </main>
      {pw && <PasswordModal mode="self" minLength={8} onClose={() => setPw(false)} />}
    </SessionProvider>
  );
}
