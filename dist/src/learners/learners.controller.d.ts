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
    uploadDocument(id: string, file: Express.Multer.File, type: string, name: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        type: string;
        learnerId: string;
        url: string;
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
    getWaitingList(promotionId?: string): Promise<{
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
    getStatusHistory(id: string): Promise<{
        id: string;
        date: Date;
        learnerId: string;
        previousStatus: import(".prisma/client").$Enums.LearnerStatus | null;
        newStatus: import(".prisma/client").$Enums.LearnerStatus;
        reason: string | null;
    }[]>;
}
