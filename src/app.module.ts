import { Module } from '@nestjs/common';
import { InfrastructureModule } from './infrastructures/infrastructure.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [InfrastructureModule, ConfigModule.forRoot({ isGlobal: true })],
})
export class AppModule {}
