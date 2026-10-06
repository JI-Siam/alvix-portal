import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class DashboardService {
  constructor(private ds: DataSource) {}

  async stats() {
    const n = async (sql: string) => Number((await this.ds.query(sql))[0].n);
    const [applicants, applications, universities, programs, majors, areas, pendingDocuments, intakes] = await Promise.all([
      n(`SELECT count(*) n FROM applicants`),
      n(`SELECT count(*) n FROM applications`),
      n(`SELECT count(*) n FROM universities WHERE is_active`),
      n(`SELECT count(*) n FROM programs WHERE is_active`),
      n(`SELECT count(*) n FROM majors WHERE is_active`),
      n(`SELECT count(*) n FROM areas WHERE is_active`),
      n(`SELECT count(*) n FROM documents WHERE status = 'PENDING'`),
      n(`SELECT count(*) n FROM intakes WHERE is_active`),
    ]);
    const [applicationsByStatus, documentsByStatus, recentApplications, passportsExpiring, bankMaturing] = await Promise.all([
      this.ds.query(`SELECT status, count(*)::int AS count FROM applications GROUP BY status`),
      this.ds.query(`SELECT status, count(*)::int AS count FROM documents GROUP BY status`),
      this.ds.query(`SELECT a.id, a.application_id AS "applicationId", a.status, a.created_at AS "createdAt",
          ap.id AS "applicantId", ap.first_name AS "firstName", ap.last_name AS "lastName", u.name AS university
        FROM applications a JOIN applicants ap ON ap.id = a.applicant_id JOIN universities u ON u.id = a.university_id
        ORDER BY a.created_at DESC LIMIT 8`),
      this.ds.query(`SELECT id, first_name AS "firstName", last_name AS "lastName", passport_number AS "passportNumber",
          passport_expiry_date::text AS date FROM applicants
        WHERE passport_expiry_date IS NOT NULL AND passport_expiry_date <= CURRENT_DATE + INTERVAL '6 months'
        ORDER BY passport_expiry_date LIMIT 8`),
      this.ds.query(`SELECT id, first_name AS "firstName", last_name AS "lastName", passport_number AS "passportNumber",
          bank_maturity::text AS date FROM applicants
        WHERE bank_maturity IS NOT NULL AND bank_maturity <= CURRENT_DATE + INTERVAL '30 days'
        ORDER BY bank_maturity LIMIT 8`),
    ]);
    return {
      totals: { applicants, applications, universities, programs, majors, areas, pendingDocuments, intakes },
      applicationsByStatus, documentsByStatus, recentApplications, passportsExpiring, bankMaturing,
    };
  }
}
