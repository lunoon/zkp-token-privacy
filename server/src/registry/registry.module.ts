import { Module } from '@nestjs/common';
import { RegistryService } from './registry.service';
import { RegistryController } from './registry.controller';
import { RegistryEntry } from './entities/registry-entry.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Web3Service } from 'src/web3/web3.service';
import { Witness } from 'src/zkp/entities/witness.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RegistryEntry, Witness])],
  controllers: [RegistryController],
  providers: [RegistryService, Web3Service],
})
export class RegistryModule {}
