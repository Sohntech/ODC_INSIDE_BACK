import { ModulesService } from './modules.service';
import { CreateModuleDto } from './dto/create-module.dto';
export declare class ModulesController {
    private readonly modulesService;
    constructor(modulesService: ModulesService);
    create(createModuleDto: CreateModuleDto, photoFile?: Express.Multer.File): Promise<{
        name: string;
        id: string;
        photoUrl: string | null;
        refId: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        startDate: Date;
        endDate: Date;
        coachId: string;
    }>;
    findAll(): Promise<{
        name: string;
        id: string;
        photoUrl: string | null;
        refId: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        startDate: Date;
        endDate: Date;
        coachId: string;
    }[]>;
    getActiveModules(): Promise<{
        name: string;
        id: string;
        photoUrl: string | null;
        refId: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        startDate: Date;
        endDate: Date;
        coachId: string;
    }[]>;
    getModulesByReferential(refId: string): Promise<{
        name: string;
        id: string;
        photoUrl: string | null;
        refId: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        startDate: Date;
        endDate: Date;
        coachId: string;
    }[]>;
    findOne(id: string): Promise<{
        name: string;
        id: string;
        photoUrl: string | null;
        refId: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        startDate: Date;
        endDate: Date;
        coachId: string;
    }>;
    update(id: string, data: any): Promise<{
        name: string;
        id: string;
        photoUrl: string | null;
        refId: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
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
        module: {
            name: string;
            id: string;
            photoUrl: string | null;
            refId: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
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
        module: {
            name: string;
            id: string;
            photoUrl: string | null;
            refId: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
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
