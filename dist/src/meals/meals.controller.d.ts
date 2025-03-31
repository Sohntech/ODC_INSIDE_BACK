import { MealsService } from './meals.service';
export declare class MealsController {
    private readonly mealsService;
    constructor(mealsService: MealsService);
    scanMeal(learnerId: string, type: string): Promise<{
        id: string;
        date: Date;
        learnerId: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
    }>;
    getDailyStats(): Promise<{
        date: Date;
        breakfast: number;
        lunch: number;
        total: number;
    }>;
    getMonthlyStats(year: string, month: string): Promise<{
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
