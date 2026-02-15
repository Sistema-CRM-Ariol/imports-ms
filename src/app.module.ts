import { Module } from '@nestjs/common';
import { ImportsModule } from './imports/imports.module';
import { NatsModule } from './transports/nats.module';

@Module({
  imports: [ImportsModule, NatsModule],
})
export class AppModule {}
