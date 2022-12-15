import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { CreateRegistryRequest } from './dto/create-registry-request.dto';
import { CreateRegistryResponse } from './dto/create-registry-response.dto';
import { JoinRegistryRequest } from './dto/join-registry-request.dto';
import { JoinRegistryResponse } from './dto/join-registry-response.dto';
import { SplitRegistryRequest } from './dto/split-registry-request.dto';
import { SplitRegistryResponse } from './dto/split-registry-response.dto';
import { TransferRegistryRequest } from './dto/transfer-registry-request.dto';
import { TransferRegistryResponse } from './dto/transfer-registry-response.dto';
import { RegistryService } from './registry.service';

@Controller('registry')
export class RegistryController {
  constructor(private readonly registryService: RegistryService) {}

  @Get('/fingerprint/:fp')
  async findByFingerprint(@Param('fp') fp) {
    return await this.registryService.findByFingerprint(fp);
  }

  @Get('/private/fingerprint/:fp')
  async findByFingerprintPrivate(@Param('fp') fp) {
    return await this.registryService.findByFingerprintPrivate(fp);
  }

  @Get('/summary*')
  async findAll() {
    return await this.registryService.findAll(process.env.WALLET_ADDRESS);
  }

  @Post('/createRegistryEntry')
  async create(
    @Body() createRegistryRequest: CreateRegistryRequest,
  ): Promise<CreateRegistryResponse> {
    return await this.registryService.create(createRegistryRequest);
  }

  @Post('/transferRegistryEntry')
  async transfer(
    @Body() transferRegistryRequest: TransferRegistryRequest,
  ): Promise<TransferRegistryResponse> {
    return await this.registryService.transfer(transferRegistryRequest);
  }

  @Post('/splitRegistryEntry')
  async split(
    @Body() splitRegistryRequest: SplitRegistryRequest,
  ): Promise<SplitRegistryResponse> {
    return await this.registryService.split(splitRegistryRequest);
  }

  @Post('joinRegistryEntry')
  async join(
    @Body() joinRegistryRequest: JoinRegistryRequest,
  ): Promise<JoinRegistryResponse> {
    return await this.registryService.join(joinRegistryRequest);
  }
}
