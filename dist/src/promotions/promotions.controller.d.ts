import { PromotionsService } from './promotions.service';
import { Promotion, PromotionStatus } from '@prisma/client';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { AddReferentialsDto } from './dto/add-referentials.dto';
export declare class PromotionsController {
    private readonly promotionsService;
    private readonly logger;
    constructor(promotionsService: PromotionsService);
    create(createPromotionDto: CreatePromotionDto, photo?: Express.Multer.File): Promise<{
        name: string;
        id: string;
        startDate: Date;
        endDate: Date;
        photoUrl: string | null;
        status: import(".prisma/client").$Enums.PromotionStatus;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(): Promise<{
        name: string;
        id: string;
        startDate: Date;
        endDate: Date;
        photoUrl: string | null;
        status: import(".prisma/client").$Enums.PromotionStatus;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    getActivePromotion(): Promise<{
        name: string;
        id: string;
        startDate: Date;
        endDate: Date;
        photoUrl: string | null;
        status: import(".prisma/client").$Enums.PromotionStatus;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findOne(id: string): Promise<{
        name: string;
        id: string;
        startDate: Date;
        endDate: Date;
        photoUrl: string | null;
        status: import(".prisma/client").$Enums.PromotionStatus;
        createdAt: Date;
        updatedAt: Date;
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
        startDate: Date;
        endDate: Date;
        photoUrl: string | null;
        status: import(".prisma/client").$Enums.PromotionStatus;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateStatus(id: string, updateStatusDto: {
        status: PromotionStatus;
    }): Promise<Promotion>;
    addReferentials(id: string, dto: AddReferentialsDto): Promise<Promotion>;
}
