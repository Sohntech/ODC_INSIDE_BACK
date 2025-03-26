import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  HttpStatus,
  BadRequestException,
  UploadedFile,
  UseInterceptors,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiConsumes } from '@nestjs/swagger';
import { ReferentialsService } from './referentials.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

// Define a DTO for referential creation to ensure proper validation
interface CreateReferentialDto {
  name: string;
  description?: string;
  photoUrl?: string;
  capacity: number;
  promotionId: string;
}

@ApiTags('referentials')
@Controller('referentials')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ReferentialsController {
  private readonly logger = new Logger(ReferentialsController.name);

  constructor(
    private readonly referentialsService: ReferentialsService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Créer un nouveau référentiel' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Référentiel créé' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('photoUrl'))
  async create(
    @Body() formData: any,
    @UploadedFile() photoFile?: Express.Multer.File,
  ) {
    this.logger.log(`Received form data: ${JSON.stringify(formData)}`);
    
    // Extract and validate required fields
    const name = formData.name;
    const capacity = parseInt(formData.capacity, 10);
    const promotionId = formData.promotionId;
    const description = formData.description;
    
    // Validate required fields
    if (!name) {
      throw new BadRequestException('Le champ "name" est requis');
    }
    if (isNaN(capacity)) {
      throw new BadRequestException('Le champ "capacity" est requis et doit être un nombre');
    }
    if (!promotionId) {
      throw new BadRequestException('Le champ "promotionId" est requis');
    }
    
    // Prepare data for service
    const createData: CreateReferentialDto = {
      name,
      description,
      capacity,
      promotionId,
    };
    
    // Handle photo upload if provided
    if (photoFile) {
      try {
        const uploadResult = await this.cloudinaryService.uploadFile(photoFile, 'referentials');
        createData.photoUrl = uploadResult.url;
      } catch (error) {
        this.logger.error(`Error uploading photo: ${error.message}`);
        // Continue without photo if upload fails
      }
    }
    
    this.logger.log(`Creating referential with data: ${JSON.stringify(createData)}`);
    return this.referentialsService.create(createData);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer tous les référentiels' })
  async findAll() {
    return this.referentialsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un référentiel par ID' })
  async findOne(@Param('id') id: string) {
    return this.referentialsService.findOne(id);
  }

  @Get(':id/statistics')
  @ApiOperation({ summary: 'Récupérer les statistiques d\'un référentiel' })
  async getStatistics(@Param('id') id: string) {
    return this.referentialsService.getStatistics(id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Mettre à jour un référentiel' })
  async update(@Param('id') id: string, @Body() data: Partial<CreateReferentialDto>) {
    // Ensure we have at least one valid field to update
    if (Object.keys(data).length === 0) {
      throw new BadRequestException('Aucune donnée fournie pour la mise à jour');
    }
    
    return this.referentialsService.update(id, data);
  }
}