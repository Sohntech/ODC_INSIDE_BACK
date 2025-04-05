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
    getActiveModules(): Promise<Module[]>;
    getModulesByReferential(refId: string): Promise<Module[]>;
}
