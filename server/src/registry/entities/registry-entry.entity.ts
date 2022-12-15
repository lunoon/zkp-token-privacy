import { Entity, Column, PrimaryColumn } from 'typeorm';
import { HashBase } from '../dto/base.dto';

@Entity()
export class RegistryEntry {
  @PrimaryColumn()
  fingerprint: string;

  // @Column()
  // witness: string;

  // @Column()
  // salt: string;

  // @Column()
  // hash0: string;

  // @Column()
  // hash1: string;

  @Column()
  witnessId: string;

  @Column()
  owner: string;
}
