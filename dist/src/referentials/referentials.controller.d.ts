import { ReferentialsService } from './referentials.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
interface CreateReferentialDto {
    name: string;
    description?: string;
    photoUrl?: string;
    capacity: number;
}
export declare class ReferentialsController {
    private readonly referentialsService;
    private readonly cloudinaryService;
    private readonly logger;
    constructor(referentialsService: ReferentialsService, cloudinaryService: CloudinaryService);
    create(formData: any, photoFile?: Express.Multer.File): Promise<{
        name: string;
        id: string;
        photoUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        capacity: number;
    }>;
    assignToPromotion(data: {
        referentialIds: string[];
        promotionId: string;
    }): Promise<{
        referentials: {
            name: string;
            id: string;
            photoUrl: string | null;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            capacity: number;
        }[];
    } & {
        name: string;
        id: string;
        photoUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.PromotionStatus;
        startDate: Date;
        endDate: Date;
    }>;
    findAll(): Promise<{
        name: string;
        id: string;
        photoUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        capacity: number;
    }[]>;
    findOne(id: string): Promise<{
        name: string;
        id: string;
        photoUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        capacity: number;
    }>;
    getStatistics(id: string): Promise<{
        totalLearners: number;
        activeModules: number;
        totalCoaches: number;
        capacity: number;
        availableSpots: number;
    }>;
    update(id: string, data: Partial<CreateReferentialDto>): Promise<{
        name: string;
        id: string;
        photoUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        capacity: number;
    }>;
}
export {};
