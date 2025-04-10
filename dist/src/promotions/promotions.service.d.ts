import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Promotion } from '@prisma/client';
import { CreatePromotionDto } from './dto/create-promotion.dto';
export declare class PromotionsService {
    private prisma;
    private cloudinary;
    private readonly logger;
    constructor(prisma: PrismaService, cloudinary: CloudinaryService);
    create(data: CreatePromotionDto, photoFile?: Express.Multer.File): Promise<Promotion>;
    private updateSessionDatesInBatches;
    findAll(): Promise<Promotion[]>;
    findOne(id: string): Promise<Promotion>;
    update(id: string, data: Partial<Promotion>): Promise<Promotion>;
    getActivePromotion(): Promise<Promotion>;
    getStatistics(id: string): Promise<{
        totalLearners: number;
        feminizationRate: number;
        activeModules: number;
        upcomingEvents: number;
    }>;
    addReferentials(promotionId: string, referentialIds: string[]): Promise<{
        learners: {
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
        }[];
        referentials: {
            id: string;
            photoUrl: string | null;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            capacity: number;
            numberOfSessions: number;
            sessionLength: number | null;
        }[];
    } & {
        id: string;
        photoUrl: string | null;
        status: import(".prisma/client").$Enums.PromotionStatus;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        startDate: Date;
        endDate: Date;
    }>;
}
