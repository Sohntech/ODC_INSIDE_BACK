import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Learner, LearnerStatus } from '@prisma/client';
import { CreateLearnerDto } from './dto/create-learner.dto';
import { ReplaceLearnerDto, UpdateStatusDto } from './dto/update-status.dto';
export declare class LearnersService {
    private prisma;
    private cloudinary;
    private readonly logger;
    constructor(prisma: PrismaService, cloudinary: CloudinaryService);
    create(createLearnerDto: CreateLearnerDto, photoFile?: Express.Multer.File): Promise<Learner>;
    findAll(): Promise<Learner[]>;
    findOne(id: string): Promise<Learner>;
    findByEmail(email: string): Promise<Learner>;
    update(id: string, data: Partial<Learner>): Promise<Learner>;
    updateStatus(id: string, status: LearnerStatus): Promise<Learner>;
    updateKit(id: string, kitData: {
        laptop?: boolean;
        charger?: boolean;
        bag?: boolean;
        polo?: boolean;
    }): Promise<Learner>;
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
    updateLearnerStatus(learnerId: string, updateStatusDto: UpdateStatusDto): Promise<Learner>;
    replaceLearner(replacementDto: ReplaceLearnerDto): Promise<{
        replacedLearner: Learner;
        replacementLearner: Learner;
    }>;
    getWaitingList(promotionId?: string): Promise<Learner[]>;
    getStatusHistory(learnerId: string): Promise<{
        id: string;
        date: Date;
        learnerId: string;
        previousStatus: import(".prisma/client").$Enums.LearnerStatus | null;
        newStatus: import(".prisma/client").$Enums.LearnerStatus;
        reason: string | null;
    }[]>;
    getDocuments(learnerId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        type: string;
        url: string;
    }[]>;
    getAttendanceByLearner(learnerId: string): import(".prisma/client").Prisma.PrismaPromise<({
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
