import { MigrationInterface, QueryRunner } from 'typeorm';

export class IntakesAndUppercase1760000001000 implements MigrationInterface {
  name = 'IntakesAndUppercase1760000001000';

  public async up(q: QueryRunner): Promise<void> {
    await q.query(`CREATE TABLE intakes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(100) NOT NULL UNIQUE,
      description TEXT,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now())`);
    await q.query(`INSERT INTO intakes (name) VALUES ('SEPTEMBER-2026')`);

    // existing applications are back-filled with the first intake, then the column becomes mandatory
    await q.query(`ALTER TABLE applications ADD COLUMN intake_id UUID REFERENCES intakes(id) ON DELETE RESTRICT`);
    await q.query(`UPDATE applications SET intake_id = (SELECT id FROM intakes WHERE name = 'SEPTEMBER-2026')`);
    await q.query(`ALTER TABLE applications ALTER COLUMN intake_id SET NOT NULL`);
    await q.query(`CREATE INDEX idx_applications_intake_id ON applications(intake_id)`);

    // store everything in UPPERCASE (email, website and password hashes are left untouched)
    const up = (table: string, cols: string[]) =>
      q.query(`UPDATE ${table} SET ${cols.map((c) => `${c} = UPPER(TRIM(${c}))`).join(', ')}`);
    await up('applicants', ['passport_number', 'first_name', 'last_name', 'gender', 'nationality', 'phone', 'address', 'city', 'country', 'sponsor', 'reference_person']);
    await up('users', ['name']);
    await up('documents', ['document_type', 'notes']);
    await up('areas', ['name', 'province', 'country']);
    await up('programs', ['name', 'description', 'visa_type', 'duration']);
    await up('majors', ['name', 'description']);
    await up('universities', ['name', 'description']);
    await up('applications', ['notes']);
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(`ALTER TABLE applications DROP COLUMN IF EXISTS intake_id`);
    await q.query(`DROP TABLE IF EXISTS intakes`); // note: uppercasing of existing data is not reversible
  }
}
