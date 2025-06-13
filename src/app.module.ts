import { Module } from '@nestjs/common';
import { ImportsModule } from './imports/imports.module';

@Module({
  imports: [ImportsModule],
})
export class AppModule {}
