import { PromotionsService } from './promotions.service';
export declare class PromotionsController {
    private readonly promotionsService;
    private readonly logger;
    constructor(promotionsService: PromotionsService);
    create(formData: any, photoFile?: Express.Multer.File): Promise<{
        id: string;
        photoUrl: string | null;
        status: import(".prisma/client").$Enums.PromotionStatus;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        startDate: Date;
        endDate: Date;
    }>;
    findAll(): Promise<{
        id: string;
        photoUrl: string | null;
        status: import(".prisma/client").$Enums.PromotionStatus;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        startDate: Date;
        endDate: Date;
    }[]>;
    getActivePromotion(): Promise<{
        id: string;
        photoUrl: string | null;
        status: import(".prisma/client").$Enums.PromotionStatus;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        startDate: Date;
        endDate: Date;
    }>;
    findOne(id: string): Promise<{
        id: string;
        photoUrl: string | null;
        status: import(".prisma/client").$Enums.PromotionStatus;
        createdAt: Date;
        updatedAt: Date;
        name: string;
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
        photoUrl: string | null;
        status: import(".prisma/client").$Enums.PromotionStatus;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        startDate: Date;
        endDate: Date;
    }>;
}
