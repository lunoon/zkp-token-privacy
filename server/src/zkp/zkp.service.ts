import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ZokratesService } from 'src/zokrates/zokrates.service';
import { Repository } from 'typeorm';
import { ZkProofSplitRequestDto } from './dto/zkproof-split-request.dto';
import { ZkProofResponseDto } from './dto/zkproof-response.dto';
import { ZkWitnessRequestDto } from './dto/zkwitness.request.dto';
import { ZkWitnessResponseDto } from './dto/zkwitness.response.dto';
import { ZkProofJoinRequestDto } from './dto/zkproof-join-request.dto';
import { RegistryEntry } from 'src/registry/entities/registry-entry.entity';
import { Witness } from './entities/witness.entity';

@Injectable()
export class ZkpService {
  private readonly logger = new Logger(ZkpService.name);
  constructor(
    @InjectRepository(RegistryEntry)
    private regEntryRepository: Repository<RegistryEntry>,
    @InjectRepository(Witness)
    private witnessRepository: Repository<Witness>,
    private zokratesService: ZokratesService,
  ) {}

  async findWitnessById(id: string): Promise<any> {
    const witness = this.witnessRepository.findOne({
      where: { witnessId: id },
    });
    if (!witness) {
      throw new NotFoundException('No witness found');
    }
  }

  async computeWitnessHash(
    data: ZkWitnessRequestDto,
  ): Promise<ZkWitnessResponseDto> {
    // if (this.zokratesService.initialized == false) {
    //   await this.zokratesService.initialize();
    // }
    // witness, salt?
    try {
      const computedHash = await this.zokratesService.uglyComputeHash(
        data.witness,
        data.salt ?? '0',
      );
      // save to db
      const witness: Witness = await this.witnessRepository.save({
        witness: data.witness,
        salt: data.salt ?? '0',
        hash0: computedHash[0],
        hash1: computedHash[1],
      });
      // NewRegistryEntryBase
      const result: ZkWitnessResponseDto = {
        witnessId: witness.witnessId,
      };
      return result;
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException('Error while computing hash');
    }
  }

  async createProofJoin(
    data: ZkProofJoinRequestDto,
  ): Promise<ZkProofResponseDto> {
    const witnessFull = await this.witnessRepository.findOne({
      where: { witnessId: data.witnessId },
    });
    // get data for fp0, fp1
    const entry0 = await this.regEntryRepository.findOne({
      where: { fingerprint: data.fp0 },
    });
    const witness0 = await this.witnessRepository.findOne({
      where: { witnessId: entry0.witnessId },
    });
    const entry1 = await this.regEntryRepository.findOne({
      where: { fingerprint: data.fp1 },
    });
    const witness1 = await this.witnessRepository.findOne({
      where: { witnessId: entry1.witnessId },
    });
    if (!(witnessFull && witness0 && witness1 && entry0 && entry1)) {
      throw new InternalServerErrorException(
        "Couldn't fetch all data for computing proof",
      );
    }
    const witness = [
      witnessFull.hash0,
      witnessFull.hash1,
      witness0.hash0,
      witness0.hash1,
      witness1.hash0,
      witness1.hash1,
      witnessFull.salt,
      witness0.salt,
      witness1.salt,
      witnessFull.witness,
      witness0.witness,
      witness1.witness,
    ];
    return this.createProof(witness);
  }

  async createProofSplit(
    data: ZkProofSplitRequestDto,
  ): Promise<ZkProofResponseDto> {
    const witness0 = await this.witnessRepository.findOne({
      where: { witnessId: data.witnessId0 },
    });
    const witness1 = await this.witnessRepository.findOne({
      where: { witnessId: data.witnessId1 },
    });
    // get data for fp
    const entry = await this.regEntryRepository.findOne({
      where: { fingerprint: data.fpFull },
    });
    const witnessFull = await this.witnessRepository.findOne({
      where: { witnessId: entry.witnessId },
    });
    if (!(witnessFull && witness0 && witness1 && entry)) {
      throw new InternalServerErrorException(
        "Couldn't fetch all data for computing proof",
      );
    }
    const witness = [
      witnessFull.hash0,
      witnessFull.hash1,
      witness0.hash0,
      witness0.hash1,
      witness1.hash0,
      witness1.hash1,
      witnessFull.salt,
      witness0.salt,
      witness1.salt,
      witnessFull.witness,
      witness0.witness,
      witness1.witness,
    ];
    return this.createProof(witness);
  }

  async createProof(witness): Promise<ZkProofResponseDto> {
    // witness, salt?
    // if (this.zokratesService.initialized == false) {
    //   await this.zokratesService.initialize();
    // }
    const computedProof = await this.zokratesService.uglyProof(witness);
    console.log({ computedProof });
    // proof
    return { proof: computedProof.proof };
  }
}
