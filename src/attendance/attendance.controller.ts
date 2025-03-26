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
import { AttendanceService } from './attendance.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, AbsenceStatus } from '@prisma/client';

@ApiTags('attendance')
@Controller('attendance')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('learner/:id/scan')
  @Roles(UserRole.VIGIL)
  @ApiOperation({ summary: 'Scanner un apprenant' })
  async scanLearner(@Param('id') id: string) {
    return this.attendanceService.scanLearner(id);
  }

  @Post('coach/:id/scan')
  @Roles(UserRole.VIGIL)
  @ApiOperation({ summary: 'Scanner un coach' })
  async scanCoach(@Param('id') id: string) {
    return this.attendanceService.scanCoach(id);
  }

  @Post('absence/:id/justify')
  @Roles(UserRole.APPRENANT)
  @UseInterceptors(FileInterceptor('document'))
  @ApiOperation({ summary: 'Soumettre une justification d\'absence' })
  @ApiConsumes('multipart/form-data')
  async submitJustification(
    @Param('id') id: string,
    @Body('justification') justification: string,
    @UploadedFile() document?: Express.Multer.File,
  ) {
    let documentUrl: string | undefined;
    if (document) {
      // Upload document to Cloudinary and get URL
      // documentUrl = await this.cloudinaryService.uploadFile(document);
    }

    return this.attendanceService.submitAbsenceJustification(
      id,
      justification,
      documentUrl,
    );
  }

  @Put('absence/:id/status')
  @Roles(UserRole.ADMIN, UserRole.COACH)
  @ApiOperation({ summary: 'Mettre à jour le statut d\'une absence' })
  async updateAbsenceStatus(
    @Param('id') id: string,
    @Body('status') status: AbsenceStatus,
  ) {
    return this.attendanceService.updateAbsenceStatus(id, status);
  }

  @Get('scans/latest')
  @Roles(UserRole.VIGIL)
  @ApiOperation({ summary: 'Récupérer les derniers scans' })
  async getLatestScans() {
    return this.attendanceService.getLatestScans();
  }
}