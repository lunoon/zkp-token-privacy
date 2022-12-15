import { Proof } from 'zokrates-js';

export class SplitRegistryRequest {
  fpFull: string;
  proof: Proof['proof'];
  witnessId0: string;
  witnessId1: string;
}
