'use client';
import { useState } from 'react';
import { RiLockPasswordLine, RiEyeLine, RiEyeOffLine } from 'react-icons/ri';
import { patch, post } from '@/lib/api';
import { useSession } from '@/lib/session';
import { Modal } from './ui';

/**
 * mode "self":  user changes their own password and must enter the current one.
 * mode "reset": an admin sets someone else's password directly (no old password needed).
 */
export default function PasswordModal({
  mode,
  path,
  subject,
  minLength,
  onClose,
}: {
  mode: 'self' | 'reset';
  path?: string;
  subject?: string;
  minLength: number;
  onClose: () => void;
}) {
  const { toast } = useSession();
  const [cur, setCur] = useState('');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [err, setErr] = useState('');
  const [saving, setSaving] = useState(false);

  // Each field has its own independent visibility toggle
  const [showCur, setShowCur] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    if (pw.length < minLength) return setErr(`New password must be at least ${minLength} characters`);
    if (pw !== pw2) return setErr('The two new passwords do not match');
    setSaving(true);
    try {
      if (mode === 'self') await post('/auth/change-password', { currentPassword: cur, newPassword: pw });
      else await patch(path!, { newPassword: pw });
      toast(mode === 'self' ? 'Password changed' : `Password updated${subject ? ` for ${subject}` : ''}`);
      onClose();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  }

  // Inline helper — NOT a component, just a function returning JSX.
  // Defining PasswordInput as a component *inside* the render causes React to
  // unmount + remount it on every parent re-render, destroying focus mid-typing.
  function pwField(opts: {
    label: string;
    value: string;
    onChange: React.Dispatch<React.SetStateAction<string>>;
    autoComplete: string;
    show: boolean;
    toggle: () => void;
    id: string;
  }) {
    return (
      <div className="field">
        <span className="lbl">{opts.label}</span>
        <div style={{ position: 'relative' }}>
          <div style={{
            position: 'absolute', left: 10, top: '50%',
            transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none',
          }}>
            <RiLockPasswordLine size={15} />
          </div>
          <input
            id={opts.id}
            type={opts.show ? 'text' : 'password'}
            autoComplete={opts.autoComplete}
            required
            value={opts.value}
            onChange={(e) => opts.onChange(e.target.value)}
            style={{ paddingLeft: 32, paddingRight: 40, width: '100%' }}
          />
          <button
            type="button"
            className="icon"
            onClick={opts.toggle}
            aria-label={opts.show ? 'Hide password' : 'Show password'}
            style={{
              position: 'absolute', right: 6, top: '50%',
              transform: 'translateY(-50%)',
            }}
          >
            {opts.show ? <RiEyeOffLine size={15} /> : <RiEyeLine size={15} />}
          </button>
        </div>
      </div>
    );
  }

  return (
    <Modal
      title={
        mode === 'self'
          ? 'Change your password'
          : `Set new password${subject ? ` — ${subject}` : ''}`
      }
      onClose={onClose}
    >
      <form onSubmit={submit} className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
        {mode === 'self' && pwField({
          label: 'Current password *',
          value: cur,
          onChange: setCur,
          autoComplete: 'current-password',
          show: showCur,
          toggle: () => setShowCur((v) => !v),
          id: 'pw-current',
        })}

        {pwField({
          label: `New password * (min ${minLength} characters)`,
          value: pw,
          onChange: setPw,
          autoComplete: 'new-password',
          show: showPw,
          toggle: () => setShowPw((v) => !v),
          id: 'pw-new',
        })}

        {pwField({
          label: 'Confirm new password *',
          value: pw2,
          onChange: setPw2,
          autoComplete: 'new-password',
          show: showPw2,
          toggle: () => setShowPw2((v) => !v),
          id: 'pw-confirm',
        })}

        {/* Strength hint */}
        {pw.length > 0 && pw.length < minLength && (
          <p style={{ margin: 0, fontSize: 12, color: '#d97706' }}>
            🔑 {minLength - pw.length} more character{minLength - pw.length !== 1 ? 's' : ''} needed
          </p>
        )}

        {mode === 'reset' && (
          <p className="muted" style={{ fontSize: 12.5, margin: 0, background: '#f8fafc', borderRadius: 8, padding: '10px 12px', border: '1px solid #e2e8f0' }}>
            💡 No old password required. Share the new password with them securely.
          </p>
        )}

        {err && (
          <div className="err" style={{
            background: '#fef2f2', border: '1px solid #fca5a5',
            borderRadius: 8, padding: '10px 12px',
          }}>
            ⚠️ {err}
          </div>
        )}

        <div className="modal-foot">
          <button type="button" className="ghost" onClick={onClose}>Cancel</button>
          <button
            disabled={saving}
            style={{
              background: saving ? '#94a3b8' : 'linear-gradient(135deg, #14213d, #213868)',
              border: 'none',
            }}
          >
            {saving ? 'Saving…' : 'Update password'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
