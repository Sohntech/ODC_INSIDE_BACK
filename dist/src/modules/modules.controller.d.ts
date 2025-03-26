import { ModulesService } from './modules.service';
export declare class ModulesController {
    private readonly modulesService;
    constructor(modulesService: ModulesService);
    create(data: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        refId: string;
        startDate: Date;
        endDate: Date;
        coachId: string;
    }>;
    findAll(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        refId: string;
        startDate: Date;
        endDate: Date;
        coachId: string;
    }[]>;
    getActiveModules(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        refId: string;
        startDate: Date;
        endDate: Date;
        coachId: string;
    }[]>;
    getModulesByReferential(refId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        refId: string;
        startDate: Date;
        endDate: Date;
        coachId: string;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        refId: string;
        startDate: Date;
        endDate: Date;
        coachId: string;
    }>;
    update(id: string, data: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        refId: string;
        startDate: Date;
        endDate: Date;
        coachId: string;
    }>;
    addGrade(moduleId: string, data: {
        learnerId: string;
        value: number;
        comment?: string;
    }): Promise<{
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
        module: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            refId: string;
            startDate: Date;
            endDate: Date;
            coachId: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        learnerId: string;
        value: number;
        comment: string | null;
        moduleId: string;
    }>;
    updateGrade(gradeId: string, data: {
        value: number;
        comment?: string;
    }): Promise<{
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
        module: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            refId: string;
            startDate: Date;
            endDate: Date;
            coachId: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        learnerId: string;
        value: number;
        comment: string | null;
        moduleId: string;
    }>;
}
