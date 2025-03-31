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
    getActiveModules(): Promise<Module[]>;
    getModulesByReferential(refId: string): Promise<Module[]>;
}
