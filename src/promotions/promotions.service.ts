import { Injectable, ConflictException, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Promotion, PromotionStatus } from '@prisma/client';
import * as fs from 'fs';
import { CreatePromotionDto } from './dto/create-promotion.dto';

@Injectable()
export class PromotionsService {
  private readonly logger = new Logger(PromotionsService.name);

  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
  ) {}

  async create(data: CreatePromotionDto, photoFile?: Express.Multer.File): Promise<Promotion> {
    try {
      return await this.prisma.$transaction(async (prisma) => {
        // Check for active promotion first
        const activePromotion = await prisma.promotion.findFirst({
          where: { status: PromotionStatus.ACTIVE }
        });

        // Handle photo upload
        let photoUrl = undefined;
        if (photoFile) {
          const uploadResult = await this.cloudinary.uploadFile(photoFile, 'promotions');
          photoUrl = uploadResult.url;
        }

        // Clean and validate referentialIds
        const referentialIds = Array.isArray(data.referentialIds) 
          ? data.referentialIds.filter(Boolean)
          : [];

        this.logger.debug(`Processing referentialIds: ${referentialIds.join(', ')}`);

        // Verify referentials exist
        if (referentialIds.length > 0) {
          const existingReferentials = await prisma.referential.findMany({
            where: { id: { in: referentialIds } },
            select: { id: true }
          });

          if (existingReferentials.length !== referentialIds.length) {
            const foundIds = existingReferentials.map(ref => ref.id);
            const missingIds = referentialIds.filter(id => !foundIds.includes(id));
            throw new NotFoundException(`Referentials not found: ${missingIds.join(', ')}`);
          }
        }

        // Prepare creation data
        const createData = {
          name: data.name,
          startDate: new Date(data.startDate),
          endDate: new Date(data.endDate),
          photoUrl,
          status: activePromotion ? PromotionStatus.INACTIVE : PromotionStatus.ACTIVE,
          referentials: referentialIds.length > 0 
            ? { connect: referentialIds.map(id => ({ id })) }
            : undefined
        };

        this.logger.debug(`Creating promotion with data: ${JSON.stringify(createData, null, 2)}`);

        // Create the promotion
        const newPromotion = await prisma.promotion.create({
          data: createData,
          include: {
            referentials: true,
            learners: true
          }
        });

        return newPromotion;
      });
    } catch (error) {
      this.logger.error(`Promotion creation failed: ${error.message}`);
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
    return await this.prisma.$transaction(async (prisma) => {
      const promotion = await this.findOne(id);

      // If trying to activate this promotion
      if (data.status === PromotionStatus.ACTIVE) {
        // Find current active promotion
        const activePromotion = await prisma.promotion.findFirst({
          where: {
            status: PromotionStatus.ACTIVE,
            id: { not: id },
          },
        });

        if (activePromotion) {
          // Deactivate current active promotion
          await prisma.promotion.update({
            where: { id: activePromotion.id },
            data: { status: PromotionStatus.INACTIVE }
          });
        }
      }

      // Update the promotion
      return prisma.promotion.update({
        where: { id },
        data,
        include: {
          learners: true,
          referentials: true,
        },
      });
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