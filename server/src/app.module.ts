import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ZkpModule } from './zkp/zkp.module';
import { RegistryModule } from './registry/registry.module';
import { LoggerMiddleware } from './logger.middleware';
import { ZokratesService } from './zokrates/zokrates.service';
import { Web3Service } from './web3/web3.service';

@Module({
  imports: [
    ZkpModule,
    RegistryModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'zk-server-db',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'postgres',
      synchronize: true,
      autoLoadEntities: true,
      namingStrategy: new SnakeNamingStrategy(),
    }),
  ],
  controllers: [AppController],
  providers: [AppService, ZokratesService, Web3Service],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes(
        { path: '/zkp/*', method: RequestMethod.ALL },
        { path: '/registry/*', method: RequestMethod.ALL },
      );
  }
}
