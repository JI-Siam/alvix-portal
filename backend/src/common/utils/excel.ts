import ExcelJS from 'exceljs';

export const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
export type Col = { header: string; key: string; width?: number; numFmt?: string };

export async function toXlsx(sheet: string, cols: Col[], rows: Record<string, any>[]): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Alvix Education Consultancy'; wb.created = new Date();
  const ws = wb.addWorksheet(sheet, { views: [{ state: 'frozen', ySplit: 1 }] });
  ws.columns = cols.map((c) => ({ header: c.header, key: c.key, width: c.width ?? 18, style: c.numFmt ? { numFmt: c.numFmt } : {} }));
  rows.forEach((r) => ws.addRow(r));
  const head = ws.getRow(1);
  head.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  head.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF14213D' } };
  head.alignment = { vertical: 'middle' };
  ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: cols.length } };
  return Buffer.from(await wb.xlsx.writeBuffer());
}
export const stamp = () => new Date().toISOString().slice(0, 10);
