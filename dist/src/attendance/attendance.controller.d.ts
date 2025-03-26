import { AttendanceService } from './attendance.service';
import { AbsenceStatus } from '@prisma/client';
export declare class AttendanceController {
    private readonly attendanceService;
    constructor(attendanceService: AttendanceService);
    scanLearner(id: string): Promise<any>;
    scanCoach(id: string): Promise<any>;
    submitJustification(id: string, justification: string, document?: Express.Multer.File): Promise<{
        learner: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            firstName: string;
            lastName: string;
            phone: string;
            userId: string;
            address: string | null;
            gender: import(".prisma/client").$Enums.Gender;
            birthDate: Date;
            birthPlace: string;
            photoUrl: string | null;
            status: import(".prisma/client").$Enums.LearnerStatus;
            qrCode: string;
            refId: string | null;
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
        documentUrl: string | null;
    }>;
    updateAbsenceStatus(id: string, status: AbsenceStatus): Promise<{
        learner: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            firstName: string;
            lastName: string;
            phone: string;
            userId: string;
            address: string | null;
            gender: import(".prisma/client").$Enums.Gender;
            birthDate: Date;
            birthPlace: string;
            photoUrl: string | null;
            status: import(".prisma/client").$Enums.LearnerStatus;
            qrCode: string;
            refId: string | null;
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
        documentUrl: string | null;
    }>;
    getLatestScans(): Promise<{
        learnerScans: ({
            learner: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                firstName: string;
                lastName: string;
                phone: string;
                userId: string;
                address: string | null;
                gender: import(".prisma/client").$Enums.Gender;
                birthDate: Date;
                birthPlace: string;
                photoUrl: string | null;
                status: import(".prisma/client").$Enums.LearnerStatus;
                qrCode: string;
                refId: string | null;
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
            documentUrl: string | null;
        })[];
        coachScans: ({
            coach: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                firstName: string;
                lastName: string;
                phone: string | null;
                userId: string;
                photoUrl: string | null;
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
        })[];
    }>;
}
