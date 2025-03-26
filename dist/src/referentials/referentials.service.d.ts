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
        promotionId: string;
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
}
