import { Witness } from 'src/zkp/entities/witness.entity';
import { Proof } from 'zokrates-js';
import { RegistryEntry } from '../entities/registry-entry.entity';

export class HashBase {
  h0: string;
  h1: string;
}

export class RegistryEntryBase {
  fp: string;
  proof: Proof['proof'];
}

export class NewRegistryEntryBase {
  // witness: string;
  // salt?: string;
  // hash: HashBase;
  witnessId: string;
}

export class RegistryResponse {
  fp: string;
  receipt: any;
}

export class MixedRegistryEntry {
  registryEntry: RegistryEntry;
  witness: Witness;
}

export class Depot {
  items: MixedRegistryEntry[];
}
