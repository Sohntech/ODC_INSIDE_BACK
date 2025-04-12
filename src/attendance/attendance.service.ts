import { Injectable, NotFoundException, BadRequestException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Cron } from '@nestjs/schedule';
import { AbsenceStatus, LearnerAttendance } from '@prisma/client';
import { LearnerScanResponse, CoachScanResponse } from './interfaces/scan-response.interface';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class AttendanceService {
  private readonly logger = new Logger(AttendanceService.name);

  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService
  ) {}

  async findLearnerByMatricule(matricule: string) {
    const learner = await this.prisma.learner.findUnique({
      where: { matricule },
      include: {
        user: true,
        referential: true,
        promotion: true,  // Add this line to include promotion
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

  private isWithinScanTime(scanTime: Date): boolean {
    const cutoffTime = new Date(
      scanTime.getFullYear(),
      scanTime.getMonth(),
      scanTime.getDate(),
      8,
      15
    );
    return scanTime <= cutoffTime;
  }

  async scan(matricule: string): Promise<LearnerScanResponse | CoachScanResponse> {
    // First try to find a learner
    const learner = await this.prisma.learner.findUnique({
      where: { matricule },
      include: {
        user: true,
        referential: true,
        promotion: true,
      },
    });

    if (learner) {
      return this.scanLearner(matricule);
    }

    // If not a learner, try to find a coach
    const coach = await this.prisma.coach.findUnique({
      where: { matricule },
      include: {
        user: true,
        referential: true,
      },
    });

    if (coach) {
      return this.scanCoach(matricule);
    }

    // If neither learner nor coach is found
    throw new NotFoundException('Aucun utilisateur trouvé avec ce matricule');
  }

  public async scanLearner(matricule: string): Promise<LearnerScanResponse> {
    const learner = await this.findLearnerByMatricule(matricule);

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Check for any existing attendance record for today
    const existingAttendance = await this.prisma.learnerAttendance.findFirst({
      where: {
        learnerId: learner.id,
        date: today,
      },
    });

    if (existingAttendance) {
      throw new ConflictException(
        `${learner.firstName} ${learner.lastName} a déjà été scanné aujourd'hui à ${existingAttendance.scanTime.toLocaleTimeString()}`
      );
    }

    const isLate = !this.isWithinScanTime(now);
    let attendance = await this.prisma.learnerAttendance.create({
      data: {
        date: today,
        isPresent: true,
        scanTime: now,
        isLate,
        learnerId: learner.id,
      },
    });

    if (isLate) {
      attendance = await this.prisma.learnerAttendance.create({
        data: {
          learnerId: learner.id,
          date: today,
          isPresent: true,
          isLate: true,
          scanTime: now,
          status: 'TO_JUSTIFY', // Nouvel état initial pour les retards
        },
        include: { learner: true }
      });
    }

    return {
      type: 'LEARNER',
      scanTime: attendance.scanTime,
      attendanceStatus: isLate ? 'LATE' : 'PRESENT',
      isAlreadyScanned: false,
      learner: {
        id: learner.id,
        matricule: learner.matricule,
        firstName: learner.firstName,
        lastName: learner.lastName,
        photoUrl: learner.photoUrl,
        referential: learner.referential,
        promotion: learner.promotion
      }
    };
  }

  public async scanCoach(matricule: string): Promise<CoachScanResponse> {
    const coach = await this.findCoachByMatricule(matricule);

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Check for any existing attendance record for today
    const existingAttendance = await this.prisma.coachAttendance.findFirst({
      where: {
        coachId: coach.id,
        date: today,
      },
    });

    if (existingAttendance) {
      throw new ConflictException(
        `${coach.firstName} ${coach.lastName} a déjà été scanné aujourd'hui à ${existingAttendance.scanTime.toLocaleTimeString()}`
      );
    }

    const isLate = !this.isWithinScanTime(now);
    const attendance = await this.prisma.coachAttendance.create({
      data: {
        date: today,
        isPresent: true,
        scanTime: now,
        isLate,
        coachId: coach.id,
      },
      include: {
        coach: {
          include: {
            referential: true,
          },
        },
      },
    });

    return {
      type: 'COACH',
      scanTime: attendance.scanTime,
      attendanceStatus: isLate ? 'LATE' : 'PRESENT',
      isAlreadyScanned: false,
      coach: attendance.coach
    };
  }

  async submitAbsenceJustification(
    attendanceId: string,
    justification: string,
    documentUrl?: string,
  ) {
    const attendance = await this.prisma.learnerAttendance.update({
      where: { id: attendanceId },
      data: {
        justification,
        documentUrl,
        status: 'PENDING'
      },
      include: {
        learner: true
      }
    });

    // Create notification
    await this.notificationsService.createJustificationNotification(
      attendanceId,
      attendance.learnerId,
      `${attendance.learner.firstName} ${attendance.learner.lastName} a soumis une justification ${attendance.isLate ? 'de retard' : 'd\'absence'}`
    );

    return attendance;
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

    const [learnerScans, coachScans] = await Promise.all([
      this.prisma.learnerAttendance.findMany({
        where: {
          date: today,
          isPresent: true,
        },
        include: {
          learner: {
            include: {
              referential: true,
              promotion: true
            }
          },
        },
        orderBy: { scanTime: 'desc' },
        take: 10,
      }),
      this.prisma.coachAttendance.findMany({
        where: {
          date: today,
          isPresent: true,
        },
        include: {
          coach: {
            include: {
              referential: true,
            }
          },
        },
        orderBy: { scanTime: 'desc' },
        take: 10,
      }),
    ]);

    return {
      learnerScans: learnerScans.map(scan => ({
        type: 'LEARNER',
        scanTime: scan.scanTime,
        attendanceStatus: scan.isLate ? 'LATE' : 'PRESENT',
        learner: {
          id: scan.learner.id,
          matricule: scan.learner.matricule,
          firstName: scan.learner.firstName,
          lastName: scan.learner.lastName,
          photoUrl: scan.learner.photoUrl,
          referential: scan.learner.referential,
          promotion: scan.learner.promotion
        }
      })),
      coachScans: coachScans.map(scan => ({
        type: 'COACH',
        scanTime: scan.scanTime,
        attendanceStatus: scan.isLate ? 'LATE' : 'PRESENT',
        coach: {
          id: scan.coach.id,
          matricule: scan.coach.matricule,
          firstName: scan.coach.firstName,
          lastName: scan.coach.lastName,
          photoUrl: scan.coach.photoUrl,
          referential: scan.coach.referential
        }
      }))
    };
  }

  async getDailyStats(date: string) {
    try {
      const targetDate = new Date(date);
      
      // Get all attendance records for the day with learner details
      const attendanceRecords = await this.prisma.learnerAttendance.findMany({
        where: {
          date: targetDate,
        },
        include: {
          learner: {
            include: {
              referential: true
            }
          }
        }
      });

      // Calculate stats
      const present = attendanceRecords.filter(r => r.isPresent && !r.isLate).length;
      const late = attendanceRecords.filter(r => r.isPresent && r.isLate).length;
      const absent = attendanceRecords.filter(r => !r.isPresent).length;

      return {
        present,
        late,
        absent,
        total: present + late + absent,
        attendance: attendanceRecords.map(record => ({
          id: record.id,
          date: record.date.toISOString(),
          scanTime: record.scanTime?.toISOString() || null,
          isPresent: record.isPresent,
          isLate: record.isLate,
          status: record.status || 'PENDING',
          learner: {
            id: record.learner.id,
            firstName: record.learner.firstName,
            lastName: record.learner.lastName,
            matricule: record.learner.matricule,
            photoUrl: record.learner.photoUrl,
            address: record.learner.address,
            referential: record.learner.referential ? {
              id: record.learner.referential.id,
              name: record.learner.referential.name
            } : undefined
          }
        }))
      };
    } catch (error) {
      this.logger.error('Error getting daily stats:', error);
      throw error;
    }
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

  async getWeeklyStats(year: number) {
    try {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31);

      // Get all attendance records for the year
      const attendanceRecords = await this.prisma.learnerAttendance.findMany({
        where: {
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      // Initialize weeks array (52 weeks)
      const weeks = Array.from({ length: 52 }, (_, i) => ({
        weekNumber: i + 1,
        present: 0,
        late: 0,
        absent: 0,
      }));

      // Process each attendance record
      attendanceRecords.forEach(record => {
        const weekNumber = this.getWeekNumber(record.date) - 1; // 0-based index
        
        if (weekNumber >= 0 && weekNumber < 52) {
          if (record.isPresent && !record.isLate) {
            weeks[weekNumber].present++;
          } else if (record.isPresent && record.isLate) {
            weeks[weekNumber].late++;
          } else {
            weeks[weekNumber].absent++;
          }
        }
      });

      return { weeks };
    } catch (error) {
      this.logger.error('Error getting weekly stats:', error);
      throw error;
    }
  }

  // Helper method to get week number
  private getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  async getScanHistory(
    type: 'LEARNER' | 'COACH',
    startDate: Date,
    endDate: Date
  ) {
    if (type === 'LEARNER') {
      return this.prisma.learnerAttendance.findMany({
        where: {
          date: {
            gte: startDate,
            lte: endDate
          }
        },
        include: {
          learner: {
            include: {
              referential: true,
              promotion: true
            }
          }
        },
        orderBy: {
          date: 'desc'
        }
      });
    }

    return this.prisma.coachAttendance.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        coach: {
          include: {
            referential: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });
  }

  async getPromotionAttendance(
    promotionId: string,
    startDate: Date,
    endDate: Date
  ) {
    try {
      // First verify if promotion exists
      const promotion = await this.prisma.promotion.findUnique({
        where: { id: promotionId },
        include: {
          learners: true
        }
      });

      if (!promotion) {
        throw new NotFoundException('Promotion not found');
      }

      // Get all learner IDs from the promotion
      const learnerIds = promotion.learners.map(learner => learner.id);

      // Get attendance records for these learners between the dates
      const attendanceRecords = await this.prisma.learnerAttendance.groupBy({
        by: ['date'],
        where: {
          learnerId: { in: learnerIds },
          date: {
            gte: startDate,
            lte: endDate
          }
        },
        _count: {
          _all: true
        }
      });

      // For each date, calculate present, late, and absent counts
      const results = await Promise.all(
        attendanceRecords.map(async (record) => {
          const dateAttendance = await this.prisma.learnerAttendance.groupBy({
            by: ['isPresent', 'isLate'],
            where: {
              learnerId: { in: learnerIds },
              date: record.date
            },
            _count: true
          });

          const stats = {
            date: record.date.toISOString().split('T')[0],
            presentCount: 0,
            lateCount: 0,
            absentCount: 0
          };

          dateAttendance.forEach(attendance => {
            if (attendance.isPresent && !attendance.isLate) {
              stats.presentCount = attendance._count;
            } else if (attendance.isPresent && attendance.isLate) {
              stats.lateCount = attendance._count;
            } else {
              stats.absentCount = attendance._count;
            }
          });

          // Calculate absent as total learners minus present and late
          const totalLearners = learnerIds.length;
          const accountedFor = stats.presentCount + stats.lateCount;
          stats.absentCount = totalLearners - accountedFor;

          return stats;
        })
      );

      // Sort by date
      results.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      return results;
    } catch (error) {
      this.logger.error('Error fetching promotion attendance:', error);
      throw error;
    }
  }

  @Cron('0 0 15 * * 1-5')
  async markAbsentees() {
    try {
      this.logger.log('Starting markAbsentees cron job...');
      
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      await this.prisma.$transaction(async (prisma) => {
        // Get all active learners
        const learners = await prisma.learner.findMany({
          where: {
            status: 'ACTIVE'
          },
          select: {
            id: true,
            matricule: true
          }
        });

        this.logger.log(`Found ${learners.length} active learners to process`);

        for (const learner of learners) {
          const existingAttendance = await prisma.learnerAttendance.findFirst({
            where: {
              learnerId: learner.id,
              date: today,
            }
          });

          if (!existingAttendance) {
            this.logger.log(`Marking learner ${learner.matricule} as absent`);
            await prisma.learnerAttendance.create({
              data: {
                date: today,
                isPresent: false,
                isLate: false,
                learnerId: learner.id,
                status: 'TO_JUSTIFY', // Nouvel état initial
              }
            });
          } else {
            this.logger.log(`Learner ${learner.matricule} already has attendance record for today`);
          }
        }

        // Get all coaches (without status filter)
        const coaches = await prisma.coach.findMany({
          select: {
            id: true,
            matricule: true
          }
        });

        this.logger.log(`Found ${coaches.length} coaches to process`);

        for (const coach of coaches) {
          const existingAttendance = await prisma.coachAttendance.findFirst({
            where: {
              coachId: coach.id,
              date: today,
            }
          });

          if (!existingAttendance) {
            this.logger.log(`Marking coach ${coach.matricule} as absent`);
            await prisma.coachAttendance.create({
              data: {
                date: today,
                isPresent: false,
                isLate: false,
                coachId: coach.id,
              }
            });
          } else {
            this.logger.log(`Coach ${coach.matricule} already has attendance record for today`);
          }
        }
      });

      this.logger.log('Completed markAbsentees cron job successfully');
    } catch (error) {
      this.logger.error('Error in markAbsentees cron job:', error);
      throw error;
    }
  }

  async getAttendanceByLearner(learnerId: string) {
    return this.prisma.learnerAttendance.findMany({
      where: {
        learnerId: learnerId
      },
      orderBy: {
        date: 'desc'
      },
      include: {
        learner: {
          select: {
            firstName: true,
            lastName: true,
            matricule: true,
            photoUrl: true,
            referential: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });
  }
}