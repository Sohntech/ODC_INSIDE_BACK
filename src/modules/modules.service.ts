import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Module } from '@prisma/client';
import { CreateModuleDto } from './dto/create-module.dto';

@Injectable()
export class ModulesService {
  private readonly logger = new Logger(ModulesService.name);

  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
  ) {}

  async create(data: CreateModuleDto, photoFile?: Express.Multer.File): Promise<Module> {
    this.logger.log('Creating module with data:', { ...data, hasPhoto: !!photoFile });

    // Handle photo upload first if provided
    let photoUrl: string | undefined;
    if (photoFile) {
      try {
        this.logger.log(`Uploading photo: ${photoFile.originalname}`);
        const uploadResult = await this.cloudinary.uploadFile(photoFile, 'modules');
        photoUrl = uploadResult.url;
        this.logger.log('Photo uploaded successfully', { photoUrl });
      } catch (error) {
        this.logger.error('Failed to upload photo:', error);
        throw new Error(`Failed to upload photo: ${error.message}`);
      }
    }

    return this.prisma.module.create({
      data: {
        name: data.name,
        description: data.description,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        photoUrl,
        coach: {
          connect: { id: data.coachId }
        },
        referential: {
          connect: { id: data.refId }
        }
      },
      include: {
        coach: true,
        referential: true,
        grades: true,
      },
    });
  }

  async findAll(): Promise<Module[]> {
    return this.prisma.module.findMany({
      include: {
        coach: true,
        referential: true,
        grades: true,
      },
    });
  }

  async findOne(id: string): Promise<Module> {
    const module = await this.prisma.module.findUnique({
      where: { id },
      include: {
        coach: true,
        referential: true,
        grades: true,
      },
    });

    if (!module) {
      throw new NotFoundException('Module non trouvé');
    }

    return module;
  }

  async update(id: string, data: Partial<Module>): Promise<Module> {
    const module = await this.findOne(id);

    return this.prisma.module.update({
      where: { id },
      data,
      include: {
        coach: true,
        referential: true,
        grades: true,
      },
    });
  }

  async addGrade(data: {
    moduleId: string;
    learnerId: string;
    value: number;
    comment?: string;
  }) {
    const module = await this.findOne(data.moduleId);

    return this.prisma.grade.create({
      data: {
        value: data.value,
        comment: data.comment,
        moduleId: data.moduleId,
        learnerId: data.learnerId,
      },
      include: {
        module: true,
        learner: true,
      },
    });
  }

  async updateGrade(gradeId: string, data: {
    value: number;
    comment?: string;
  }) {
    return this.prisma.grade.update({
      where: { id: gradeId },
      data,
      include: {
        module: true,
        learner: true,
      },
    });
  }

  async getActiveModules(): Promise<Module[]> {
    const now = new Date();
    return this.prisma.module.findMany({
      where: {
        startDate: {
          lte: now,
        },
        endDate: {
          gte: now,
        },
      },
      include: {
        coach: true,
        referential: true,
        grades: true,
      },
    });
  }

  async getModulesByReferential(refId: string): Promise<Module[]> {
    return this.prisma.module.findMany({
      where: {
        refId,
      },
      include: {
        coach: true,
        referential: true,
        grades: true,
      },
    });
  }

  async getGradesByModule(moduleId: string) {
    const module = await this.prisma.module.findUnique({
      where: { id: moduleId },
      include: {
        grades: {
          include: {
            learner: {
              include: {
                referential: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              },
            }
          }
        }
      }
    });

    if (!module) {
      throw new NotFoundException(`Module with ID ${moduleId} not found`);
    }

    return module.grades.map(grade => ({
      id: grade.id,
      value: grade.value,
      comment: grade.comment,
      createdAt: grade.createdAt,
      learner: {
        id: grade.learner.id,
        firstName: grade.learner.firstName,
        lastName: grade.learner.lastName,
        matricule: grade.learner.matricule,
        photoUrl: grade.learner.photoUrl,
        referential: grade.learner.referential
      }
    }));
  }
}