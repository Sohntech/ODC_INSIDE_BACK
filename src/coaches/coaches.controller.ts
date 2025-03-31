import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import * as path from 'path';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { CoachesService } from './coaches.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { CreateCoachDto } from './dto/create-coach.dto';

@ApiTags('coaches')
@Controller('coaches')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CoachesController {
  constructor(private readonly coachesService: CoachesService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('photoFile', {
    storage: memoryStorage(),
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/^image\/(jpg|jpeg|png|gif)$/)) {
        return cb(new Error('Only image files are allowed!'), false);
      }
      cb(null, true);
    },
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    }
  }))
  @ApiOperation({ summary: 'Create a new coach' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Coach created' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        phone: { type: 'string' },
        email: { type: 'string' },
        refId: { type: 'string' },
        photoFile: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async create(
    @Body() createCoachDto: CreateCoachDto,
    @UploadedFile() photoFile?: Express.Multer.File,
  ) {
    if (photoFile) {
      console.log(`Received file: ${photoFile.originalname}, size: ${photoFile.size} bytes`);
    }
    return this.coachesService.create(createCoachDto, photoFile);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer tous les coachs' })
  async findAll() {
    return this.coachesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un coach par ID' })
  async findOne(@Param('id') id: string) {
    return this.coachesService.findOne(id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Mettre à jour un coach' })
  async update(@Param('id') id: string, @Body() data: any) {
    return this.coachesService.update(id, data);
  }

  @Get(':id/attendance-stats')
  @ApiOperation({ summary: 'Récupérer les statistiques de présence d\'un coach' })
  async getAttendanceStats(@Param('id') id: string) {
    return this.coachesService.getAttendanceStats(id);
  }
}