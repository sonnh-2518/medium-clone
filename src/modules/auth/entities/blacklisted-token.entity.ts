import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('blacklisted_tokens')
export class BlacklistedToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  tokenHash: string;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
