import { AttendanceService } from './attendance.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { UpdateAbsenceStatusDto } from './dto/update-absence-status.dto';
import { CoachScanResponse, LearnerScanResponse } from './interfaces/scan-response.interface';
import { MonthlyStats } from './interfaces/attendance-stats.interface';
import { DailyStats } from './interfaces/attendance-stats.interface';
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
            sessionId: string | null;
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
                    createdAt: Date;
                    updatedAt: Date;
                    name: string;
                    photoUrl: string | null;
                    description: string | null;
                    capacity: number;
                    numberOfSessions: number;
                    sessionLength: number | null;
                };
                promotion: {
                    id: string;
                    status: import(".prisma/client").$Enums.PromotionStatus;
                    createdAt: Date;
                    updatedAt: Date;
                    name: string;
                    photoUrl: string | null;
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
                    createdAt: Date;
                    updatedAt: Date;
                    name: string;
                    photoUrl: string | null;
                    description: string | null;
                    capacity: number;
                    numberOfSessions: number;
                    sessionLength: number | null;
                };
            };
        }[];
    }>;
    getDailyStats(date: string): Promise<DailyStats>;
    getMonthlyStats(year: string, month: string): Promise<MonthlyStats>;
    getYearlyStats(year: string): Promise<{
        months: any[];
    }>;
    getWeeklyStats(year: string): Promise<{
        weeks: {
            weekNumber: number;
            present: number;
            late: number;
            absent: number;
        }[];
    }>;
    manualMarkAbsences(): Promise<void>;
    getPromotionAttendance(promotionId: string, startDate: string, endDate: string): Promise<{
        date: string;
        presentCount: number;
        lateCount: number;
        absentCount: number;
    }[]>;
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
    })[]>;
}
