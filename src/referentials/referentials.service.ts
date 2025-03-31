import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Referential } from '@prisma/client';

@Injectable()
export class ReferentialsService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    name: string;
    description?: string;
    photoUrl?: string;
    capacity: number;
  }): Promise<Referential> {
    // Remove promotionId dependency
    return this.prisma.referential.create({
      data: {
        ...data,
        promotions: undefined, // Provide a default value or adjust as needed
      },
      include: {
        learners: true,
        coaches: true,
        modules: true,
        promotions: true, // Include promotions in response
      },
    });
  }

  async findAll(): Promise<Referential[]> {
    return this.prisma.referential.findMany({
      include: {
        learners: true,
        coaches: true,
        modules: true,
      },
    });
  }

  async findOne(id: string): Promise<Referential> {
    const referential = await this.prisma.referential.findUnique({
      where: { id },
      include: {
        learners: true,
        coaches: true,
        modules: true,
      },
    });

    if (!referential) {
      throw new NotFoundException('Référentiel non trouvé');
    }

    return referential;
  }

  async update(id: string, data: Partial<Referential>): Promise<Referential> {
    const referential = await this.findOne(id);

    return this.prisma.referential.update({
      where: { id },
      data,
      include: {
        learners: true,
        coaches: true,
        modules: true,
      },
    });
  }

  async getStatistics(id: string) {
    const referential = await this.findOne(id);
    
    const totalLearners = await this.prisma.learner.count({
      where: { refId: id },
    });

    const activeModules = await this.prisma.module.count({
      where: {
        refId: id,
        endDate: {
          gte: new Date(),
        },
        startDate: {
          lte: new Date(),
        },
      },
    });

    const totalCoaches = await this.prisma.coach.count({
      where: { refId: id },
    });

    return {
      totalLearners,
      activeModules,
      totalCoaches,
      capacity: referential.capacity,
      availableSpots: referential.capacity - totalLearners,
    };
  }

  // Add method to assign referentials to a promotion
  async assignToPromotion(referentialIds: string[], promotionId: string) {
    return this.prisma.promotion.update({
      where: { id: promotionId },
      data: {
        referentials: {
          connect: referentialIds.map(id => ({ id })),
        },
      },
      include: {
        referentials: true,
      },
    });
  }
}