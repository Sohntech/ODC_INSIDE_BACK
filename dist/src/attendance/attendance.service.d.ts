import { PrismaService } from '../prisma/prisma.service';
import { AbsenceStatus, LearnerAttendance } from '@prisma/client';
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
        referential: {
            name: string;
            id: string;
            photoUrl: string | null;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            capacity: number;
        };
    } & {
        id: string;
        matricule: string;
        firstName: string;
        lastName: string;
        phone: string;
        photoUrl: string | null;
        qrCode: string;
        userId: string;
        refId: string | null;
        createdAt: Date;
        updatedAt: Date;
        address: string | null;
        gender: import(".prisma/client").$Enums.Gender;
        birthDate: Date;
        birthPlace: string;
        status: import(".prisma/client").$Enums.LearnerStatus;
        promotionId: string;
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
            name: string;
            id: string;
            photoUrl: string | null;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            capacity: number;
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
    scanLearner(matricule: string): Promise<any>;
    scanCoach(matricule: string): Promise<any>;
    submitAbsenceJustification(attendanceId: string, justification: string, documentUrl?: string): Promise<{
        learner: {
            id: string;
            matricule: string;
            firstName: string;
            lastName: string;
            phone: string;
            photoUrl: string | null;
            qrCode: string;
            userId: string;
            refId: string | null;
            createdAt: Date;
            updatedAt: Date;
            address: string | null;
            gender: import(".prisma/client").$Enums.Gender;
            birthDate: Date;
            birthPlace: string;
            status: import(".prisma/client").$Enums.LearnerStatus;
            promotionId: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.AbsenceStatus;
        learnerId: string;
        date: Date;
        isPresent: boolean;
        isLate: boolean;
        scanTime: Date | null;
        justification: string | null;
        justificationComment: string | null;
        documentUrl: string | null;
    }>;
    updateAbsenceStatus(attendanceId: string, status: AbsenceStatus, comment?: string): Promise<LearnerAttendance>;
    getLatestScans(): Promise<{
        learnerScans: ({
            learner: {
                id: string;
                matricule: string;
                firstName: string;
                lastName: string;
                phone: string;
                photoUrl: string | null;
                qrCode: string;
                userId: string;
                refId: string | null;
                createdAt: Date;
                updatedAt: Date;
                address: string | null;
                gender: import(".prisma/client").$Enums.Gender;
                birthDate: Date;
                birthPlace: string;
                status: import(".prisma/client").$Enums.LearnerStatus;
                promotionId: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.AbsenceStatus;
            learnerId: string;
            date: Date;
            isPresent: boolean;
            isLate: boolean;
            scanTime: Date | null;
            justification: string | null;
            justificationComment: string | null;
            documentUrl: string | null;
        })[];
        coachScans: ({
            coach: {
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
            coachId: string;
            date: Date;
            isPresent: boolean;
            isLate: boolean;
            scanTime: Date | null;
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
