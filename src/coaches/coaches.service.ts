import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Coach } from '@prisma/client';
import * as fs from 'fs';

@Injectable()
export class CoachesService {
  private readonly logger = new Logger(CoachesService.name);

  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
  ) {}

  async create(data: {
    firstName: string;
    lastName: string;
    phone?: string;
    email: string;
    password: string;
    refId?: string;
    photoFile?: Express.Multer.File;
  }): Promise<Coach> {
    this.logger.log('Creating coach with data:', {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      refId: data.refId
    });

    const existingCoach = await this.prisma.coach.findFirst({
      where: {
        OR: [
          { phone: data.phone },
          {
            user: {
              email: data.email,
            },
          },
        ],
      },
    });

    if (existingCoach) {
      throw new ConflictException('Un coach avec cet email ou ce téléphone existe déjà');
    }

    let photoUrl: string | undefined;
    
    // Process photo if provided
    if (data.photoFile) {
      this.logger.log('Photo file received, processing...');
      
      try {
        // First try Cloudinary upload
        this.logger.log('Attempting to upload to Cloudinary...');
        const result = await this.cloudinary.uploadFile(data.photoFile, 'coaches');
        photoUrl = result.url;
        this.logger.log('Successfully uploaded to Cloudinary:', photoUrl);
      } catch (cloudinaryError) {
        this.logger.error('Cloudinary upload failed:', cloudinaryError);
        
        // Fallback to local storage
        try {
          this.logger.log('Falling back to local storage...');
          // Create uploads directory if it doesn't exist
          if (!fs.existsSync('./uploads/coaches')) {
            fs.mkdirSync('./uploads/coaches', { recursive: true });
          }
          
          // Generate unique filename
          const uniquePrefix = Date.now() + '-' + Math.round(Math.random() * 1E9);
          const extension = data.photoFile.originalname.split('.').pop();
          const filename = `${uniquePrefix}.${extension}`;
          const filepath = `./uploads/coaches/${filename}`;
          
          // Write the file
          fs.writeFileSync(filepath, data.photoFile.buffer);
          
          photoUrl = `uploads/coaches/${filename}`;
          this.logger.log(`File saved locally at ${filepath}`);
        } catch (localError) {
          this.logger.error('Local storage fallback failed:', localError);
        }
      }
    }

    const createData: any = {
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      photoUrl,
      user: {
        create: {
          email: data.email,
          password: data.password,
          role: 'COACH',
        },
      },
    };

    if (data.refId) {
      createData.refId = data.refId;
      createData.referential = {
        connect: {
          id: data.refId
        }
      };
    }

    this.logger.log('Creating coach with final data:', createData);

    return this.prisma.coach.create({
      data: createData,
      include: {
        user: true,
        referential: true,
      },
    });
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