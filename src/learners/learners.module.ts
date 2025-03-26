import { Module } from '@nestjs/common';
import { LearnersService } from './learners.service';
import { LearnersController } from './learners.controller';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [CloudinaryModule],
  providers: [LearnersService],
  controllers: [LearnersController],
  exports: [LearnersService],
})
export class LearnersModule {}