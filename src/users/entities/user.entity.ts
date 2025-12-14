import { uuid } from 'src/shared/types/uuid';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

const bigintTransformer = {
  to: (value: number): number => value,
  from: (value: string | number): number =>
    typeof value === 'string' ? Number(value) : value,
};

@Entity({ name: 'users' })
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: uuid;

  @Column({ type: 'varchar', length: 255 })
  login: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ type: 'integer', default: 1 })
  version: number;

  @Column({ type: 'bigint', transformer: bigintTransformer })
  createdAt: number;

  @Column({ type: 'bigint', transformer: bigintTransformer })
  updatedAt: number;
}
