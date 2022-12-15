import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { providers, Contract, Wallet, utils } from 'ethers';
import { readFileSync } from 'fs';
import * as path from 'path';
import { Proof } from 'zokrates-js';

@Injectable()
export class Web3Service {
  private readonly logger = new Logger(Web3Service.name);
  provider: providers.JsonRpcProvider;
  // verifier: any = {
  //   address: process.env.VERIFIER_ADDRESS,
  //   contract: '../abi/Verifier.json',
  // };
  registryContract: Contract;
  registryAddress: string = process.env.REGISTRY_ADDRESS;
  registryAbi: any;
  wallet: Wallet;
  providerReady = false;

  constructor() {
    this.provider = new providers.JsonRpcProvider(process.env.NODE_ENDPOINT);
    // this.verifier.address = process.env.VERIFIER_ADDRESS;
    // this.verifier.contract = this.importContract(
    //   this.verifier.contract,
    //   this.verifier.address,
    // );
    this.registryContract = this.importContract();
    this.wallet = new Wallet(process.env.PRIVATE_KEY, this.provider);
    this.logger.log(this.provider);
  }

  async waitForProvider() {
    if (this.providerReady == false) {
      try {
        await this.provider;
        await this.provider.getBlockNumber();
        this.providerReady = true;
        this.logger.log('connected');
        const balance = await this.provider.getBalance(this.wallet.address);
        this.logger.log(balance);
      } catch (e) {
        this.providerReady = false;
        this.logger.error('Blockchain connection failed: ' + e);
      }
    }
  }

  async waitForTransactionReceipt(
    transactionHash: string,
  ): Promise<providers.TransactionReceipt> {
    const txReceipt = await this.provider.getTransactionReceipt(
      transactionHash,
    );
    if (txReceipt && txReceipt.blockNumber) {
      return txReceipt;
    } else {
      throw new InternalServerErrorException('Error mining transaction');
    }
  }

  async writeOperationContract(
    method: string,
    input: any,
  ): Promise<providers.TransactionResponse> {
    await this.waitForProvider();
    try {
      const contract = new utils.Interface(this.importAbi());
      const func_data = contract.encodeFunctionData(method, input);

      const rawTx = {
        from: process.env.WALLET_ADDRESS,
        nonce: await this.provider.getTransactionCount(this.wallet.address), // this is fetched from server
        to: process.env.REGISTRY_ADDRESS, // this is the destination address
        gasLimit: undefined,
        gasPrice: await this.provider.getGasPrice(),
        value: utils.hexValue(0),
        data: func_data,
      };

      const estimateGas = await this.provider.estimateGas(rawTx);

      rawTx.gasLimit = estimateGas;

      this.logger.log(rawTx);

      const signedTransaction = await this.wallet.signTransaction(rawTx);
      this.logger.log(signedTransaction);

      const receipt = await this.provider.sendTransaction(signedTransaction);
      return receipt;
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException('Error sending transaction');
    }
  }

  importContract(): Contract {
    let abi = '';
    abi = JSON.parse(
      readFileSync(path.resolve(__dirname, process.env.ABI_PATH), 'utf8'),
    );
    if (abi != '') {
      return new Contract(process.env.REGISTRY_ADDRESS, abi);
    }
  }

  importAbi(): string {
    let abi = '';
    abi = JSON.parse(
      readFileSync(path.resolve(__dirname, process.env.ABI_PATH), 'utf8'),
    );
    if (abi !== '') {
      return abi;
    }
  }

  /*
  Registry var
  */

  async readRegistyEntry(fp: string) {
    // mapping(bytes32 => RegistryEntry) public entries;
    // struct BalanceHash {
    //   uint256 h0;
    //   uint256 h1;
    // }
    // struct RegistryEntry {
    //   address owner;
    //   BalanceHash balance;
    // }
    this.waitForProvider();
    try {
      this.logger.log(fp);
      const contract = new Contract(
        process.env.REGISTRY_ADDRESS,
        this.importAbi(),
        this.provider,
      );
      this.logger.log(contract);
      const callResult = await contract.entries(fp);
      this.logger.log(callResult);
      return callResult;
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException('Error reading blockchain data');
    }
  }

  /*
  Registry methods
  */

  async create(
    fp: string,
    h0: string,
    h1: string,
  ): Promise<providers.TransactionReceipt> {
    // create(bytes32 fp, address _owner, uint256 _h0, uint256 _h1)
    // fp string length 32
    this.logger.log(fp);
    this.logger.log({ h0, h1 });
    // const result = await this.writeOpContract('create', [
    //   fp,
    //   this.wallet.address,
    //   h0,
    //   h1,
    // ]);
    const result = await this.writeOperationContract('create', [fp, h0, h1]);
    return this.waitForTransactionReceipt(result.hash);
  }

  async transfer(
    fp: string,
    to: string,
  ): Promise<providers.TransactionReceipt> {
    // transfer(bytes32 entry, address to)
    //const result = await this.writeOpContract('transfer', [entry, to]);
    this.logger.log({ fp, to });
    const result = await this.writeOperationContract('transfer', [fp, to]);
    return this.waitForTransactionReceipt(result.hash);
  }

  async join(
    sumFp: string,
    fp0: string,
    fp1: string,
    balanceHash: { h0: string; h1: string },
    proof: Proof['proof'],
  ): Promise<providers.TransactionReceipt> {
    // join(bytes32 sumFp, bytes32 fp1, bytes32 fp2, BalanceHash memory balHashFull, Verifier.Proof memory p)
    // create sumFp in registryservice b4
    const result = await this.writeOperationContract('join', [
      sumFp,
      fp0,
      fp1,
      balanceHash,
      proof,
    ]);
    return this.waitForTransactionReceipt(result.hash);
  }

  async split(
    sumFp: string,
    fp0: string,
    fp1: string,
    balanceHash0: { h0: string; h1: string },
    balanceHash1: { h0: string; h1: string },
    proof: Proof['proof'],
  ): Promise<providers.TransactionReceipt> {
    // split(bytes32 sumFp, bytes32 fp1, bytes32 fp2, BalanceHash memory balHash0, BalanceHash memory balHash1, Verifier.Proof memory p)
    // create fp1, fp2 in registryservice b4
    const result = await this.writeOperationContract('split', [
      sumFp,
      fp0,
      fp1,
      balanceHash0,
      balanceHash1,
      proof,
    ]);
    this.logger.log(result);
    return this.waitForTransactionReceipt(result.hash);
  }
}
