'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RiMailLine, RiLockPasswordLine, RiPassportLine, RiArrowRightLine, RiEyeLine, RiEyeOffLine } from 'react-icons/ri';
import { post } from '@/lib/api';

export default function LoginForm({ kind }: { kind: 'admin' | 'applicant' }) {
  const router = useRouter();
  const [a, setA] = useState('');
  const [pw, setPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      await post(
        `/auth/${kind}/login`,
        kind === 'admin' ? { email: a, password: pw } : { passportNumber: a, password: pw }
      );
      router.push(kind === 'admin' ? '/admin/dashboard' : '/applicant/dashboard');
    } catch {
      setErr('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0e1630 0%, #14213d 50%, #1a2d52 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      {/* Background decoration */}
      <div style={{
        position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none',
      }}>
        <div style={{
          position: 'absolute', top: '-20%', right: '-10%',
          width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-10%', left: '-5%',
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)',
        }} />
      </div>

      <div style={{
        width: '100%', maxWidth: 420,
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 20,
        padding: '36px 32px',
        boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
        position: 'relative',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <img
            src="/logo.jpg"
            alt="Alvix logo"
            style={{
              width: 56, height: 56, borderRadius: 16,
              objectFit: 'cover', margin: '0 auto 14px', display: 'block',
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            }}
          />
          <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
            Alvix Education
          </h1>
          <p style={{ color: '#64748b', fontSize: 13.5, margin: '4px 0 0' }}>
            {kind === 'admin' ? 'Admin Portal' : 'Applicant Portal'}
          </p>
        </div>

        <form onSubmit={submit}>
          {/* Identifier field */}
          <div style={{ marginBottom: 14 }}>
            <label style={{
              display: 'block', fontSize: 12, fontWeight: 600,
              color: '#94a3b8', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em',
            }}>
              {kind === 'admin' ? 'Email address' : 'Passport number'}
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                color: '#64748b',
              }}>
                {kind === 'admin' ? <RiMailLine size={16} /> : <RiPassportLine size={16} />}
              </div>
              <input
                type={kind === 'admin' ? 'email' : 'text'}
                className={kind === 'admin' ? '' : 'upper'}
                value={a}
                onChange={(e) => setA(e.target.value)}
                required
                autoComplete={kind === 'admin' ? 'email' : 'off'}
                placeholder={kind === 'admin' ? 'admin@example.com' : 'Passport number'}
                style={{
                  width: '100%', paddingLeft: 38,
                  background: 'rgba(255,255,255,0.07)',
                  border: '1.5px solid rgba(255,255,255,0.1)',
                  color: '#fff', borderRadius: 10,
                }}
              />
            </div>
          </div>

          {/* Password field */}
          <div style={{ marginBottom: 20 }}>
            <label style={{
              display: 'block', fontSize: 12, fontWeight: 600,
              color: '#94a3b8', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em',
            }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                color: '#64748b',
              }}>
                <RiLockPasswordLine size={16} />
              </div>
              <input
                type={showPw ? 'text' : 'password'}
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                style={{
                  width: '100%', paddingLeft: 38, paddingRight: 40,
                  background: 'rgba(255,255,255,0.07)',
                  border: '1.5px solid rgba(255,255,255,0.1)',
                  color: '#fff', borderRadius: 10,
                }}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                style={{
                  position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#64748b', padding: 2, display: 'flex', alignItems: 'center',
                }}
                aria-label={showPw ? 'Hide password' : 'Show password'}
              >
                {showPw ? <RiEyeOffLine size={16} /> : <RiEyeLine size={16} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {err && (
            <div style={{
              background: 'rgba(220,38,38,0.15)',
              border: '1px solid rgba(239,68,68,0.4)',
              borderRadius: 8, padding: '10px 12px',
              color: '#fca5a5', fontSize: 13, marginBottom: 16,
            }}>
              {err}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: loading ? '#334155' : 'linear-gradient(135deg, #2563eb, #7c3aed)',
              border: 'none',
              color: '#fff',
              fontWeight: 700,
              fontSize: 14.5,
              padding: '12px 20px',
              borderRadius: 10,
              cursor: loading ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'all 0.2s',
              boxShadow: loading ? 'none' : '0 4px 14px rgba(37,99,235,0.4)',
            }}
          >
            {loading ? 'Signing in…' : (
              <>Sign in <RiArrowRightLine size={17} /></>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
