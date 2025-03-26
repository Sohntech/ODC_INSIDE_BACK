import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ModulesService } from './modules.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('modules')
@Controller('modules')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ModulesController {
  constructor(private readonly modulesService: ModulesService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.COACH)
  @ApiOperation({ summary: 'Créer un nouveau module' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Module créé' })
  async create(@Body() data: any) {
    return this.modulesService.create(data);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer tous les modules' })
  async findAll() {
    return this.modulesService.findAll();
  }

  @Get('active')
  @ApiOperation({ summary: 'Récupérer les modules actifs' })
  async getActiveModules() {
    return this.modulesService.getActiveModules();
  }

  @Get('referential/:refId')
  @ApiOperation({ summary: 'Récupérer les modules par référentiel' })
  async getModulesByReferential(@Param('refId') refId: string) {
    return this.modulesService.getModulesByReferential(refId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un module par ID' })
  async findOne(@Param('id') id: string) {
    return this.modulesService.findOne(id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.COACH)
  @ApiOperation({ summary: 'Mettre à jour un module' })
  async update(@Param('id') id: string, @Body() data: any) {
    return this.modulesService.update(id, data);
  }

  @Post(':id/grades')
  @Roles(UserRole.ADMIN, UserRole.COACH)
  @ApiOperation({ summary: 'Ajouter une note à un module' })
  async addGrade(
    @Param('id') moduleId: string,
    @Body() data: { learnerId: string; value: number; comment?: string },
  ) {
    return this.modulesService.addGrade({
      moduleId,
      ...data,
    });
  }

  @Put('grades/:gradeId')
  @Roles(UserRole.ADMIN, UserRole.COACH)
  @ApiOperation({ summary: 'Mettre à jour une note' })
  async updateGrade(
    @Param('gradeId') gradeId: string,
    @Body() data: { value: number; comment?: string },
  ) {
    return this.modulesService.updateGrade(gradeId, data);
  }
}