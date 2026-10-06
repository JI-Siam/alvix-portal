import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Applicant } from '../../applicants/entities/applicant.entity';

@Entity('documents')
export class DocumentRecord {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Index() @Column({ name: 'applicant_id', type: 'uuid' }) applicantId: string;
  @ManyToOne(() => Applicant, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'applicant_id' }) applicant: Applicant;
  @Column({ name: 'document_type', type: 'varchar', length: 100 }) documentType: string;
  @Column({ type: 'varchar', length: 30, default: 'PENDING' }) status: string;
  @Column({ name: 'received_date', type: 'date', nullable: true }) receivedDate: string | null;
  @Column({ type: 'text', nullable: true }) notes: string | null;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }) updatedAt: Date;
}
