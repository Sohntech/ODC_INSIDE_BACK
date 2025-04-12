import { ModulesService } from './modules.service';
import { CreateModuleDto } from './dto/create-module.dto';
export declare class ModulesController {
    private readonly modulesService;
    constructor(modulesService: ModulesService);
    create(createModuleDto: CreateModuleDto, photoFile?: Express.Multer.File): Promise<{
        id: string;
        photoUrl: string | null;
        refId: string;
        createdAt: Date;
        updatedAt: Date;
        sessionId: string | null;
        name: string;
        description: string | null;
        startDate: Date;
        endDate: Date;
        coachId: string;
    }>;
    findAll(): Promise<{
        id: string;
        photoUrl: string | null;
        refId: string;
        createdAt: Date;
        updatedAt: Date;
        sessionId: string | null;
        name: string;
        description: string | null;
        startDate: Date;
        endDate: Date;
        coachId: string;
    }[]>;
    getActiveModules(): Promise<{
        id: string;
        photoUrl: string | null;
        refId: string;
        createdAt: Date;
        updatedAt: Date;
        sessionId: string | null;
        name: string;
        description: string | null;
        startDate: Date;
        endDate: Date;
        coachId: string;
    }[]>;
    getModulesByReferential(refId: string): Promise<{
        id: string;
        photoUrl: string | null;
        refId: string;
        createdAt: Date;
        updatedAt: Date;
        sessionId: string | null;
        name: string;
        description: string | null;
        startDate: Date;
        endDate: Date;
        coachId: string;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        photoUrl: string | null;
        refId: string;
        createdAt: Date;
        updatedAt: Date;
        sessionId: string | null;
        name: string;
        description: string | null;
        startDate: Date;
        endDate: Date;
        coachId: string;
    }>;
    getGradesByModule(id: string): Promise<{
        id: string;
        value: number;
        comment: string;
        createdAt: Date;
        learner: {
            id: string;
            firstName: string;
            lastName: string;
            matricule: string;
            photoUrl: string;
            referential: {
                id: string;
                name: string;
            };
        };
    }[]>;
    update(id: string, data: any): Promise<{
        id: string;
        photoUrl: string | null;
        refId: string;
        createdAt: Date;
        updatedAt: Date;
        sessionId: string | null;
        name: string;
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
            address: string | null;
            gender: import(".prisma/client").$Enums.Gender;
            birthDate: Date;
            birthPlace: string;
            phone: string;
            photoUrl: string | null;
            status: import(".prisma/client").$Enums.LearnerStatus;
            qrCode: string;
            userId: string;
            refId: string | null;
            promotionId: string;
            createdAt: Date;
            updatedAt: Date;
            sessionId: string | null;
        };
        module: {
            id: string;
            photoUrl: string | null;
            refId: string;
            createdAt: Date;
            updatedAt: Date;
            sessionId: string | null;
            name: string;
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
            address: string | null;
            gender: import(".prisma/client").$Enums.Gender;
            birthDate: Date;
            birthPlace: string;
            phone: string;
            photoUrl: string | null;
            status: import(".prisma/client").$Enums.LearnerStatus;
            qrCode: string;
            userId: string;
            refId: string | null;
            promotionId: string;
            createdAt: Date;
            updatedAt: Date;
            sessionId: string | null;
        };
        module: {
            id: string;
            photoUrl: string | null;
            refId: string;
            createdAt: Date;
            updatedAt: Date;
            sessionId: string | null;
            name: string;
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
