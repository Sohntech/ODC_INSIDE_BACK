import { PrismaService } from '../prisma/prisma.service';
import { AbsenceStatus, LearnerAttendance } from '@prisma/client';
export declare class AttendanceService {
    private prisma;
    constructor(prisma: PrismaService);
    scanLearner(learnerId: string): Promise<any>;
    scanCoach(coachId: string): Promise<any>;
    submitAbsenceJustification(attendanceId: string, justification: string, documentUrl?: string): Promise<{
        learner: {
            id: string;
            status: import(".prisma/client").$Enums.LearnerStatus;
            createdAt: Date;
            updatedAt: Date;
            firstName: string;
            lastName: string;
            address: string | null;
            gender: import(".prisma/client").$Enums.Gender;
            birthDate: Date;
            birthPlace: string;
            phone: string;
            photoUrl: string | null;
            qrCode: string;
            userId: string;
            refId: string | null;
            promotionId: string;
        };
    } & {
        id: string;
        justification: string | null;
        date: Date;
        isPresent: boolean;
        isLate: boolean;
        scanTime: Date | null;
        justificationComment: string | null;
        status: import(".prisma/client").$Enums.AbsenceStatus;
        documentUrl: string | null;
        learnerId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateAbsenceStatus(attendanceId: string, status: AbsenceStatus, comment?: string): Promise<LearnerAttendance>;
    getLatestScans(): Promise<{
        learnerScans: ({
            learner: {
                id: string;
                status: import(".prisma/client").$Enums.LearnerStatus;
                createdAt: Date;
                updatedAt: Date;
                firstName: string;
                lastName: string;
                address: string | null;
                gender: import(".prisma/client").$Enums.Gender;
                birthDate: Date;
                birthPlace: string;
                phone: string;
                photoUrl: string | null;
                qrCode: string;
                userId: string;
                refId: string | null;
                promotionId: string;
            };
        } & {
            id: string;
            justification: string | null;
            date: Date;
            isPresent: boolean;
            isLate: boolean;
            scanTime: Date | null;
            justificationComment: string | null;
            status: import(".prisma/client").$Enums.AbsenceStatus;
            documentUrl: string | null;
            learnerId: string;
            createdAt: Date;
            updatedAt: Date;
        })[];
        coachScans: ({
            coach: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                firstName: string;
                lastName: string;
                phone: string | null;
                photoUrl: string | null;
                userId: string;
                refId: string | null;
            };
        } & {
            id: string;
            date: Date;
            isPresent: boolean;
            isLate: boolean;
            scanTime: Date | null;
            createdAt: Date;
            updatedAt: Date;
            coachId: string;
        })[];
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
    markAbsentees(): Promise<void>;
}
