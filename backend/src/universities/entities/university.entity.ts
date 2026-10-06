import { Column, CreateDateColumn, Entity, Index, JoinColumn, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Area } from '../../areas/entities/area.entity';
import { Program } from '../../programs/entities/program.entity';

@Entity('universities')
export class University {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ type: 'varchar', length: 255, unique: true }) name: string;
  @Index() @Column({ name: 'area_id', type: 'uuid' }) areaId: string;
  @ManyToOne(() => Area, { onDelete: 'RESTRICT' }) @JoinColumn({ name: 'area_id' }) area: Area;
  @Column({ type: 'text', nullable: true }) website: string | null;
  @Column({ type: 'text', nullable: true }) description: string | null;
  @Column({ name: 'is_active', default: true }) isActive: boolean;

  // University N:M Program through university_programs (composite PK)
  @ManyToMany(() => Program)
  @JoinTable({
    name: 'university_programs',
    joinColumn: { name: 'university_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'program_id', referencedColumnName: 'id' },
  })
  programs: Program[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }) updatedAt: Date;
}
