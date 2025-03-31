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
  Patch,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiConsumes } from '@nestjs/swagger';
import { LearnersService } from './learners.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, LearnerStatus } from '@prisma/client';
import { ReplaceLearnerDto, UpdateStatusDto } from './dto/update-status.dto';

@ApiTags('learners')
@Controller('learners')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class LearnersController {
  constructor(private readonly learnersService: LearnersService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('photoFile'))
  @ApiOperation({ summary: 'Créer un nouvel apprenant' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Apprenant créé' })
  @ApiConsumes('multipart/form-data')
  async create(@Body() data: any, @UploadedFile() photoFile?: Express.Multer.File) {
    return this.learnersService.create(data, photoFile);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer tous les apprenants' })
  async findAll() {
    return this.learnersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un apprenant par ID' })
  async findOne(@Param('id') id: string) {
    return this.learnersService.findOne(id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Mettre à jour un apprenant' })
  async update(@Param('id') id: string, @Body() data: any) {
    return this.learnersService.update(id, data);
  }

  @Put(':id/status')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Mettre à jour le statut d\'un apprenant' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: LearnerStatus,
  ) {
    return this.learnersService.updateStatus(id, status);
  }

  @Put(':id/kit')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Mettre à jour le kit d\'un apprenant' })
  async updateKit(@Param('id') id: string, @Body() kitData: any) {
    return this.learnersService.updateKit(id, kitData);
  }

  @Post(':id/documents')
  @Roles(UserRole.ADMIN, UserRole.APPRENANT)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Télécharger un document pour un apprenant' })
  @ApiConsumes('multipart/form-data')
  async uploadDocument(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('type') type: string,
    @Body('name') name: string,
  ) {
    return this.learnersService.uploadDocument(id, file, type, name);
  }

  @Get(':id/attendance-stats')
  @ApiOperation({ summary: 'Récupérer les statistiques de présence d\'un apprenant' })
  async getAttendanceStats(@Param('id') id: string) {
    return this.learnersService.getAttendanceStats(id);
  }

  // ...existing code...

@Patch(':id/status')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
async patchUpdateStatus(
  @Param('id') id: string,
  @Body() updateStatusDto: UpdateStatusDto
) {
  return this.learnersService.updateLearnerStatus(id, updateStatusDto);
}

@Post('replace')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
async replaceLearner(@Body() replacementDto: ReplaceLearnerDto) {
  return this.learnersService.replaceLearner(replacementDto);
}

@Get('waiting-list')
@UseGuards(JwtAuthGuard)
async getWaitingList(@Query('promotionId') promotionId?: string) {
  return this.learnersService.getWaitingList(promotionId);
}

@Get(':id/status-history')
@UseGuards(JwtAuthGuard)
async getStatusHistory(@Param('id') id: string) {
  return this.learnersService.getStatusHistory(id);
}
}