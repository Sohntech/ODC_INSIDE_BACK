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
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiConsumes } from '@nestjs/swagger';
import { CoachesService } from './coaches.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('coaches')
@Controller('coaches')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CoachesController {
  constructor(private readonly coachesService: CoachesService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('photoFile'))
  @ApiOperation({ summary: 'Créer un nouveau coach' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Coach créé' })
  @ApiConsumes('multipart/form-data')
  async create(@Body() data: any, @UploadedFile() photoFile?: Express.Multer.File) {
    return this.coachesService.create({ ...data, photoFile });
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