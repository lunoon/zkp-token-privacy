import { Proof } from 'zokrates-js';

export class JoinRegistryRequest {
  fp0: string;
  fp1: string;
  proof: Proof['proof'];
  witnessId: string;
}
