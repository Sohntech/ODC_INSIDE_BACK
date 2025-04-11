import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Module } from '@prisma/client';
import { CreateModuleDto } from './dto/create-module.dto';
export declare class ModulesService {
    private prisma;
    private cloudinary;
    private readonly logger;
    constructor(prisma: PrismaService, cloudinary: CloudinaryService);
    create(data: CreateModuleDto, photoFile?: Express.Multer.File): Promise<Module>;
    findAll(): Promise<Module[]>;
    findOne(id: string): Promise<Module>;
    update(id: string, data: Partial<Module>): Promise<Module>;
    addGrade(data: {
        moduleId: string;
        learnerId: string;
        value: number;
        comment?: string;
    }): Promise<{
        learner: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
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
            sessionId: string | null;
        };
        module: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            photoUrl: string | null;
            refId: string;
            sessionId: string | null;
            description: string | null;
            startDate: Date;
            endDate: Date;
            coachId: string;
        };
    } & {
        id: string;
        value: number;
        comment: string | null;
        moduleId: string;
        learnerId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateGrade(gradeId: string, data: {
        value: number;
        comment?: string;
    }): Promise<{
        learner: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
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
            sessionId: string | null;
        };
        module: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            photoUrl: string | null;
            refId: string;
            sessionId: string | null;
            description: string | null;
            startDate: Date;
            endDate: Date;
            coachId: string;
        };
    } & {
        id: string;
        value: number;
        comment: string | null;
        moduleId: string;
        learnerId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getActiveModules(): Promise<Module[]>;
    getModulesByReferential(refId: string): Promise<Module[]>;
    getGradesByModule(moduleId: string): Promise<{
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
}
