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
}
