import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Applicant } from '../../applicants/entities/applicant.entity';
import { University } from '../../universities/entities/university.entity';
import { Program } from '../../programs/entities/program.entity';
import { Major } from '../../majors/entities/major.entity';
import { Intake } from '../../intakes/entities/intake.entity';

@Entity('applications')
export class Application {
  /** Internal UUID primary key. */
  @PrimaryGeneratedColumn('uuid') id: string;
  /** Human-readable ID, e.g. APP-2026-000123. UNIQUE, generated server-side from a DB sequence. */
  @Column({ name: 'application_id', type: 'varchar', length: 30, unique: true }) applicationId: string;

  @Index() @Column({ name: 'applicant_id', type: 'uuid' }) applicantId: string;
  @ManyToOne(() => Applicant, { onDelete: 'RESTRICT' }) @JoinColumn({ name: 'applicant_id' }) applicant: Applicant;

  @Index() @Column({ name: 'university_id', type: 'uuid' }) universityId: string;
  @ManyToOne(() => University, { onDelete: 'RESTRICT' }) @JoinColumn({ name: 'university_id' }) university: University;

  @Index() @Column({ name: 'program_id', type: 'uuid' }) programId: string;
  @ManyToOne(() => Program, { onDelete: 'RESTRICT' }) @JoinColumn({ name: 'program_id' }) program: Program;

  @Index() @Column({ name: 'major_id', type: 'uuid' }) majorId: string;
  @ManyToOne(() => Major, { onDelete: 'RESTRICT' }) @JoinColumn({ name: 'major_id' }) major: Major;

  @Index() @Column({ name: 'intake_id', type: 'uuid' }) intakeId: string;
  @ManyToOne(() => Intake, { onDelete: 'RESTRICT' }) @JoinColumn({ name: 'intake_id' }) intake: Intake;

  @Index() @Column({ type: 'varchar', length: 50, default: 'PENDING' }) status: string;
  @Column({ name: 'application_date', type: 'date', nullable: true }) applicationDate: string | null;
  @Column({ type: 'text', nullable: true }) notes: string | null;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }) updatedAt: Date;
}
