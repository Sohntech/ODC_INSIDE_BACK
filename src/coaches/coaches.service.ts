import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Coach, UserRole, PrismaClient } from '@prisma/client';
import { AuthUtils } from '../utils/auth.utils';
import * as fs from 'fs';
import { CreateCoachDto } from './dto/create-coach.dto';
import { MatriculeUtils } from '../utils/matricule.utils';
import * as QRCode from 'qrcode';

@Injectable()
export class CoachesService {
  private readonly logger = new Logger(CoachesService.name);

  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
  ) {}

  async create(createCoachDto: CreateCoachDto, photoFile?: Express.Multer.File): Promise<Coach> {
    this.logger.log('Starting coach creation process...', { 
      hasFile: !!photoFile,
      fileName: photoFile?.originalname,
      fileSize: photoFile?.size
    });

    // Upload photo first if provided
    let photoUrl: string | undefined;
    if (photoFile) {
      try {
        this.logger.log(`Uploading file: ${photoFile.originalname}`);
        const uploadResult = await this.cloudinary.uploadFile(photoFile, 'coaches');
        photoUrl = uploadResult.url;
        this.logger.log('Photo uploaded successfully', { photoUrl });
      } catch (error) {
        this.logger.error('Failed to upload photo:', error);
        throw new Error(`Failed to upload photo: ${error.message}`);
      }
    }

    // Create coach with transaction
    try {
      const coach = await this.prisma.$transaction(async (prisma) => {
        // Check for existing coach
        const existingCoach = await prisma.coach.findFirst({
          where: {
            OR: [
              { phone: createCoachDto.phone },
              { user: { email: createCoachDto.email } },
            ],
          },
        });

        if (existingCoach) {
          throw new ConflictException('Un coach avec cet email ou ce téléphone existe déjà');
        }

        // Fetch referential if refId is provided
        const referential = createCoachDto.refId ? 
          await prisma.referential.findUnique({ where: { id: createCoachDto.refId } }) 
          : null;

        // Generate matricule using the prisma instance from transaction
        const matricule = await MatriculeUtils.generateCoachMatricule(
          prisma as unknown as PrismaClient,
          createCoachDto.firstName,
          createCoachDto.lastName,
          referential?.name
        );

        // Generate and upload QR code
        let qrCodeUrl: string | undefined;
        try {
          const qrCodeBuffer = await QRCode.toBuffer(matricule);
          const qrCodeFile = {
            fieldname: 'qrCode',
            originalname: 'qrcode.png',
            encoding: '7bit',
            mimetype: 'image/png',
            buffer: qrCodeBuffer,
            size: qrCodeBuffer.length,
            stream: null,
            destination: '',
            filename: 'qrcode.png',
            path: '',
          };

          const qrCodeResult = await this.cloudinary.uploadFile(qrCodeFile, 'qrcodes');
          qrCodeUrl = qrCodeResult.url;
        } catch (error) {
          this.logger.error('Failed to generate or upload QR code:', error);
        }

        // Generate password
        const password = AuthUtils.generatePassword();
        const hashedPassword = await AuthUtils.hashPassword(password);

        // Create coach data object
        const coachData = {
          matricule,
          firstName: createCoachDto.firstName,
          lastName: createCoachDto.lastName,
          phone: createCoachDto.phone,
          photoUrl,
          qrCode: qrCodeUrl,  // This now matches the schema
          ...(createCoachDto.refId && {
            referential: {
              connect: { id: createCoachDto.refId }
            }
          }),
          user: {
            create: {
              email: createCoachDto.email,
              password: hashedPassword,
              role: UserRole.COACH
            }
          }
        };

        this.logger.log('Creating coach with data:', coachData);

        const newCoach = await prisma.coach.create({
          data: coachData,
          include: {
            user: true,
            referential: true,
          },
        });

        // Send password email
        await AuthUtils.sendPasswordEmail(createCoachDto.email, password, 'Coach');

        return newCoach;
      }, {
        timeout: 20000 // Increase timeout to 20 seconds
      });

      this.logger.log('Coach created successfully:', coach.id);
      return coach;
    } catch (error) {
      this.logger.error('Failed to create coach:', error);
      throw error;
    }
  }

  async findAll(): Promise<Coach[]> {
    return this.prisma.coach.findMany({
      include: {
        user: true,
        referential: true,
        modules: true,
        attendances: true,
      },
    });
  }

  async findOne(id: string): Promise<Coach> {
    const coach = await this.prisma.coach.findUnique({
      where: { id },
      include: {
        user: true,
        referential: true,
        modules: true,
        attendances: true,
      },
    });

    if (!coach) {
      throw new NotFoundException('Coach non trouvé');
    }

    return coach;
  }

  async update(id: string, data: Partial<Coach>): Promise<Coach> {
    const coach = await this.findOne(id);

    return this.prisma.coach.update({
      where: { id },
      data,
      include: {
        user: true,
        referential: true,
        modules: true,
      },
    });
  }

  async getAttendanceStats(id: string) {
    const coach = await this.findOne(id);
    const totalDays = await this.prisma.coachAttendance.count({
      where: { coachId: id },
    });
    const presentDays = await this.prisma.coachAttendance.count({
      where: { coachId: id, isPresent: true },
    });

    return {
      totalDays,
      presentDays,
      attendanceRate: totalDays > 0 ? (presentDays / totalDays) * 100 : 0,
    };
  }
}