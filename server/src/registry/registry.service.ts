import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Web3Service } from 'src/web3/web3.service';
import { Witness } from 'src/zkp/entities/witness.entity';
import { In, Not, Repository } from 'typeorm';
import { Depot, MixedRegistryEntry } from './dto/base.dto';
import { CreateRegistryRequest } from './dto/create-registry-request.dto';
import { CreateRegistryResponse } from './dto/create-registry-response.dto';
import { JoinRegistryRequest } from './dto/join-registry-request.dto';
import { JoinRegistryResponse } from './dto/join-registry-response.dto';
import { SplitRegistryRequest } from './dto/split-registry-request.dto';
import { SplitRegistryResponse } from './dto/split-registry-response.dto';
import { TransferRegistryRequest } from './dto/transfer-registry-request.dto';
import { TransferRegistryResponse } from './dto/transfer-registry-response.dto';
import { RegistryEntry } from './entities/registry-entry.entity';

@Injectable()
export class RegistryService {
  private readonly logger = new Logger(RegistryService.name);
  constructor(
    @InjectRepository(RegistryEntry)
    private regEntryRepository: Repository<RegistryEntry>,
    @InjectRepository(Witness)
    private witnessRepository: Repository<Witness>,
    private web3Service: Web3Service,
  ) {}

  async findByFingerprint(fp: string): Promise<any> {
    try {
      const regEntry = this.web3Service.readRegistyEntry(fp);
      return regEntry;
    } catch (e) {
      this.logger.error(e);
      throw new NotFoundException('Error fetching blockchain data');
    }
  }

  async findByFingerprintPrivate(fp: string): Promise<RegistryEntry> {
    const regEntry = this.regEntryRepository.findOne({
      where: { fingerprint: fp },
    });
    if (!regEntry) {
      throw new NotFoundException('No registry entry found');
    } else {
      return regEntry;
    }
  }

  async findAll(address: string): Promise<Depot> {
    const regEntryCollection = await this.regEntryRepository.find({
      where: { owner: address },
    });
    const witnessIdCollection = regEntryCollection.map((e) => e.witnessId);
    const witnessCollection = await this.witnessRepository.find({
      where: { witnessId: In([...witnessIdCollection]) },
    });
    const mixedEntries: MixedRegistryEntry[] = regEntryCollection.map(
      (r: RegistryEntry): MixedRegistryEntry => {
        return {
          registryEntry: r,
          witness: witnessCollection.find((w) => w.witnessId == r.witnessId),
        }; // eager true
      }, // Deliver | null
    );
    if (!mixedEntries) {
      throw new NotFoundException('No matching entries found');
    }
    return { items: mixedEntries };
  }

  async create(data: CreateRegistryRequest): Promise<CreateRegistryResponse> {
    const witness = await this.witnessRepository.findOne({
      where: {
        witnessId: data.witnessId,
      },
    });
    if (!witness) {
      throw new NotFoundException("Didn't find witness with given witnessId");
    }
    const fp = this.createFp(witness.witnessId);
    this.logger.log(fp);
    const transactionReceipt = await this.web3Service.create(
      fp,
      witness.hash0,
      witness.hash1,
    );
    if (!transactionReceipt) {
      throw new InternalServerErrorException('Unknown blockchain error');
    }
    const regEntry: RegistryEntry = {
      fingerprint: fp,
      witnessId: witness.witnessId,
      owner: process.env.WALLET_ADDRESS,
    };
    this.logger.log(regEntry);
    await this.regEntryRepository.save(regEntry);
    return { fp: fp, receipt: transactionReceipt };
  }

  async transfer(
    data: TransferRegistryRequest,
  ): Promise<TransferRegistryResponse> {
    // fp to
    const transactionReceipt = await this.web3Service.transfer(
      data.fp,
      data.to,
    );
    if (!transactionReceipt) {
      throw new InternalServerErrorException('Unknown blockchain error');
    }
    if (data.to == '0x0000000000000000000000000000000000000000') {
      this.regEntryRepository.delete({ fingerprint: data.fp });
    } else {
      await this.regEntryRepository.update(data.fp, { owner: data.to });
    }
    return { fp: data.fp, receipt: transactionReceipt, owner: data.to };
  }

  async split(data: SplitRegistryRequest): Promise<SplitRegistryResponse> {
    const witness0: Witness = await this.witnessRepository.findOne({
      where: { witnessId: data.witnessId0 },
    });
    const witness1: Witness = await this.witnessRepository.findOne({
      where: { witnessId: data.witnessId1 },
    });
    if (!(witness0 && witness1)) {
      throw new NotFoundException("Didn't find witness with given witnessId");
    }
    // fp witness proof
    const fp0: string = this.createFp(witness0.witnessId);
    const fp1: string = this.createFp(witness1.witnessId);
    const transactionReceipt = await this.web3Service.split(
      data.fpFull,
      fp0,
      fp1,
      { h0: witness0.hash0, h1: witness0.hash1 },
      { h0: witness1.hash0, h1: witness1.hash1 },
      data.proof,
    );
    if (!transactionReceipt) {
      throw new InternalServerErrorException('Unknown blockchain error');
    }
    const regEntry0: RegistryEntry = {
      fingerprint: fp0,
      witnessId: witness0.witnessId,
      owner: process.env.WALLET_ADDRESS,
    };
    const regEntry1: RegistryEntry = {
      fingerprint: fp1,
      witnessId: witness1.witnessId,
      owner: process.env.WALLET_ADDRESS,
    };
    await this.regEntryRepository.save(regEntry0);
    await this.regEntryRepository.save(regEntry1);
    await this.regEntryRepository.delete({
      fingerprint: data.fpFull,
    });
    return {
      fp0: fp0,
      fp1: fp1,
      receipt: transactionReceipt,
    };
  }

  async join(data: JoinRegistryRequest): Promise<JoinRegistryResponse> {
    const witness = await this.witnessRepository.findOne({
      where: { witnessId: data.witnessId },
    });
    // fp0 fp1 hash0 hash1 proof0 proof1
    const fpSum = this.createFp(witness.witnessId); // generate by creating entry
    const transactionReceipt = await this.web3Service.join(
      fpSum,
      data.fp0,
      data.fp1,
      { h0: witness.hash0, h1: witness.hash1 },
      data.proof,
    );
    // fp hash
    // save to db
    const regEntry: RegistryEntry = {
      fingerprint: fpSum,
      witnessId: data.witnessId,
      owner: process.env.WALLET_ADDRESS,
    };
    await this.regEntryRepository.save(regEntry);
    await this.regEntryRepository.delete({
      fingerprint: data.fp0,
    });
    await this.regEntryRepository.delete({
      fingerprint: data.fp1,
    });
    return {
      fp: fpSum,
      receipt: transactionReceipt,
    };
  }

  createFp(witnessId: string) {
    const res = process.env.WALLET_ADDRESS + witnessId.replace(/-/g, '');
    return res.substring(0, 66);
  }
}
