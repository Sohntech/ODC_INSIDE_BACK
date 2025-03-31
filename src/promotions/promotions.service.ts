import { Injectable, ConflictException, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Promotion, PromotionStatus } from '@prisma/client';
import * as fs from 'fs';

@Injectable()
export class PromotionsService {
  private readonly logger = new Logger(PromotionsService.name);

  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
  ) {}

  async create(data: {
    name: string;
    startDate: Date;
    endDate: Date;
    photoUrl?: string;
    referentialIds?: string | string[];
  }, photoFile?: Express.Multer.File): Promise<Promotion> {
    try {
      // Parse referentialIds
      let processedReferentialIds: string[] = [];
      if (data.referentialIds) {
        try {
          processedReferentialIds = typeof data.referentialIds === 'string' 
            ? JSON.parse(data.referentialIds.replace(/\s/g, ''))
            : data.referentialIds;
        } catch (e) {
          this.logger.error(`Error parsing referentialIds: ${e.message}`);
          throw new ConflictException('Invalid referentialIds format');
        }
      }

      this.logger.debug(`Processed referentialIds: ${JSON.stringify(processedReferentialIds)}`);

      // Handle file upload
      let photoUrl = data.photoUrl;
      if (photoFile) {
        const uploadResult = await this.cloudinary.uploadFile(photoFile, 'promotions');
        photoUrl = uploadResult.url;
      }

      return await this.prisma.$transaction(async (prisma) => {
        // First verify all referentials exist
        if (processedReferentialIds.length > 0) {
          const existingReferentials = await prisma.referential.findMany({
            where: { id: { in: processedReferentialIds } },
            select: { id: true, name: true }
          });

          this.logger.debug(`Found referentials: ${JSON.stringify(existingReferentials)}`);

          if (existingReferentials.length !== processedReferentialIds.length) {
            const foundIds = existingReferentials.map(ref => ref.id);
            const missingIds = processedReferentialIds.filter(id => !foundIds.includes(id));
            throw new NotFoundException(`Referentials not found: ${missingIds.join(', ')}`);
          }
        }

        // Create promotion with verified referentials
        const createData = {
          name: data.name,
          startDate: new Date(data.startDate),
          endDate: new Date(data.endDate),
          photoUrl,
          status: PromotionStatus.ACTIVE,
          referentials: processedReferentialIds.length > 0 ? {
            connect: processedReferentialIds.map(id => ({ id }))
          } : undefined
        };

        this.logger.log('Creating promotion with data:', JSON.stringify(createData, null, 2));

        return prisma.promotion.create({
          data: createData,
          include: {
            referentials: true,
            learners: true
          }
        });
      });
    } catch (error) {
      this.logger.error(`Creation failed: ${error.message}`);
      throw error;
    }
  }

  async findAll(): Promise<Promotion[]> {
    return this.prisma.promotion.findMany({
      include: {
        learners: true,
        referentials: true,
      },
    });
  }

  async findOne(id: string): Promise<Promotion> {
    const promotion = await this.prisma.promotion.findUnique({
      where: { id },
      include: {
        referentials: true,
        learners: true,
        events: true,
      }
    });

    if (!promotion) {
      throw new NotFoundException(`Promotion with ID ${id} not found`);
    }

    return promotion;
  }

  async update(id: string, data: Partial<Promotion>): Promise<Promotion> {
    const promotion = await this.findOne(id);

    if (data.status === PromotionStatus.ACTIVE) {
      const activePromotion = await this.prisma.promotion.findFirst({
        where: {
          status: PromotionStatus.ACTIVE,
          id: { not: id },
        },
      });

      if (activePromotion) {
        throw new ConflictException('Une autre promotion est déjà active');
      }
    }

    return this.prisma.promotion.update({
      where: { id },
      data,
      include: {
        learners: true,
        referentials: true,
      },
    });
  }

  async getActivePromotion(): Promise<Promotion> {
    const promotion = await this.prisma.promotion.findFirst({
      where: { status: PromotionStatus.ACTIVE },
      include: {
        learners: true,
        referentials: true,
        events: true,
      },
    });

    if (!promotion) {
      throw new NotFoundException('Aucune promotion active trouvée');
    }

    return promotion;
  }

  async getStatistics(id: string) {
    const promotion = await this.findOne(id);
    const learners = await this.prisma.learner.findMany({
      where: { promotionId: id },
    });

    const totalLearners = learners.length;
    const femaleLearners = learners.filter(l => l.gender === 'FEMALE').length;
    const feminizationRate = totalLearners > 0 ? (femaleLearners / totalLearners) * 100 : 0;

    const activeModules = await this.prisma.module.count({
      where: {
        referential: {
          promotions: { some: { id } },
        },
        endDate: {
          gte: new Date(),
        },
        startDate: {
          lte: new Date(),
        },
      },
    });

    const upcomingEvents = await this.prisma.event.count({
      where: {
        promotionId: id,
        startDate: {
          gte: new Date(),
        },
      },
    });

    return {
      totalLearners,
      feminizationRate,
      activeModules,
      upcomingEvents,
    };
  }
}