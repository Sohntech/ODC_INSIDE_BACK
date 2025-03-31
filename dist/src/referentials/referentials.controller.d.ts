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
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        photoUrl: string | null;
        description: string | null;
        capacity: number;
    }>;
    assignToPromotion(data: {
        referentialIds: string[];
        promotionId: string;
    }): Promise<{
        referentials: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            photoUrl: string | null;
            description: string | null;
            capacity: number;
        }[];
    } & {
        id: string;
        status: import(".prisma/client").$Enums.PromotionStatus;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        photoUrl: string | null;
        startDate: Date;
        endDate: Date;
    }>;
    findAll(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        photoUrl: string | null;
        description: string | null;
        capacity: number;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        photoUrl: string | null;
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
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        photoUrl: string | null;
        description: string | null;
        capacity: number;
    }>;
}
export {};
