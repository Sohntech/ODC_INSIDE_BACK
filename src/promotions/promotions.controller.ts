import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { PromotionsService } from './promotions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { memoryStorage } from 'multer';
import { CreatePromotionDto } from './dto/create-promotion.dto';

@ApiTags('promotions')
@Controller('promotions')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PromotionsController {
  private readonly logger = new Logger(PromotionsController.name);

  constructor(private readonly promotionsService: PromotionsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('photoFile'))
  async create(
    @Body() createPromotionDto: CreatePromotionDto,
    @UploadedFile() photoFile?: Express.Multer.File
  ) {
    return this.promotionsService.create(createPromotionDto, photoFile);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer toutes les promotions' })
  async findAll() {
    return this.promotionsService.findAll();
  }

  @Get('active')
  @ApiOperation({ summary: 'Récupérer la promotion active' })
  async getActivePromotion() {
    return this.promotionsService.getActivePromotion();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une promotion par ID' })
  async findOne(@Param('id') id: string) {
    return this.promotionsService.findOne(id);
  }

  @Get(':id/statistics')
  @ApiOperation({ summary: 'Récupérer les statistiques d\'une promotion' })
  async getStatistics(@Param('id') id: string) {
    return this.promotionsService.getStatistics(id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Mettre à jour une promotion' })
  async update(@Param('id') id: string, @Body() data: any) {
    return this.promotionsService.update(id, data);
  }
}