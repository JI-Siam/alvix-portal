import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('applicants')
export class Applicant {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'passport_number', type: 'varchar', length: 100, unique: true }) passportNumber: string;
  @Column({ name: 'password_hash', type: 'text', select: false }) passwordHash: string;
  @Column({ name: 'first_name', type: 'varchar', length: 100 }) firstName: string;
  @Column({ name: 'last_name', type: 'varchar', length: 100, nullable: true }) lastName: string | null;
  @Column({ name: 'date_of_birth', type: 'date', nullable: true }) dateOfBirth: string | null;
  @Column({ type: 'varchar', length: 30, nullable: true }) gender: string | null;
  @Column({ type: 'varchar', length: 100, nullable: true }) nationality: string | null;
  @Column({ type: 'varchar', length: 30, nullable: true }) phone: string | null;
  @Column({ type: 'varchar', length: 255, nullable: true }) email: string | null;
  @Column({ type: 'text', nullable: true }) address: string | null;
  @Column({ type: 'varchar', length: 100, nullable: true }) city: string | null;
  @Column({ type: 'varchar', length: 100, nullable: true }) country: string | null;
  @Column({ name: 'passport_expiry_date', type: 'date', nullable: true }) passportExpiryDate: string | null;

  // --- financial / sponsor details ---
  @Column({ type: 'varchar', length: 150, nullable: true }) sponsor: string | null;
  @Column({ name: 'bank_open_date', type: 'date', nullable: true }) bankOpenDate: string | null;
  @Column({ name: 'bank_issue_date', type: 'date', nullable: true }) bankIssueDate: string | null;
  @Column({ name: 'bank_maturity', type: 'date', nullable: true }) bankMaturity: string | null;
  /** NUMERIC(15,2). node-postgres returns NUMERIC as a string, which keeps exact precision. */
  @Column({ name: 'fund_usd', type: 'numeric', precision: 15, scale: 2, nullable: true }) fundUsd: string | null;
  @Column({ name: 'reference_person', type: 'varchar', length: 150, nullable: true }) referencePerson: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }) updatedAt: Date;
}
