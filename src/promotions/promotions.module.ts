import { Module } from '@nestjs/common';
import { PromotionsService } from './promotions.service';
import { PromotionsController } from './promotions.controller';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [CloudinaryModule],
  providers: [PromotionsService],
  controllers: [PromotionsController],
  exports: [PromotionsService],
})
export class PromotionsModule {}