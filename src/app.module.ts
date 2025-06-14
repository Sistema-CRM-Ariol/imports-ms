import { Module } from '@nestjs/common';
import { ImportsModule } from './imports/imports.module';
import { ProvidersModule } from './providers/providers.module';

@Module({
  imports: [ImportsModule, ProvidersModule],
})
export class AppModule {}
