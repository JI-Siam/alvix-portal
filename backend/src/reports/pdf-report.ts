import PDFDocument from 'pdfkit';
import * as path from 'path';

// ── Alvix brand palette ──────────────────────────────────────────────────────
const BLUE = '#13519a'; // primary brand
const GREEN = '#20cc92'; // subtle brand accent
const BLUE_LIGHT = '#eef4fa'; // very light brand tint
const INK = '#172033'; // primary text
const MUTED = '#68768a'; // secondary text
const LINE = '#e3e8ef'; // borders/dividers
const WHITE = '#ffffff';

const M = 40;
const ORG = 'ALVIX EDUCATION CONSULTANCY';

// Logo path — lives next to this file in dist after build
const LOGO_PATH = path.join(__dirname, 'logo.jpg');

/**
 * Clean, personal education-consultancy PDF style.
 *
 * Design principles:
 * - Blue is the primary brand colour.
 * - Green is used only as a small accent.
 * - White space does most of the visual work.
 * - No unnecessary coloured boxes.
 * - Strong typography and simple dividers keep the document professional.
 */
export class PdfReport {
  private doc: PDFKit.PDFDocument;
  private y = 88;
  private w: number;
  private chunks: Buffer[] = [];

  constructor(title: string) {
    this.doc = new PDFDocument({
      size: 'A4',
      margin: M,
      bufferPages: true,
      info: {
        Title: title,
        Author: ORG,
        Creator: ORG,
      },
    });

    this.doc.on('data', (c: Buffer) => this.chunks.push(c));

    this.w = this.doc.page.width - M * 2;

    // ── Header ───────────────────────────────────────────────────────────────
    // Keep the header mostly white. This makes the logo and typography feel
    // more like a personal education document than a corporate report.
    try {
      this.doc.image(LOGO_PATH, M, 18, {
        height: 42,
        fit: [42, 42],
      });
    } catch {
      // Small fallback mark
      this.doc
        .roundedRect(M, 20, 38, 38, 6)
        .fill(BLUE);

      this.doc
        .fillColor(WHITE)
        .font('Helvetica-Bold')
        .fontSize(14)
        .text('A', M, 30, {
          width: 38,
          align: 'center',
          lineBreak: false,
        });
    }

    const textX = M + 54;

    this.doc
      .fillColor(BLUE)
      .font('Helvetica-Bold')
      .fontSize(14)
      .text(ORG, textX, 20, {
        width: this.w - 54,
        lineBreak: false,
      });

    this.doc
      .fillColor(MUTED)
      .font('Helvetica')
      .fontSize(8)
      .text(
        `${title.toUpperCase()}  ·  ${new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}`,
        textX,
        40,
        {
          width: this.w - 54,
          lineBreak: false,
        },
      );

    // Small green detail — deliberately restrained.
    this.doc
      .roundedRect(this.doc.page.width - M - 22, 24, 22, 4, 2)
      .fill(GREEN);

    // Header divider
    this.doc
      .moveTo(M, 72)
      .lineTo(this.doc.page.width - M, 72)
      .lineWidth(0.7)
      .strokeColor(LINE)
      .stroke();
  }

  private need(h: number) {
    if (this.y + h > this.doc.page.height - 50) {
      this.doc.addPage();
      this.y = M;
    }
  }

  /** Main person/student heading. */
  banner(main: string, sub?: string) {
    this.need(sub ? 62 : 44);

    this.y += 4;

    // Very subtle green marker.
    this.doc
      .roundedRect(M, this.y + 2, 4, sub ? 42 : 25, 2)
      .fill(GREEN);

    this.doc
      .fillColor(BLUE)
      .font('Helvetica-Bold')
      .fontSize(18)
      .text(main || '-', M + 14, this.y, {
        width: this.w - 14,
        lineBreak: false,
      });

    if (sub) {
      this.doc
        .fillColor(MUTED)
        .font('Helvetica')
        .fontSize(9.5)
        .text(sub, M + 14, this.y + 25, {
          width: this.w - 14,
          lineBreak: false,
        });
    }

    this.y += sub ? 58 : 38;
  }

  heading(text: string) {
    this.need(42);

    // Simple text heading instead of a filled banner.
    this.doc
      .fillColor(BLUE)
      .font('Helvetica-Bold')
      .fontSize(9)
      .text(text.toUpperCase(), M, this.y, {
        width: this.w,
        lineBreak: false,
      });

    // Small green underline/accent.
    this.doc
      .roundedRect(M, this.y + 15, 24, 2, 1)
      .fill(GREEN);

    this.y += 28;
  }

