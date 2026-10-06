import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('intakes')
export class Intake {
  @PrimaryGeneratedColumn('uuid') id: string;
  /** e.g. SEPTEMBER-2026 */
  @Column({ type: 'varchar', length: 100, unique: true }) name: string;
  @Column({ type: 'text', nullable: true }) description: string | null;
  @Column({ name: 'is_active', default: true }) isActive: boolean;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }) updatedAt: Date;
}
