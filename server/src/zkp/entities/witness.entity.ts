import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Witness {
  @PrimaryGeneratedColumn('uuid')
  witnessId: string;

  @Column()
  witness: string;

  @Column({ nullable: true })
  salt: string;

  @Column()
  hash0: string;

  @Column()
  hash1: string;
}
