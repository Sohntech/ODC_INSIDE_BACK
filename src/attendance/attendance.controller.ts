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
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiParam } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, AbsenceStatus } from '@prisma/client';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { UpdateAbsenceStatusDto } from './dto/update-absence-status.dto';

@ApiTags('attendance')
@Controller('attendance')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AttendanceController {
  private readonly logger = new Logger(AttendanceController.name);

  constructor(
    private readonly attendanceService: AttendanceService,
    private readonly cloudinaryService: CloudinaryService
  ) {}

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
      try {
        const uploadResult = await this.cloudinaryService.uploadFile(document, 'justifications');
        documentUrl = uploadResult.url;
      } catch (error) {
        this.logger.error(`Failed to upload justification document: ${error.message}`);
        throw new InternalServerErrorException('Failed to upload document');
      }
    }

    return this.attendanceService.submitAbsenceJustification(
      id,
      justification,
      documentUrl,
    );
  }

  @Put('absence/:id/status')
  @Roles(UserRole.ADMIN, UserRole.COACH)
  @ApiOperation({ summary: 'Update absence justification status' })
  @ApiParam({ name: 'id', description: 'Attendance ID' })
  async updateAbsenceStatus(
    @Param('id') id: string,
    @Body() updateDto: UpdateAbsenceStatusDto
  ) {
    return this.attendanceService.updateAbsenceStatus(id, updateDto.status, updateDto.comment);
  }

  @Get('scans/latest')
  @Roles(UserRole.VIGIL)
  @ApiOperation({ summary: 'Récupérer les derniers scans' })
  async getLatestScans() {
    return this.attendanceService.getLatestScans();
  }
}