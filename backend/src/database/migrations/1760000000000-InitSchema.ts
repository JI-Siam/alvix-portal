import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSchema1760000000000 implements MigrationInterface {
  name = 'InitSchema1760000000000';

  public async up(q: QueryRunner): Promise<void> {
    await q.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto`);
    const ts = `created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()`;

    await q.query(`CREATE TABLE users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(150) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role VARCHAR(30) NOT NULL CHECK (role IN ('SUPER_ADMIN','ADMIN')),
      is_active BOOLEAN NOT NULL DEFAULT TRUE, ${ts})`);

    await q.query(`CREATE TABLE applicants (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      passport_number VARCHAR(100) NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100),
      date_of_birth DATE,
      gender VARCHAR(30),
      nationality VARCHAR(100),
      phone VARCHAR(30),
      email VARCHAR(255),
      address TEXT,
      city VARCHAR(100),
      country VARCHAR(100),
      passport_expiry_date DATE,
      sponsor VARCHAR(150),
      bank_open_date DATE,
      bank_issue_date DATE,
      bank_maturity DATE,
      fund_usd NUMERIC(15,2) CHECK (fund_usd IS NULL OR fund_usd >= 0),
      reference_person VARCHAR(150), ${ts})`);

    await q.query(`CREATE TABLE documents (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      applicant_id UUID NOT NULL REFERENCES applicants(id) ON DELETE CASCADE,
      document_type VARCHAR(100) NOT NULL,
      status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
      received_date DATE,
      notes TEXT, ${ts})`);
    await q.query(`CREATE INDEX idx_documents_applicant ON documents(applicant_id)`);

    await q.query(`CREATE TABLE areas (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(150) NOT NULL,
      province VARCHAR(150),
      country VARCHAR(100) NOT NULL DEFAULT 'South Korea',
      is_active BOOLEAN NOT NULL DEFAULT TRUE, ${ts})`);

    await q.query(`CREATE TABLE programs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      description TEXT,
      visa_type VARCHAR(100),
      duration VARCHAR(100),
      is_active BOOLEAN NOT NULL DEFAULT TRUE, ${ts})`);

    await q.query(`CREATE TABLE majors (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(150) NOT NULL UNIQUE,
      description TEXT,
      is_active BOOLEAN NOT NULL DEFAULT TRUE, ${ts})`);

    await q.query(`CREATE TABLE universities (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL UNIQUE,
      area_id UUID NOT NULL REFERENCES areas(id) ON DELETE RESTRICT,
      website TEXT,
      description TEXT,
      is_active BOOLEAN NOT NULL DEFAULT TRUE, ${ts})`);
    await q.query(`CREATE INDEX idx_universities_area ON universities(area_id)`);

    await q.query(`CREATE TABLE university_programs (
      university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
      program_id UUID NOT NULL REFERENCES programs(id) ON DELETE RESTRICT,
      PRIMARY KEY (university_id, program_id))`);

    // Human-readable application IDs: APP-<year>-<6 digit sequence>
    await q.query(`CREATE SEQUENCE application_id_seq START 1`);

    await q.query(`CREATE TABLE applications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      application_id VARCHAR(30) NOT NULL UNIQUE,
      applicant_id UUID NOT NULL REFERENCES applicants(id) ON DELETE RESTRICT,
      university_id UUID NOT NULL REFERENCES universities(id) ON DELETE RESTRICT,
      program_id UUID NOT NULL REFERENCES programs(id) ON DELETE RESTRICT,
      major_id UUID NOT NULL REFERENCES majors(id) ON DELETE RESTRICT,
      status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
      application_date DATE,
      notes TEXT, ${ts})`);
    for (const c of ['applicant_id', 'university_id', 'program_id', 'major_id', 'status'])
      await q.query(`CREATE INDEX idx_applications_${c} ON applications(${c})`);
  }

  public async down(q: QueryRunner): Promise<void> {
    for (const t of ['applications', 'university_programs', 'universities', 'majors', 'programs', 'areas', 'documents', 'applicants', 'users'])
      await q.query(`DROP TABLE IF EXISTS ${t}`);
    await q.query(`DROP SEQUENCE IF EXISTS application_id_seq`);
  }
}
