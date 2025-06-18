import { Module } from '@nestjs/common';
import { ImportsModule } from './imports/imports.module';
import { ProvidersModule } from './providers/providers.module';
import { NatsModule } from './transports/nats.module';

@Module({
  imports: [ImportsModule, ProvidersModule, NatsModule],
})
export class AppModule {}
