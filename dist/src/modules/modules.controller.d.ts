import { ModulesService } from './modules.service';
import { CreateModuleDto } from './dto/create-module.dto';
export declare class ModulesController {
    private readonly modulesService;
    constructor(modulesService: ModulesService);
    create(createModuleDto: CreateModuleDto, photoFile?: Express.Multer.File): Promise<{
        name: string;
        id: string;
        photoUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
        refId: string;
        sessionId: string | null;
        description: string | null;
        startDate: Date;
        endDate: Date;
        coachId: string;
    }>;
    findAll(): Promise<{
        name: string;
        id: string;
        photoUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
        refId: string;
        sessionId: string | null;
        description: string | null;
        startDate: Date;
        endDate: Date;
        coachId: string;
    }[]>;
    getActiveModules(): Promise<{
        name: string;
        id: string;
        photoUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
        refId: string;
        sessionId: string | null;
        description: string | null;
        startDate: Date;
        endDate: Date;
        coachId: string;
    }[]>;
    getModulesByReferential(refId: string): Promise<{
        name: string;
        id: string;
        photoUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
        refId: string;
        sessionId: string | null;
        description: string | null;
        startDate: Date;
        endDate: Date;
        coachId: string;
    }[]>;
    findOne(id: string): Promise<{
        name: string;
        id: string;
        photoUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
        refId: string;
        sessionId: string | null;
        description: string | null;
        startDate: Date;
        endDate: Date;
        coachId: string;
    }>;
    update(id: string, data: any): Promise<{
        name: string;
        id: string;
        photoUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
        refId: string;
        sessionId: string | null;
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
            firstName: string;
            lastName: string;
            phone: string;
            photoUrl: string | null;
            userId: string;
            createdAt: Date;
            updatedAt: Date;
            matricule: string;
            address: string | null;
            gender: import(".prisma/client").$Enums.Gender;
            birthDate: Date;
            birthPlace: string;
            status: import(".prisma/client").$Enums.LearnerStatus;
            qrCode: string;
            refId: string | null;
            promotionId: string;
            sessionId: string | null;
        };
        module: {
            name: string;
            id: string;
            photoUrl: string | null;
            createdAt: Date;
            updatedAt: Date;
            refId: string;
            sessionId: string | null;
            description: string | null;
            startDate: Date;
            endDate: Date;
            coachId: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        value: number;
        comment: string | null;
        moduleId: string;
        learnerId: string;
    }>;
    updateGrade(gradeId: string, data: {
        value: number;
        comment?: string;
    }): Promise<{
        learner: {
            id: string;
            firstName: string;
            lastName: string;
            phone: string;
            photoUrl: string | null;
            userId: string;
            createdAt: Date;
            updatedAt: Date;
            matricule: string;
            address: string | null;
            gender: import(".prisma/client").$Enums.Gender;
            birthDate: Date;
            birthPlace: string;
            status: import(".prisma/client").$Enums.LearnerStatus;
            qrCode: string;
            refId: string | null;
            promotionId: string;
            sessionId: string | null;
        };
        module: {
            name: string;
            id: string;
            photoUrl: string | null;
            createdAt: Date;
            updatedAt: Date;
            refId: string;
            sessionId: string | null;
            description: string | null;
            startDate: Date;
            endDate: Date;
            coachId: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        value: number;
        comment: string | null;
        moduleId: string;
        learnerId: string;
    }>;
}
