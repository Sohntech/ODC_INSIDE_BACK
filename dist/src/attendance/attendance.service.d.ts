import { PrismaService } from '../prisma/prisma.service';
import { AbsenceStatus, LearnerAttendance } from '@prisma/client';
import { LearnerScanResponse, CoachScanResponse } from './interfaces/scan-response.interface';
export declare class AttendanceService {
    private prisma;
    constructor(prisma: PrismaService);
    findLearnerByMatricule(matricule: string): Promise<{
        user: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            password: string;
            role: import(".prisma/client").$Enums.UserRole;
        };
        promotion: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            photoUrl: string | null;
            status: import(".prisma/client").$Enums.PromotionStatus;
            startDate: Date;
            endDate: Date;
        };
        referential: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            photoUrl: string | null;
            description: string | null;
            capacity: number;
            numberOfSessions: number;
            sessionLength: number | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
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
        sessionId: string | null;
    }>;
    findCoachByMatricule(matricule: string): Promise<{
        user: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            password: string;
            role: import(".prisma/client").$Enums.UserRole;
        };
        referential: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            photoUrl: string | null;
            description: string | null;
            capacity: number;
            numberOfSessions: number;
            sessionLength: number | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        matricule: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        photoUrl: string | null;
        qrCode: string | null;
        userId: string;
        refId: string | null;
    }>;
    private isWithinScanTime;
    scan(matricule: string): Promise<LearnerScanResponse | CoachScanResponse>;
    scanLearner(matricule: string): Promise<LearnerScanResponse>;
    scanCoach(matricule: string): Promise<CoachScanResponse>;
    submitAbsenceJustification(attendanceId: string, justification: string, documentUrl?: string): Promise<{
        learner: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
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
            sessionId: string | null;
        };
    } & {
        id: string;
        learnerId: string;
        createdAt: Date;
        updatedAt: Date;
        date: Date;
        status: import(".prisma/client").$Enums.AbsenceStatus;
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
                    name: string;
                    createdAt: Date;
                    updatedAt: Date;
                    photoUrl: string | null;
                    description: string | null;
                    capacity: number;
                    numberOfSessions: number;
                    sessionLength: number | null;
                };
                promotion: {
                    id: string;
                    name: string;
                    createdAt: Date;
                    updatedAt: Date;
                    photoUrl: string | null;
                    status: import(".prisma/client").$Enums.PromotionStatus;
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
                    name: string;
                    createdAt: Date;
                    updatedAt: Date;
                    photoUrl: string | null;
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
    }>;
    getMonthlyStats(year: number, month: number): Promise<{
        days: any[];
    }>;
    getYearlyStats(year: number): Promise<{
        months: any[];
    }>;
    getScanHistory(type: 'LEARNER' | 'COACH', startDate: Date, endDate: Date): Promise<({
        learner: {
            promotion: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                photoUrl: string | null;
                status: import(".prisma/client").$Enums.PromotionStatus;
                startDate: Date;
                endDate: Date;
            };
            referential: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                photoUrl: string | null;
                description: string | null;
                capacity: number;
                numberOfSessions: number;
                sessionLength: number | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
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
            sessionId: string | null;
        };
    } & {
        id: string;
        learnerId: string;
        createdAt: Date;
        updatedAt: Date;
        date: Date;
        status: import(".prisma/client").$Enums.AbsenceStatus;
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
                name: string;
                createdAt: Date;
                updatedAt: Date;
                photoUrl: string | null;
                description: string | null;
                capacity: number;
                numberOfSessions: number;
                sessionLength: number | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            matricule: string;
            firstName: string;
            lastName: string;
            phone: string | null;
            photoUrl: string | null;
            qrCode: string | null;
            userId: string;
            refId: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        date: Date;
        isPresent: boolean;
        isLate: boolean;
        scanTime: Date | null;
        coachId: string;
    })[]>;
    markAbsentees(): Promise<void>;
}
