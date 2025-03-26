import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Module } from '@prisma/client';

@Injectable()
export class ModulesService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    name: string;
    description?: string;
    startDate: Date;
    endDate: Date;
    coachId: string;
    refId: string;
  }): Promise<Module> {
    return this.prisma.module.create({
      data,
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
}