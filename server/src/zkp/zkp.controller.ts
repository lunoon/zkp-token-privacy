import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ZkpService } from './zkp.service';
import { plainToClass } from 'class-transformer';
import { ZkWitnessResponseDto } from './dto/zkwitness.response.dto';
import { ZkProofResponseDto } from './dto/zkproof-response.dto';
import { ZokratesService } from 'src/zokrates/zokrates.service';
import { ZkWitnessRequestDto } from './dto/zkwitness.request.dto';
import { ZkProofSplitRequestDto } from './dto/zkproof-split-request.dto';
import { ZkProofJoinRequestDto } from './dto/zkproof-join-request.dto';

@Controller('zkp')
export class ZkpController {
  private readonly zokratesService = new ZokratesService();
  constructor(private readonly zkpService: ZkpService) {}

  @Get()
  async helloZkp() {
    return 'test';
  }

  @Get('private/witness/:id')
  async findWitnessById(@Param('id') id) {
    return await this.zkpService.findWitnessById(id);
  }

  @Post('/computeWitnessHash')
  async computeWitness(
    @Body() data: ZkWitnessRequestDto,
  ): Promise<ZkWitnessResponseDto> {
    const response: ZkWitnessResponseDto =
      await this.zkpService.computeWitnessHash(data);
    return plainToClass(ZkWitnessResponseDto, response);
  }

  @Post('/createProofJoin')
  async createProofJoin(
    @Body() data: ZkProofJoinRequestDto,
  ): Promise<ZkProofResponseDto> {
    const response: ZkProofResponseDto = await this.zkpService.createProofJoin(
      data,
    );
    return plainToClass(ZkProofResponseDto, response);
  }

  @Post('/createProofSplit')
  async createProofSplit(
    @Body() data: ZkProofSplitRequestDto,
  ): Promise<ZkProofResponseDto> {
    const response: ZkProofResponseDto = await this.zkpService.createProofSplit(
      data,
    );
    return plainToClass(ZkProofResponseDto, response);
  }
}
