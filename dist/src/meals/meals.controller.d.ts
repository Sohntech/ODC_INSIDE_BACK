import { MealsService } from './meals.service';
export declare class MealsController {
    private readonly mealsService;
    constructor(mealsService: MealsService);
    scanMeal(learnerId: string, type: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        learnerId: string;
        date: Date;
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
            createdAt: Date;
            updatedAt: Date;
            firstName: string;
            lastName: string;
            phone: string;
            userId: string;
            address: string | null;
            gender: import(".prisma/client").$Enums.Gender;
            birthDate: Date;
            birthPlace: string;
            photoUrl: string | null;
            status: import(".prisma/client").$Enums.LearnerStatus;
            qrCode: string;
            refId: string | null;
            promotionId: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        learnerId: string;
        date: Date;
    })[]>;
    getLatestScans(): Promise<({
        learner: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            firstName: string;
            lastName: string;
            phone: string;
            userId: string;
            address: string | null;
            gender: import(".prisma/client").$Enums.Gender;
            birthDate: Date;
            birthPlace: string;
            photoUrl: string | null;
            status: import(".prisma/client").$Enums.LearnerStatus;
            qrCode: string;
            refId: string | null;
            promotionId: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        learnerId: string;
        date: Date;
    })[]>;
}
