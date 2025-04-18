import { LearnersService } from './learners.service';
import { LearnerStatus, Learner } from '@prisma/client';
import { ReplaceLearnerDto, UpdateStatusDto } from './dto/update-status.dto';
export declare class LearnersController {
    private readonly learnersService;
    constructor(learnersService: LearnersService);
    create(data: any, photoFile?: Express.Multer.File): Promise<{
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
    findAll(): Promise<{
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
    }[]>;
    uploadDocument(id: string, file: Express.Multer.File, type: string, name: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        type: string;
        learnerId: string;
        url: string;
    }>;
    getWaitingList(promotionId?: string): Promise<Learner[]>;
    findOne(id: string): Promise<{
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
    update(id: string, data: any): Promise<{
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
    updateStatus(id: string, status: LearnerStatus): Promise<{
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
    updateKit(id: string, kitData: any): Promise<{
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
    getAttendanceStats(id: string): Promise<{
        totalDays: number;
        presentDays: number;
        attendanceRate: number;
    }>;
    findByEmail(email: string, req: any): Promise<Learner>;
    patchUpdateStatus(id: string, updateStatusDto: UpdateStatusDto): Promise<{
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
    replaceLearner(replacementDto: ReplaceLearnerDto): Promise<{
        replacedLearner: Learner;
        replacementLearner: Learner;
    }>;
    getStatusHistory(id: string): Promise<{
        id: string;
        date: Date;
        learnerId: string;
        previousStatus: import(".prisma/client").$Enums.LearnerStatus | null;
        newStatus: import(".prisma/client").$Enums.LearnerStatus;
        reason: string | null;
    }[]>;
    getDocuments(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        type: string;
        url: string;
    }[]>;
    getAttendance(id: string): Promise<({
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
