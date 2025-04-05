import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
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
import { CoachScanResponse, LearnerScanResponse } from './interfaces/scan-response.interface';

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

  @Post('scan')
  @ApiOperation({ summary: 'Scan QR code for attendance' })
  @ApiResponse({ status: 200, description: 'Successfully scanned' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 409, description: 'Already scanned today' })
  async scan(
    @Body('matricule') matricule: string
  ): Promise<LearnerScanResponse | CoachScanResponse> {
    return this.attendanceService.scan(matricule);
  }

  @Post('scan/learner')
  @Roles('VIGIL')
  @ApiOperation({ summary: 'Scan a learner attendance' })
  @ApiResponse({ status: 201, description: 'Attendance recorded successfully' })
  @ApiResponse({ status: 404, description: 'Learner not found' })
  async scanLearner(
    @Body() body: { matricule: string }
  ) {
    return this.attendanceService.scanLearner(body.matricule);
  }

  @Post('scan/coach')
  @Roles('VIGIL')
  @ApiOperation({ summary: 'Scan a coach attendance' })
  @ApiResponse({ status: 201, description: 'Attendance recorded successfully' })
  @ApiResponse({ status: 404, description: 'Coach not found' })
  async scanCoach(
    @Body() body: { matricule: string }
  ) {
    return this.attendanceService.scanCoach(body.matricule);
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

  @Get('stats/daily')
  async getDailyStats(@Query('date') date: string) {
    return this.attendanceService.getDailyStats(date);
  }

  @Get('stats/monthly')
  async getMonthlyStats(
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    return this.attendanceService.getMonthlyStats(
      parseInt(year, 10),
      parseInt(month, 10),
    );
  }

  @Get('stats/yearly')
  async getYearlyStats(@Query('year') year: string) {
    return this.attendanceService.getYearlyStats(parseInt(year, 10));
  }
}