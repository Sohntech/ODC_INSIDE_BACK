import { PromotionsService } from './promotions.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
export declare class PromotionsController {
    private readonly promotionsService;
    private readonly logger;
    constructor(promotionsService: PromotionsService);
    create(createPromotionDto: CreatePromotionDto, photoFile?: Express.Multer.File): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.PromotionStatus;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        photoUrl: string | null;
        startDate: Date;
        endDate: Date;
    }>;
    findAll(): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.PromotionStatus;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        photoUrl: string | null;
        startDate: Date;
        endDate: Date;
    }[]>;
    getActivePromotion(): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.PromotionStatus;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        photoUrl: string | null;
        startDate: Date;
        endDate: Date;
    }>;
    findOne(id: string): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.PromotionStatus;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        photoUrl: string | null;
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
        id: string;
        status: import(".prisma/client").$Enums.PromotionStatus;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        photoUrl: string | null;
        startDate: Date;
        endDate: Date;
    }>;
}