  kv(
    pairs: [string, string | null | undefined][],
    cols = 2,
  ) {
    const gap = 20;
    const cw = (this.w - gap * (cols - 1)) / cols;

    for (let i = 0; i < pairs.length; i += cols) {
      const row = pairs.slice(i, i + cols);

      this.doc
        .font('Helvetica')
        .fontSize(10);

      const h =
        12 +
        Math.max(
          ...row.map(([, v]) =>
            this.doc.heightOfString(v || '-', {
              width: cw,
            }),
          ),
        ) +
        12;

      this.need(h);

      row.forEach(([k, v], j) => {
        const x = M + j * (cw + gap);

        // Label
        this.doc
          .fillColor(MUTED)
          .font('Helvetica')
          .fontSize(7)
          .text(k.toUpperCase(), x, this.y, {
            width: cw,
            lineBreak: false,
          });

        // Value
        this.doc
          .fillColor(INK)
          .font('Helvetica-Bold')
          .fontSize(10)
          .text(v || '-', x, this.y + 12, {
            width: cw,
          });

        // Very light separator underneath each field.
        this.doc
          .moveTo(x, this.y + h - 2)
          .lineTo(x + cw, this.y + h - 2)
          .lineWidth(0.4)
          .strokeColor(LINE)
          .stroke();
      });

      this.y += h;
    }

    this.y += 6;
  }

  note(text: string) {
    this.need(28);

    // Soft blue background, used only for notes.
    this.doc
      .roundedRect(M, this.y, this.w, 26, 4)
      .fill(BLUE_LIGHT);

    this.doc
      .fillColor(BLUE)
      .font('Helvetica-Bold')
      .fontSize(7)
      .text('NOTE', M + 9, this.y + 7, {
        width: 32,
        lineBreak: false,
      });

    this.doc
      .fillColor(MUTED)
      .font('Helvetica')
      .fontSize(8)
      .text(text, M + 40, this.y + 6, {
        width: this.w - 50,
        lineBreak: false,
      });

    this.y += 36;
  }

  table(
    cols: { label: string; w: number }[],
    rows: string[][],
    empty = 'No records.',
  ) {
    const total = cols.reduce((a, c) => a + c.w, 0);
    const ws = cols.map((c) => (c.w / total) * this.w);
    const pad = 6;

    const header = () => {
      this.need(28);

      // Clean white table header.
      let x = M;

      cols.forEach((c, i) => {
        this.doc
          .fillColor(BLUE)
          .font('Helvetica-Bold')
          .fontSize(7)
          .text(c.label.toUpperCase(), x + pad, this.y, {
            width: ws[i] - pad * 2,
            lineBreak: false,
          });

        x += ws[i];
      });

      // Header underline
      this.doc
        .moveTo(M, this.y + 14)
        .lineTo(M + this.w, this.y + 14)
        .lineWidth(1)
        .strokeColor(BLUE)
        .stroke();

      this.y += 20;
    };

    header();

    if (!rows.length) {
      this.doc
        .fillColor(MUTED)
        .font('Helvetica-Oblique')
        .fontSize(8.5)
        .text(empty, M + pad, this.y + 6, {
          width: this.w,
        });

      this.y += 28;
      return;
    }

    rows.forEach((r, ri) => {
      this.doc
        .font('Helvetica')
        .fontSize(8.5);

      const h =
        Math.max(
          ...r.map((c, i) =>
            this.doc.heightOfString(c || '-', {
              width: ws[i] - pad * 2,
            }),
          ),
        ) + 12;

      if (this.y + h > this.doc.page.height - 50) {
        this.doc.addPage();
        this.y = M;
        header();
      }

      // Very subtle alternating background.
      if (ri % 2 === 0) {
        this.doc
          .rect(M, this.y, this.w, h)
          .fill('#f8fafc');
      }

      let x = M;

      r.forEach((c, i) => {
        this.doc
          .fillColor(INK)
          .font('Helvetica')
          .fontSize(8.5)
          .text(c || '-', x + pad, this.y + 6, {
            width: ws[i] - pad * 2,
          });

        x += ws[i];
      });

      // Row divider
      this.doc
        .moveTo(M, this.y + h)
        .lineTo(M + this.w, this.y + h)
        .lineWidth(0.4)
        .strokeColor(LINE)
        .stroke();

      this.y += h;
    });

    this.y += 12;
  }

  async finish(): Promise<Buffer> {
    const { count } = this.doc.bufferedPageRange();

    for (let i = 0; i < count; i++) {
      this.doc.switchToPage(i);
      this.doc.page.margins.bottom = 0;

      const footerY = this.doc.page.height - 30;

      // Simple footer divider.
      this.doc
        .moveTo(M, footerY)
        .lineTo(this.doc.page.width - M, footerY)
        .lineWidth(0.7)
        .strokeColor(LINE)
        .stroke();

      // Tiny green accent.
      this.doc
        .roundedRect(M, footerY - 2, 18, 2, 1)
        .fill(GREEN);

      this.doc
        .fillColor(MUTED)
        .font('Helvetica')
        .fontSize(7)
        .text(
          `${ORG}  ·  Confidential  ·  Page ${i + 1} of ${count}`,
          M,
          footerY + 7,
          {
            width: this.w,
            align: 'center',
            lineBreak: false,
          },
        );
    }

    const done = new Promise<Buffer>((res) =>
      this.doc.on('end', () => res(Buffer.concat(this.chunks))),
    );

    this.doc.end();

    return done;
  }
}