import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Cron } from '@nestjs/schedule';
import { AbsenceStatus, LearnerAttendance } from '@prisma/client';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  async findLearnerByMatricule(matricule: string) {
    const learner = await this.prisma.learner.findUnique({
      where: { matricule },
      include: {
        user: true,
        referential: true,
      },
    });

    if (!learner) {
      throw new NotFoundException('Apprenant non trouvé');
    }

    return learner;
  }

  async findCoachByMatricule(matricule: string) {
    const coach = await this.prisma.coach.findUnique({
      where: { matricule },
      include: {
        user: true,
        referential: true,
      },
    });

    if (!coach) {
      throw new NotFoundException('Coach non trouvé');
    }

    return coach;
  }

  async scanLearner(matricule: string): Promise<any> {
    const learner = await this.findLearnerByMatricule(matricule);

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const cutoffTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 8, 15);

    const existingAttendance = await this.prisma.learnerAttendance.findFirst({
      where: {
        learnerId: learner.id,
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
        learnerId: learner.id,
      },
      include: {
        learner: true,
      },
    });
  }

  async scanCoach(matricule: string): Promise<any> {
    const coach = await this.findCoachByMatricule(matricule);

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const cutoffTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 8, 15);

    const existingAttendance = await this.prisma.coachAttendance.findFirst({
      where: {
        coachId: coach.id,
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
        coachId: coach.id,
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

  async getDailyStats(date: string) {
    const targetDate = new Date(date);
    
    const [learnerStats, coachStats] = await Promise.all([
      this.prisma.learnerAttendance.groupBy({
        by: ['isPresent', 'isLate'],
        where: {
          date: targetDate,
        },
        _count: true,
      }),
      this.prisma.coachAttendance.groupBy({
        by: ['isPresent', 'isLate'],
        where: {
          date: targetDate,
        },
        _count: true,
      }),
    ]);

    const present = learnerStats.find(s => s.isPresent && !s.isLate)?._count || 0;
    const late = learnerStats.find(s => s.isPresent && s.isLate)?._count || 0;
    const absent = learnerStats.find(s => !s.isPresent)?._count || 0;

    return {
      present,
      late,
      absent,
      total: present + late + absent,
    };
  }

  async getMonthlyStats(year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const attendanceRecords = await this.prisma.learnerAttendance.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    const days = [];
    let currentDate = startDate;
    while (currentDate <= endDate) {
      const dayRecords = attendanceRecords.filter(
        record => record.date.getDate() === currentDate.getDate()
      );
      
      days.push({
        date: currentDate.getDate(),
        present: dayRecords.filter(r => r.isPresent && !r.isLate).length,
        late: dayRecords.filter(r => r.isPresent && r.isLate).length,
        absent: dayRecords.filter(r => !r.isPresent).length,
      });

      currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
    }

    return { days };
  }

  async getYearlyStats(year: number) {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    const attendanceRecords = await this.prisma.learnerAttendance.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const months = [];
    for (let month = 0; month < 12; month++) {
      const monthRecords = attendanceRecords.filter(
        record => record.date.getMonth() === month
      );

      months.push({
        month: month + 1,
        present: monthRecords.filter(r => r.isPresent && !r.isLate).length,
        late: monthRecords.filter(r => r.isPresent && r.isLate).length,
        absent: monthRecords.filter(r => !r.isPresent).length,
      });
    }

    return { months };
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