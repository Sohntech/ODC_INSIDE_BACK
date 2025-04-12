import { PrismaService } from '../prisma/prisma.service';
import { AbsenceStatus, LearnerAttendance } from '@prisma/client';
import { LearnerScanResponse, CoachScanResponse } from './interfaces/scan-response.interface';
import { NotificationsService } from '../notifications/notifications.service';
export declare class AttendanceService {
    private prisma;
    private notificationsService;
    private readonly logger;
    constructor(prisma: PrismaService, notificationsService: NotificationsService);
    findLearnerByMatricule(matricule: string): Promise<{
        promotion: {
            id: string;
            photoUrl: string | null;
            status: import(".prisma/client").$Enums.PromotionStatus;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            startDate: Date;
            endDate: Date;
        };
        referential: {
            id: string;
            photoUrl: string | null;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            capacity: number;
            numberOfSessions: number;
            sessionLength: number | null;
        };
        user: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            password: string;
            role: import(".prisma/client").$Enums.UserRole;
        };
    } & {
        id: string;
        matricule: string;
        firstName: string;
        lastName: string;
        address: string | null;
        gender: import(".prisma/client").$Enums.Gender;
        birthDate: Date;
        birthPlace: string;
        phone: string;
        photoUrl: string | null;
        status: import(".prisma/client").$Enums.LearnerStatus;
        qrCode: string;
        userId: string;
        refId: string | null;
        promotionId: string;
        createdAt: Date;
        updatedAt: Date;
        sessionId: string | null;
    }>;
    findCoachByMatricule(matricule: string): Promise<{
        referential: {
            id: string;
            photoUrl: string | null;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            capacity: number;
            numberOfSessions: number;
            sessionLength: number | null;
        };
        user: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            password: string;
            role: import(".prisma/client").$Enums.UserRole;
        };
    } & {
        id: string;
        matricule: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        photoUrl: string | null;
        qrCode: string | null;
        userId: string;
        refId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    private isWithinScanTime;
    scan(matricule: string): Promise<LearnerScanResponse | CoachScanResponse>;
    scanLearner(matricule: string): Promise<LearnerScanResponse>;
    scanCoach(matricule: string): Promise<CoachScanResponse>;
    submitAbsenceJustification(attendanceId: string, justification: string, documentUrl?: string): Promise<{
        learner: {
            id: string;
            matricule: string;
            firstName: string;
            lastName: string;
            address: string | null;
            gender: import(".prisma/client").$Enums.Gender;
            birthDate: Date;
            birthPlace: string;
            phone: string;
            photoUrl: string | null;
            status: import(".prisma/client").$Enums.LearnerStatus;
            qrCode: string;
            userId: string;
            refId: string | null;
            promotionId: string;
            createdAt: Date;
            updatedAt: Date;
            sessionId: string | null;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.AbsenceStatus;
        createdAt: Date;
        updatedAt: Date;
        date: Date;
        learnerId: string;
        isPresent: boolean;
        isLate: boolean;
        scanTime: Date | null;
        justification: string | null;
        justificationComment: string | null;
        documentUrl: string | null;
    }>;
    updateAbsenceStatus(attendanceId: string, status: AbsenceStatus, comment?: string): Promise<LearnerAttendance>;
    getLatestScans(): Promise<{
        learnerScans: {
            type: string;
            scanTime: Date;
            attendanceStatus: string;
            learner: {
                id: string;
                matricule: string;
                firstName: string;
                lastName: string;
                photoUrl: string;
                referential: {
                    id: string;
                    photoUrl: string | null;
                    createdAt: Date;
                    updatedAt: Date;
                    name: string;
                    description: string | null;
                    capacity: number;
                    numberOfSessions: number;
                    sessionLength: number | null;
                };
                promotion: {
                    id: string;
                    photoUrl: string | null;
                    status: import(".prisma/client").$Enums.PromotionStatus;
                    createdAt: Date;
                    updatedAt: Date;
                    name: string;
                    startDate: Date;
                    endDate: Date;
                };
            };
        }[];
        coachScans: {
            type: string;
            scanTime: Date;
            attendanceStatus: string;
            coach: {
                id: string;
                matricule: string;
                firstName: string;
                lastName: string;
                photoUrl: string;
                referential: {
                    id: string;
                    photoUrl: string | null;
                    createdAt: Date;
                    updatedAt: Date;
                    name: string;
                    description: string | null;
                    capacity: number;
                    numberOfSessions: number;
                    sessionLength: number | null;
                };
            };
        }[];
    }>;
    getDailyStats(date: string): Promise<{
        present: number;
        late: number;
        absent: number;
        total: number;
        attendance: {
            id: string;
            date: string;
            scanTime: string;
            isPresent: boolean;
            isLate: boolean;
            status: import(".prisma/client").$Enums.AbsenceStatus;
            learner: {
                id: string;
                firstName: string;
                lastName: string;
                matricule: string;
                photoUrl: string;
                address: string;
                referential: {
                    id: string;
                    name: string;
                };
            };
        }[];
    }>;
    getMonthlyStats(year: number, month: number): Promise<{
        days: any[];
    }>;
    getYearlyStats(year: number): Promise<{
        months: any[];
    }>;
    getWeeklyStats(year: number): Promise<{
        weeks: {
            weekNumber: number;
            present: number;
            late: number;
            absent: number;
        }[];
    }>;
    private getWeekNumber;
    getScanHistory(type: 'LEARNER' | 'COACH', startDate: Date, endDate: Date): Promise<({
        learner: {
            promotion: {
                id: string;
                photoUrl: string | null;
                status: import(".prisma/client").$Enums.PromotionStatus;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                startDate: Date;
                endDate: Date;
            };
            referential: {
                id: string;
                photoUrl: string | null;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string | null;
                capacity: number;
                numberOfSessions: number;
                sessionLength: number | null;
            };
        } & {
            id: string;
            matricule: string;
            firstName: string;
            lastName: string;
            address: string | null;
            gender: import(".prisma/client").$Enums.Gender;
            birthDate: Date;
            birthPlace: string;
            phone: string;
            photoUrl: string | null;
            status: import(".prisma/client").$Enums.LearnerStatus;
            qrCode: string;
            userId: string;
            refId: string | null;
            promotionId: string;
            createdAt: Date;
            updatedAt: Date;
            sessionId: string | null;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.AbsenceStatus;
        createdAt: Date;
        updatedAt: Date;
        date: Date;
        learnerId: string;
        isPresent: boolean;
        isLate: boolean;
        scanTime: Date | null;
        justification: string | null;
        justificationComment: string | null;
        documentUrl: string | null;
    })[] | ({
        coach: {
            referential: {
                id: string;
                photoUrl: string | null;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string | null;
                capacity: number;
                numberOfSessions: number;
                sessionLength: number | null;
            };
        } & {
            id: string;
            matricule: string;
            firstName: string;
            lastName: string;
            phone: string | null;
            photoUrl: string | null;
            qrCode: string | null;
            userId: string;
            refId: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        date: Date;
        coachId: string;
        isPresent: boolean;
        isLate: boolean;
        scanTime: Date | null;
    })[]>;
    getPromotionAttendance(promotionId: string, startDate: Date, endDate: Date): Promise<{
        date: string;
        presentCount: number;
        lateCount: number;
        absentCount: number;
    }[]>;
    markAbsentees(): Promise<void>;
    getAttendanceByLearner(learnerId: string): Promise<({
        learner: {
            matricule: string;
            firstName: string;
            lastName: string;
            photoUrl: string;
            referential: {
                name: string;
            };
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.AbsenceStatus;
        createdAt: Date;
        updatedAt: Date;
        date: Date;
        learnerId: string;
        isPresent: boolean;
        isLate: boolean;
        scanTime: Date | null;
        justification: string | null;
        justificationComment: string | null;
        documentUrl: string | null;
    })[]>;
}
