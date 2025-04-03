import { PromotionsService } from './promotions.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
export declare class PromotionsController {
    private readonly promotionsService;
    private readonly logger;
    constructor(promotionsService: PromotionsService);
    create(createPromotionDto: CreatePromotionDto, photo?: Express.Multer.File): Promise<{
        name: string;
        id: string;
        photoUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.PromotionStatus;
        startDate: Date;
        endDate: Date;
    }>;
    findAll(): Promise<{
        name: string;
        id: string;
        photoUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.PromotionStatus;
        startDate: Date;
        endDate: Date;
    }[]>;
    getActivePromotion(): Promise<{
        name: string;
        id: string;
        photoUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.PromotionStatus;
        startDate: Date;
        endDate: Date;
    }>;
    findOne(id: string): Promise<{
        name: string;
        id: string;
        photoUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.PromotionStatus;
        startDate: Date;
        endDate: Date;
    }>;
    getStatistics(id: string): Promise<{
        totalLearners: number;
        feminizationRate: number;
        activeModules: number;
        upcomingEvents: number;
    }>;
    update(id: string, data: any): Promise<{
        name: string;
        id: string;
        photoUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.PromotionStatus;
        startDate: Date;
        endDate: Date;
    }>;
}
