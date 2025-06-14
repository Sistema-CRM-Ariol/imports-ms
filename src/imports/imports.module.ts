import { Module } from '@nestjs/common';
import { ImportsService } from './imports.service';
import { ImportsController } from './imports.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [ImportsController],
  providers: [ImportsService],
  imports: [PrismaModule],
})
export class ImportsModule {}
