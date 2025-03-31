import { PrismaService } from '../prisma/prisma.service';
import { Meal } from '@prisma/client';
export declare class MealsService {
    private prisma;
    constructor(prisma: PrismaService);
    scanMeal(learnerId: string, type: string): Promise<Meal>;
    getDailyStats(): Promise<{
        date: Date;
        breakfast: number;
        lunch: number;
        total: number;
    }>;
    getMonthlyStats(year: number, month: number): Promise<{
        year: number;
        month: number;
        dailyStats: {};
    }>;
    getLearnerMealHistory(learnerId: string): Promise<({
        learner: {
            id: string;
            status: import(".prisma/client").$Enums.LearnerStatus;
            createdAt: Date;
            updatedAt: Date;
            firstName: string;
            lastName: string;
            address: string | null;
            gender: import(".prisma/client").$Enums.Gender;
            birthDate: Date;
            birthPlace: string;
            phone: string;
            photoUrl: string | null;
            qrCode: string;
            userId: string;
            refId: string | null;
            promotionId: string;
        };
    } & {
        id: string;
        date: Date;
        learnerId: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
    })[]>;
    getLatestScans(): Promise<({
        learner: {
            id: string;
            status: import(".prisma/client").$Enums.LearnerStatus;
            createdAt: Date;
            updatedAt: Date;
            firstName: string;
            lastName: string;
            address: string | null;
            gender: import(".prisma/client").$Enums.Gender;
            birthDate: Date;
            birthPlace: string;
            phone: string;
            photoUrl: string | null;
            qrCode: string;
            userId: string;
            refId: string | null;
            promotionId: string;
        };
    } & {
        id: string;
        date: Date;
        learnerId: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
    })[]>;
}
