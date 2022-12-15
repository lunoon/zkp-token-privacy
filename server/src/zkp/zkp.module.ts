import { Module } from '@nestjs/common';
import { ZkpService } from './zkp.service';
import { ZkpController } from './zkp.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ZokratesService } from 'src/zokrates/zokrates.service';
import { RegistryEntry } from 'src/registry/entities/registry-entry.entity';
import { Witness } from './entities/witness.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RegistryEntry, Witness])],
  controllers: [ZkpController],
  providers: [ZkpService, ZokratesService],
})
export class ZkpModule {}
