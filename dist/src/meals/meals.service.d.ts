import { PrismaService } from '../prisma/prisma.service';
import { Meal } from '@prisma/client';
export declare class MealsService {
    private prisma;
    constructor(prisma: PrismaService);
    findLearnerByMatricule(matricule: string): Promise<{
        user: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            password: string;
            role: import(".prisma/client").$Enums.UserRole;
        };
    } & {
        id: string;
        matricule: string;
        firstName: string;
        lastName: string;
        phone: string;
        photoUrl: string | null;
        qrCode: string;
        userId: string;
        refId: string | null;
        createdAt: Date;
        updatedAt: Date;
        address: string | null;
        gender: import(".prisma/client").$Enums.Gender;
        birthDate: Date;
        birthPlace: string;
        status: import(".prisma/client").$Enums.LearnerStatus;
        promotionId: string;
    }>;
    scanMeal(matricule: string, type: string): Promise<Meal>;
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
            matricule: string;
            firstName: string;
            lastName: string;
            phone: string;
            photoUrl: string | null;
            qrCode: string;
            userId: string;
            refId: string | null;
            createdAt: Date;
            updatedAt: Date;
            address: string | null;
            gender: import(".prisma/client").$Enums.Gender;
            birthDate: Date;
            birthPlace: string;
            status: import(".prisma/client").$Enums.LearnerStatus;
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
            matricule: string;
            firstName: string;
            lastName: string;
            phone: string;
            photoUrl: string | null;
            qrCode: string;
            userId: string;
            refId: string | null;
            createdAt: Date;
            updatedAt: Date;
            address: string | null;
            gender: import(".prisma/client").$Enums.Gender;
            birthDate: Date;
            birthPlace: string;
            status: import(".prisma/client").$Enums.LearnerStatus;
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
