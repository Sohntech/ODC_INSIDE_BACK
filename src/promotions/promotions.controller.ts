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

@ApiTags('promotions')
@Controller('promotions')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PromotionsController {
  private readonly logger = new Logger(PromotionsController.name);

  constructor(private readonly promotionsService: PromotionsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @UseInterceptors(
    FileInterceptor('photoFile', {
      storage: memoryStorage(),
    })
  )
  @ApiOperation({ summary: 'Créer une nouvelle promotion' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Promotion créée' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        startDate: { type: 'string', format: 'date-time' },
        endDate: { type: 'string', format: 'date-time' },
        photoFile: { 
          type: 'string', 
          format: 'binary' 
        },
      },
      required: ['name', 'startDate', 'endDate'],
    },
  })
  async create(
    @Body() formData: any,
    @UploadedFile() photoFile?: Express.Multer.File
  ) {
    this.logger.log('Form data received:', formData);
    
    // Log detailed information about the file
    if (photoFile) {
      this.logger.log('Photo file received:', {
        originalname: photoFile.originalname,
        mimetype: photoFile.mimetype,
        size: photoFile.size,
        buffer: photoFile.buffer ? `Buffer size: ${photoFile.buffer.length} bytes` : 'No buffer',
      });
    } else {
      this.logger.log('No photo file received');
    }
    
    try {
      // Clean input data from extra quotes
      let name = formData.name;
      let startDate = formData.startDate;
      let endDate = formData.endDate;
      
      // Remove quotes if they exist
      if (typeof name === 'string' && name.startsWith('"') && name.endsWith('"')) {
        name = name.substring(1, name.length - 1);
      }
      
      if (typeof startDate === 'string' && startDate.startsWith('"') && startDate.endsWith('"')) {
        startDate = startDate.substring(1, startDate.length - 1);
      }
      
      if (typeof endDate === 'string' && endDate.startsWith('"') && endDate.endsWith('"')) {
        endDate = endDate.substring(1, endDate.length - 1);
      }
      
      // Create data object with cleaned values
      const createData = {
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      };
      
      // Check if dates are valid
      if (isNaN(createData.startDate.getTime()) || isNaN(createData.endDate.getTime())) {
        throw new BadRequestException('Invalid date format. Use ISO format (YYYY-MM-DDTHH:mm:ss.sssZ)');
      }
      
      this.logger.log('Processed data:', createData);
      
      return this.promotionsService.create(createData, photoFile);
    } catch (error) {
      this.logger.error('Error creating promotion:', error);
      throw error;
    }
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