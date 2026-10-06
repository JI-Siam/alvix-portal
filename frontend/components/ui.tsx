'use client';
import { useEffect } from 'react';
import { RiCloseLine, RiPrinterLine, RiDownloadLine, RiFileExcelLine } from 'react-icons/ri';
import { label } from '@/lib/api';

export function Modal({ title, onClose, wide, children }: {
  title: string;
  onClose: () => void;
  wide?: boolean;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal ${wide ? 'wide' : ''}`}>
        <div className="modal-head">
          <h3>{title}</h3>
          <button
            className="icon"
            onClick={onClose}
            aria-label="Close"
            style={{
              width: 32, height: 32, borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: '#f1f5f9', color: '#64748b',
            }}
          >
            <RiCloseLine size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Badge({ value }: { value: string }) {
  return <span className={`badge b-${value.toLowerCase()}`}>{label(value)}</span>;
}

export function Pagination({ page, total, limit, onPage }: {
  page: number;
  total: number;
  limit: number;
  onPage: (p: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(total / limit));
  return (
    <div className="pager">
      <span style={{ fontWeight: 500 }}>
        {total} record{total === 1 ? '' : 's'}
      </span>
      <span className="sp" />
      <button
        className="ghost"
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
        style={{ padding: '5px 14px' }}
      >
        ‹ Prev
      </button>
      <span style={{
        padding: '4px 12px',
        background: '#f8fafc',
        borderRadius: 6,
        border: '1px solid #e2e8f0',
        fontWeight: 600,
        fontSize: 13,
      }}>
        {page} / {pages}
      </span>
      <button
        className="ghost"
        disabled={page >= pages}
        onClick={() => onPage(page + 1)}
        style={{ padding: '5px 14px' }}
      >
        Next ›
      </button>
    </div>
  );
}

export function PageHead({ title, sub, children }: {
  title: string;
  sub?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="page-head">
      <div>
        <h1>{title}</h1>
        {sub && <p className="muted">{sub}</p>}
      </div>
      <div className="actions">{children}</div>
    </div>
  );
}

/** View/print the PDF inline in a new tab, or download it. Auth uses the session cookie. */
export function PdfButtons({ path }: { path: string }) {
  return (
    <>
      <a
        className="btn ghost"
        href={`/api${path}`}
        target="_blank"
        rel="noreferrer"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
      >
        <RiPrinterLine size={15} /> Print
      </a>
      <a
        className="btn ghost"
        href={`/api${path}?download=1`}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
      >
        <RiDownloadLine size={15} /> PDF
      </a>
    </>
  );
}

export function ExcelButton({ path, params }: { path: string; params?: Record<string, string> }) {
  const qs = new URLSearchParams(Object.entries(params ?? {}).filter(([, v]) => v)).toString();
  return (
    <a
      className="btn ghost"
      href={`/api${path}${qs ? `?${qs}` : ''}`}
      download
      style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
    >
      <RiFileExcelLine size={15} /> Excel
    </a>
  );
}
