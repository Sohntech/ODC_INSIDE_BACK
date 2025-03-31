import { ModulesService } from './modules.service';
import { CreateModuleDto } from './dto/create-module.dto';
export declare class ModulesController {
    private readonly modulesService;
    constructor(modulesService: ModulesService);
    create(createModuleDto: CreateModuleDto, photoFile?: Express.Multer.File): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        photoUrl: string | null;
        refId: string;
        coachId: string;
        description: string | null;
        startDate: Date;
        endDate: Date;
    }>;
    findAll(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        photoUrl: string | null;
        refId: string;
        coachId: string;
        description: string | null;
        startDate: Date;
        endDate: Date;
    }[]>;
    getActiveModules(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        photoUrl: string | null;
        refId: string;
        coachId: string;
        description: string | null;
        startDate: Date;
        endDate: Date;
    }[]>;
    getModulesByReferential(refId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        photoUrl: string | null;
        refId: string;
        coachId: string;
        description: string | null;
        startDate: Date;
        endDate: Date;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        photoUrl: string | null;
        refId: string;
        coachId: string;
        description: string | null;
        startDate: Date;
        endDate: Date;
    }>;
    update(id: string, data: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        photoUrl: string | null;
        refId: string;
        coachId: string;
        description: string | null;
        startDate: Date;
        endDate: Date;
    }>;
    addGrade(moduleId: string, data: {
        learnerId: string;
        value: number;
        comment?: string;
    }): Promise<{
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
        module: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            photoUrl: string | null;
            refId: string;
            coachId: string;
            description: string | null;
            startDate: Date;
            endDate: Date;
        };
    } & {
        id: string;
        learnerId: string;
        createdAt: Date;
        updatedAt: Date;
        comment: string | null;
        value: number;
        moduleId: string;
    }>;
    updateGrade(gradeId: string, data: {
        value: number;
        comment?: string;
    }): Promise<{
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
        module: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            photoUrl: string | null;
            refId: string;
            coachId: string;
            description: string | null;
            startDate: Date;
            endDate: Date;
        };
    } & {
        id: string;
        learnerId: string;
        createdAt: Date;
        updatedAt: Date;
        comment: string | null;
        value: number;
        moduleId: string;
    }>;
}
