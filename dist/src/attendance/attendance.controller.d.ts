import { AttendanceService } from './attendance.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { UpdateAbsenceStatusDto } from './dto/update-absence-status.dto';
import { CoachScanResponse, LearnerScanResponse } from './interfaces/scan-response.interface';
export declare class AttendanceController {
    private readonly attendanceService;
    private readonly cloudinaryService;
    private readonly logger;
    constructor(attendanceService: AttendanceService, cloudinaryService: CloudinaryService);
    scan(matricule: string): Promise<LearnerScanResponse | CoachScanResponse>;
    scanLearner(body: {
        matricule: string;
    }): Promise<LearnerScanResponse>;
    scanCoach(body: {
        matricule: string;
    }): Promise<CoachScanResponse>;
    submitJustification(id: string, justification: string, document?: Express.Multer.File): Promise<{
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
    updateAbsenceStatus(id: string, updateDto: UpdateAbsenceStatusDto): Promise<{
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
    getMonthlyStats(year: string, month: string): Promise<{
        days: any[];
    }>;
    getYearlyStats(year: string): Promise<{
        months: any[];
    }>;
}
