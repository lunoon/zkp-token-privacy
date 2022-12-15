import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { initialize, Proof } from 'zokrates-js';
import { readFileSync } from 'fs';
import { hashingProgram, splitJoinProgram } from './util/program.util';

@Injectable()
export class ZokratesService {
  private readonly logger = new Logger(ZokratesService.name);
  zkProvider: any;
  artifactsHashing: { program: any; abi: any };
  artifactsSplitJoin: { program: any; abi: any };
  keypairSplitJoin: any;
  initialized: boolean;

  constructor() {
    this.zkProvider = '';
    this.initialized = false;
  }

  async initialize() {
    try {
      this.zkProvider = await initialize();
      this.artifactsHashing = this.zkProvider.compile(hashingProgram);

      this.artifactsSplitJoin = this.zkProvider.compile(splitJoinProgram);
      this.keypairSplitJoin = readFileSync(
        '/opt/zokrates/splitjoinKeypair',
        'utf8',
      );
      this.keypairSplitJoin = Buffer.from(this.keypairSplitJoin, 'base64');
      this.keypairSplitJoin = JSON.parse(this.keypairSplitJoin);
      this.initialized = true;
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException(
        'Error while initializing Zokrates',
      );
    }
  }

  computeWitnessHash(input: string, salt: string) {
    // ['0','0','0','5']
    try {
      const { witness, output } = this.zkProvider.computeWitness(
        this.artifactsHashing,
        ['0', salt, '0', input],
      );
      this.logger.log({ witness, output });
      return output;
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException(
        'Error with outdated compute hash calculation',
      );
    }
  }

  generateProof(witness): Proof {
    try {
      const computedWitness = this.zkProvider.computeWitness(
        this.artifactsSplitJoin.program,
        witness,
      );
      return this.zkProvider.generateProof(
        this.artifactsSplitJoin.program,
        computedWitness,
        this.keypairSplitJoin.pk,
      );
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException(
        'Error with outdated generate proof calculation',
      );
    }
  }

  async uglyComputeHash(input, salt) {
    try {
      const zokProvider = await initialize();
      this.logger.log('compilation of hashing program');
      const artifacts = zokProvider.compile(hashingProgram);
      this.logger.log('computation of witness');
      const { witness, output } = zokProvider.computeWitness(artifacts, [
        '0',
        salt,
        '0',
        input,
      ]);
      const witPrep = { witness, output };
      // write output[0] as h0 and output[1] as h1 to blockchain with registry api
      return JSON.parse(witPrep.output);
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException('Error while computing hash');
    }
  }

  async uglyProof(witness_input) {
    try {
      const zokProvider = await initialize();
      this.logger.log('compilation of splitjoin program');
      const artifacts = zokProvider.compile(splitJoinProgram);
      this.logger.log('computation of witness');
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { witness, output } = zokProvider.computeWitness(
        artifacts,
        witness_input,
      );
      this.logger.log('importing proving key');
      let savedKeypair = readFileSync('/opt/zokrates/splitjoinKeypair', 'utf8');
      const objJsonB64_n = Buffer.from(savedKeypair, 'base64').toString();
      savedKeypair = undefined;
      const keypair = JSON.parse(objJsonB64_n);
      this.logger.log('loaded proving key');
      this.logger.log('generating proof');
      const proof = zokProvider.generateProof(
        artifacts.program,
        witness,
        keypair.pk,
      );
      this.logger.log(JSON.stringify(proof.proof));

      if (zokProvider.verify(keypair.vk, proof)) {
        return proof;
      }
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException('Error while generating proof');
    }
  }
}
