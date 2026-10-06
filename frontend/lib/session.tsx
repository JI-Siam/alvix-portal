'use client';
import { createContext, useCallback, useContext, useState } from 'react';
import { RiCheckboxCircleLine, RiErrorWarningLine } from 'react-icons/ri';

export type Me = { sub: string; role: 'SUPER_ADMIN' | 'ADMIN' | 'APPLICANT' };
type Ctx = { me: Me | null; isSuper: boolean; toast: (msg: string, kind?: 'ok' | 'err') => void };
const SessionCtx = createContext<Ctx>({ me: null, isSuper: false, toast: () => {} });
export const useSession = () => useContext(SessionCtx);

export function SessionProvider({ me, children }: { me: Me | null; children: React.ReactNode }) {
  const [toasts, setToasts] = useState<{ id: number; msg: string; kind: string }[]>([]);

  const toast = useCallback((msg: string, kind: 'ok' | 'err' = 'ok') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, msg, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), kind === 'err' ? 6000 : 3000);
  }, []);

  return (
    <SessionCtx.Provider value={{ me, isSuper: me?.role === 'SUPER_ADMIN', toast }}>
      {children}
      <div className="toasts">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`toast ${t.kind}`}
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            {t.kind === 'err' ? <RiErrorWarningLine size={16} /> : <RiCheckboxCircleLine size={16} />}
            {t.msg}
          </div>
        ))}
      </div>
    </SessionCtx.Provider>
  );
}
