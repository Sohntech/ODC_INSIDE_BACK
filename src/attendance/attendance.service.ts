import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Cron } from '@nestjs/schedule';
import { AbsenceStatus, LearnerAttendance } from '@prisma/client';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  async scanLearner(learnerId: string): Promise<any> {
    const learner = await this.prisma.learner.findUnique({
      where: { id: learnerId },
      include: {
        user: true,
        referential: true,
      },
    });

    if (!learner) {
      throw new NotFoundException('Apprenant non trouvé');
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const cutoffTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 8, 15);

    const existingAttendance = await this.prisma.learnerAttendance.findFirst({
      where: {
        learnerId,
        date: today,
      },
    });

    const isLate = now > cutoffTime;

    if (existingAttendance) {
      return this.prisma.learnerAttendance.update({
        where: { id: existingAttendance.id },
        data: {
          isPresent: true,
          scanTime: now,
          isLate,
        },
        include: {
          learner: true,
        },
      });
    }

    return this.prisma.learnerAttendance.create({
      data: {
        date: today,
        isPresent: true,
        scanTime: now,
        isLate,
        learnerId,
      },
      include: {
        learner: true,
      },
    });
  }

  async scanCoach(coachId: string): Promise<any> {
    const coach = await this.prisma.coach.findUnique({
      where: { id: coachId },
      include: {
        user: true,
        referential: true,
      },
    });

    if (!coach) {
      throw new NotFoundException('Coach non trouvé');
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const cutoffTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 8, 15);

    const existingAttendance = await this.prisma.coachAttendance.findFirst({
      where: {
        coachId,
        date: today,
      },
    });

    const isLate = now > cutoffTime;

    if (existingAttendance) {
      return this.prisma.coachAttendance.update({
        where: { id: existingAttendance.id },
        data: {
          isPresent: true,
          scanTime: now,
          isLate,
        },
        include: {
          coach: true,
        },
      });
    }

    return this.prisma.coachAttendance.create({
      data: {
        date: today,
        isPresent: true,
        scanTime: now,
        isLate,
        coachId,
      },
      include: {
        coach: true,
      },
    });
  }

  async submitAbsenceJustification(
    attendanceId: string,
    justification: string,
    documentUrl?: string,
  ) {
    return this.prisma.learnerAttendance.update({
      where: { id: attendanceId },
      data: {
        justification,
        documentUrl,
        status: AbsenceStatus.PENDING,
      },
      include: {
        learner: true,
      },
    });
  }

  async updateAbsenceStatus(
    attendanceId: string, 
    status: AbsenceStatus,
    comment?: string
  ): Promise<LearnerAttendance> {
    const attendance = await this.prisma.learnerAttendance.findUnique({
      where: { id: attendanceId },
      include: { learner: true }
    });

    if (!attendance) {
      throw new NotFoundException('Attendance record not found');
    }

    if (attendance.status !== AbsenceStatus.PENDING) {
      throw new BadRequestException('This absence justification has already been processed');
    }

    return this.prisma.learnerAttendance.update({
      where: { id: attendanceId },
      data: { 
        status,
        justificationComment: comment 
      },
      include: {
        learner: true
      }
    });
  }

  async getLatestScans() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const learnerScans = await this.prisma.learnerAttendance.findMany({
      where: {
        date: today,
        isPresent: true,
      },
      include: {
        learner: true,
      },
      orderBy: {
        scanTime: 'desc',
      },
      take: 10,
    });

    const coachScans = await this.prisma.coachAttendance.findMany({
      where: {
        date: today,
        isPresent: true,
      },
      include: {
        coach: true,
      },
      orderBy: {
        scanTime: 'desc',
      },
      take: 10,
    });

    return {
      learnerScans,
      coachScans,
    };
  }

  @Cron('0 0 13 * * 1-5') // Du lundi au vendredi à 13h
  async markAbsentees() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Marquer les apprenants absents
    const learners = await this.prisma.learner.findMany({
      where: {
        status: 'ACTIVE',
      },
    });

    for (const learner of learners) {
      const attendance = await this.prisma.learnerAttendance.findFirst({
        where: {
          learnerId: learner.id,
          date: today,
        },
      });

      if (!attendance) {
        await this.prisma.learnerAttendance.create({
          data: {
            date: today,
            isPresent: false,
            isLate: false,
            learnerId: learner.id,
          },
        });
      }
    }

    // Marquer les coachs absents
    const coaches = await this.prisma.coach.findMany();

    for (const coach of coaches) {
      const attendance = await this.prisma.coachAttendance.findFirst({
        where: {
          coachId: coach.id,
          date: today,
        },
      });

      if (!attendance) {
        await this.prisma.coachAttendance.create({
          data: {
            date: today,
            isPresent: false,
            isLate: false,
            coachId: coach.id,
          },
        });
      }
    }
  }
}