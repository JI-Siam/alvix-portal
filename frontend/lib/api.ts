export async function api<T = any>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch('/api' + path, { credentials: 'include', headers: { 'Content-Type': 'application/json' }, ...init });
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(Array.isArray(e.message) ? e.message.join(', ') : e.message || res.statusText);
  }
  const text = await res.text();
  return (text ? JSON.parse(text) : null) as T;
}
export const post = (p: string, body: unknown = {}) => api(p, { method: 'POST', body: JSON.stringify(body) });
export const patch = (p: string, body: unknown) => api(p, { method: 'PATCH', body: JSON.stringify(body) });
export const del = (p: string) => api(p, { method: 'DELETE' });

export const STATUSES = ['PENDING', 'DOCUMENTS_COLLECTED', 'SUBMITTED', 'OFFER_RECEIVED', 'VISA_PROCESSING', 'VISA_APPROVED', 'REJECTED', 'CANCELLED'];
export const DOC_STATUSES = ['PENDING', 'RECEIVED', 'VERIFIED', 'REJECTED'];
export const STANDARD_DOCS = [
  'PASSPORT COPY', 'PASSPORT PHOTO', 'APPLICATION FORM', 'ACADEMIC CERTIFICATE', 'ACADEMIC TRANSCRIPT',
  'BANK STATEMENT', 'SPONSOR LETTER', 'LANGUAGE CERTIFICATE (TOPIK/IELTS)', 'STUDY PLAN', 'MEDICAL REPORT', 'POLICE CLEARANCE',
];
export const ORG_NAME = 'Alvix Education Consultancy Portal';
export const label = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()).replace(/\B\w+/g, (w) => w.toLowerCase());
export const money = (v: string | number | null | undefined) =>
  v == null || v === '' ? '—' : Number(v).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
export const today = () => new Date().toISOString().slice(0, 10);
