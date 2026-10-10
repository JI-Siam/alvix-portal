import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class DashboardService {
  constructor(private ds: DataSource) {}

  async stats() {
    // Combine all counts into a single query to avoid exhausting the DB connection pool
    const [totalsRaw] = await this.ds.query(`
      SELECT 
        (SELECT count(*)::int FROM applicants) AS applicants,
        (SELECT count(*)::int FROM applications) AS applications,
        (SELECT count(*)::int FROM universities WHERE is_active) AS universities,
        (SELECT count(*)::int FROM programs WHERE is_active) AS programs,
        (SELECT count(*)::int FROM majors WHERE is_active) AS majors,
        (SELECT count(*)::int FROM areas WHERE is_active) AS areas,
        (SELECT count(*)::int FROM documents WHERE status = 'PENDING') AS "pendingDocuments",
        (SELECT count(*)::int FROM intakes WHERE is_active) AS intakes
    `);
    const totals = {
      applicants: totalsRaw.applicants, applications: totalsRaw.applications,
      universities: totalsRaw.universities, programs: totalsRaw.programs,
      majors: totalsRaw.majors, areas: totalsRaw.areas,
      pendingDocuments: totalsRaw.pendingDocuments, intakes: totalsRaw.intakes,
    };
    
    const [
      applicationsByStatus, documentsByStatus, recentApplications, passportsExpiring, bankMaturing,
      applicantsOverTime, applicationsByIntake, incompleteApplicants, documentCompletion, applicationsNeedingAction,
      applicationSuccess, topUniversities, topPrograms, applicantDistributionByCountry, recentlyUpdatedApplicants,
      inactiveMasterData
    ] = await Promise.all([
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
      this.ds.query(`SELECT 
          (SELECT count(*)::int FROM applicants WHERE date_trunc('month', created_at) = date_trunc('month', CURRENT_DATE)) AS "thisMonth",
          (SELECT count(*)::int FROM applicants WHERE date_trunc('month', created_at) = date_trunc('month', CURRENT_DATE - INTERVAL '1 month')) AS "lastMonth"`),
      this.ds.query(`SELECT i.name as intake, count(a.id)::int AS count FROM applications a JOIN intakes i ON a.intake_id = i.id GROUP BY i.name`),
      this.ds.query(`SELECT id, first_name AS "firstName", last_name AS "lastName" FROM applicants WHERE passport_expiry_date IS NULL OR phone IS NULL OR email IS NULL OR bank_maturity IS NULL OR fund_usd IS NULL LIMIT 10`),
      this.ds.query(`SELECT 
          (SELECT count(DISTINCT applicant_id)::int FROM documents WHERE status = 'PENDING') as "applicantsWithPendingDocs",
          (SELECT count(DISTINCT applicant_id)::int FROM documents WHERE status != 'PENDING') as "applicantsWithCompletedDocs"`),
      this.ds.query(`SELECT a.id, a.application_id AS "applicationId", a.status, ap.first_name AS "firstName", ap.last_name AS "lastName" FROM applications a JOIN applicants ap ON a.applicant_id = ap.id WHERE a.status IN ('PENDING', 'IN_REVIEW', 'ACTION_REQUIRED') ORDER BY a.created_at DESC LIMIT 10`),
      this.ds.query(`SELECT count(*) FILTER (WHERE status = 'APPROVED')::int as approved, count(*) FILTER (WHERE status IN ('APPROVED', 'REJECTED'))::int as decided FROM applications`),
      this.ds.query(`SELECT u.name, count(a.id)::int AS count FROM applications a JOIN universities u ON a.university_id = u.id GROUP BY u.name ORDER BY count DESC LIMIT 5`),
      this.ds.query(`SELECT p.name, count(a.id)::int AS count FROM applications a JOIN programs p ON a.program_id = p.id GROUP BY p.name ORDER BY count DESC LIMIT 5`),
      this.ds.query(`SELECT country, count(id)::int AS count FROM applicants WHERE country IS NOT NULL GROUP BY country ORDER BY count DESC LIMIT 5`),
      this.ds.query(`SELECT id, first_name AS "firstName", last_name AS "lastName", updated_at AS "updatedAt" FROM applicants ORDER BY updated_at DESC LIMIT 5`),
      this.ds.query(`SELECT 
          (SELECT count(*)::int FROM universities WHERE is_active = false) AS "inactiveUniversities",
          (SELECT count(*)::int FROM programs WHERE is_active = false) AS "inactivePrograms",
          (SELECT count(*)::int FROM intakes WHERE is_active = false) AS "inactiveIntakes"`)
    ]);

    return {
      totals,
      applicationsByStatus, documentsByStatus, recentApplications, passportsExpiring, bankMaturing,
      applicantsOverTime: applicantsOverTime[0], 
      applicationsByIntake, 
      incompleteApplicants, 
      documentCompletion: documentCompletion[0], 
      applicationsNeedingAction,
      applicationSuccess: applicationSuccess[0], 
      topUniversities, 
      topPrograms, 
      applicantDistributionByCountry, 
      recentlyUpdatedApplicants,
      inactiveMasterData: inactiveMasterData[0]
    };
  }
}
