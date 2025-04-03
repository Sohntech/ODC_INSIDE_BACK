import { PrismaService } from '../prisma/prisma.service';
import { Referential } from '@prisma/client';
export declare class ReferentialsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: {
        name: string;
        description?: string;
        photoUrl?: string;
        capacity: number;
    }): Promise<Referential>;
    findAll(): Promise<Referential[]>;
    findOne(id: string): Promise<Referential>;
    update(id: string, data: Partial<Referential>): Promise<Referential>;
    getStatistics(id: string): Promise<{
        totalLearners: number;
        activeModules: number;
        totalCoaches: number;
        capacity: number;
        availableSpots: number;
    }>;
    assignToPromotion(referentialIds: string[], promotionId: string): Promise<{
        referentials: {
            name: string;
            id: string;
            photoUrl: string | null;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            capacity: number;
        }[];
    } & {
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
