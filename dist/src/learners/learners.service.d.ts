import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Learner, LearnerStatus } from '@prisma/client';
export declare class LearnersService {
    private prisma;
    private cloudinary;
    private readonly logger;
    constructor(prisma: PrismaService, cloudinary: CloudinaryService);
    create(data: {
        firstName: string;
        lastName: string;
        address?: string;
        gender: 'MALE' | 'FEMALE';
        birthDate: Date;
        birthPlace: string;
        phone: string;
        email: string;
        refId?: string;
        promotionId: string;
        photoFile?: Express.Multer.File;
        tutor: {
            firstName: string;
            lastName: string;
            phone: string;
            email?: string;
            address?: string;
        };
    }): Promise<Learner>;
    findAll(): Promise<Learner[]>;
    findOne(id: string): Promise<Learner>;
    update(id: string, data: Partial<Learner>): Promise<Learner>;
    updateStatus(id: string, status: LearnerStatus): Promise<Learner>;
    updateKit(id: string, kitData: {
        laptop?: boolean;
        charger?: boolean;
        bag?: boolean;
        polo?: boolean;
    }): Promise<Learner>;
    uploadDocument(id: string, file: Express.Multer.File, type: string, name: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        url: string;
        learnerId: string;
    }>;
    getAttendanceStats(id: string): Promise<{
        totalDays: number;
        presentDays: number;
        attendanceRate: number;
    }>;
}
