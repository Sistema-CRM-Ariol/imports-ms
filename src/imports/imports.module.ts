import { Module } from '@nestjs/common';
import { ImportsService } from './imports.service';
import { ImportsController } from './imports.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { NatsModule } from 'src/transports/nats.module';

@Module({
  controllers: [ImportsController],
  providers: [ImportsService],
  imports: [PrismaModule, NatsModule],
})
export class ImportsModule {}
