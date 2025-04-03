import { AttendanceService } from './attendance.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { UpdateAbsenceStatusDto } from './dto/update-absence-status.dto';
export declare class AttendanceController {
    private readonly attendanceService;
    private readonly cloudinaryService;
    private readonly logger;
    constructor(attendanceService: AttendanceService, cloudinaryService: CloudinaryService);
    scanLearner(body: {
        matricule: string;
    }): Promise<any>;
    scanCoach(body: {
        matricule: string;
    }): Promise<any>;
    submitJustification(id: string, justification: string, document?: Express.Multer.File): Promise<{
        learner: {
            id: string;
            status: import(".prisma/client").$Enums.LearnerStatus;
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
            qrCode: string;
            userId: string;
            refId: string | null;
            promotionId: string;
        };
    } & {
        id: string;
        date: Date;
        isPresent: boolean;
        isLate: boolean;
        scanTime: Date | null;
        justification: string | null;
        justificationComment: string | null;
        status: import(".prisma/client").$Enums.AbsenceStatus;
        documentUrl: string | null;
        learnerId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateAbsenceStatus(id: string, updateDto: UpdateAbsenceStatusDto): Promise<{
        id: string;
        date: Date;
        isPresent: boolean;
        isLate: boolean;
        scanTime: Date | null;
        justification: string | null;
        justificationComment: string | null;
        status: import(".prisma/client").$Enums.AbsenceStatus;
        documentUrl: string | null;
        learnerId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getLatestScans(): Promise<{
        learnerScans: ({
            learner: {
                id: string;
                status: import(".prisma/client").$Enums.LearnerStatus;
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
                qrCode: string;
                userId: string;
                refId: string | null;
                promotionId: string;
            };
        } & {
            id: string;
            date: Date;
            isPresent: boolean;
            isLate: boolean;
            scanTime: Date | null;
            justification: string | null;
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
    getMonthlyStats(year: string, month: string): Promise<{
        days: any[];
    }>;
    getYearlyStats(year: string): Promise<{
        months: any[];
    }>;
}
