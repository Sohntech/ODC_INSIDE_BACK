"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendanceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const schedule_1 = require("@nestjs/schedule");
const client_1 = require("@prisma/client");
let AttendanceService = class AttendanceService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findLearnerByMatricule(matricule) {
        const learner = await this.prisma.learner.findUnique({
            where: { matricule },
            include: {
                user: true,
                referential: true,
                promotion: true,
            },
        });
        if (!learner) {
            throw new common_1.NotFoundException('Apprenant non trouvé');
        }
        return learner;
    }
    async findCoachByMatricule(matricule) {
        const coach = await this.prisma.coach.findUnique({
            where: { matricule },
            include: {
                user: true,
                referential: true,
            },
        });
        if (!coach) {
            throw new common_1.NotFoundException('Coach non trouvé');
        }
        return coach;
    }
    isWithinScanTime(scanTime) {
        const cutoffTime = new Date(scanTime.getFullYear(), scanTime.getMonth(), scanTime.getDate(), 8, 15);
        return scanTime <= cutoffTime;
    }
    async scan(matricule) {
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
        throw new common_1.NotFoundException('Aucun utilisateur trouvé avec ce matricule');
    }
    async scanLearner(matricule) {
        const learner = await this.findLearnerByMatricule(matricule);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const existingAttendance = await this.prisma.learnerAttendance.findFirst({
            where: {
                learnerId: learner.id,
                date: today,
            },
        });
        if (existingAttendance) {
            throw new common_1.ConflictException(`${learner.firstName} ${learner.lastName} a déjà été scanné aujourd'hui à ${existingAttendance.scanTime.toLocaleTimeString()}`);
        }
        const isLate = !this.isWithinScanTime(now);
        const attendance = await this.prisma.learnerAttendance.create({
            data: {
                date: today,
                isPresent: true,
                scanTime: now,
                isLate,
                learnerId: learner.id,
            },
        });
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
    async scanCoach(matricule) {
        const coach = await this.findCoachByMatricule(matricule);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const existingAttendance = await this.prisma.coachAttendance.findFirst({
            where: {
                coachId: coach.id,
                date: today,
            },
        });
        if (existingAttendance) {
            throw new common_1.ConflictException(`${coach.firstName} ${coach.lastName} a déjà été scanné aujourd'hui à ${existingAttendance.scanTime.toLocaleTimeString()}`);
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
    async submitAbsenceJustification(attendanceId, justification, documentUrl) {
        return this.prisma.learnerAttendance.update({
            where: { id: attendanceId },
            data: {
                justification,
                documentUrl,
                status: client_1.AbsenceStatus.PENDING,
            },
            include: {
                learner: true,
            },
        });
    }
    async updateAbsenceStatus(attendanceId, status, comment) {
        const attendance = await this.prisma.learnerAttendance.findUnique({
            where: { id: attendanceId },
            include: { learner: true }
        });
        if (!attendance) {
            throw new common_1.NotFoundException('Attendance record not found');
        }
        if (attendance.status !== client_1.AbsenceStatus.PENDING) {
            throw new common_1.BadRequestException('This absence justification has already been processed');
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
    async getDailyStats(date) {
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
    async getMonthlyStats(year, month) {
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
            const dayRecords = attendanceRecords.filter(record => record.date.getDate() === currentDate.getDate());
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
    async getYearlyStats(year) {
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
            const monthRecords = attendanceRecords.filter(record => record.date.getMonth() === month);
            months.push({
                month: month + 1,
                present: monthRecords.filter(r => r.isPresent && !r.isLate).length,
                late: monthRecords.filter(r => r.isPresent && r.isLate).length,
                absent: monthRecords.filter(r => !r.isPresent).length,
            });
        }
        return { months };
    }
    async getScanHistory(type, startDate, endDate) {
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
    async markAbsentees() {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
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
};
exports.AttendanceService = AttendanceService;
__decorate([
    (0, schedule_1.Cron)('0 0 13 * * 1-5'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AttendanceService.prototype, "markAbsentees", null);
exports.AttendanceService = AttendanceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AttendanceService);
//# sourceMappingURL=attendance.service.js.map