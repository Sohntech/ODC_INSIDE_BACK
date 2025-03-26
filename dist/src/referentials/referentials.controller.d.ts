import { ReferentialsService } from './referentials.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
interface CreateReferentialDto {
    name: string;
    description?: string;
    photoUrl?: string;
    capacity: number;
    promotionId: string;
}
export declare class ReferentialsController {
    private readonly referentialsService;
    private readonly cloudinaryService;
    private readonly logger;
    constructor(referentialsService: ReferentialsService, cloudinaryService: CloudinaryService);
    create(formData: any, photoFile?: Express.Multer.File): Promise<{
        name: string;
        id: string;
        description: string | null;
        photoUrl: string | null;
        capacity: number;
        promotionId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(): Promise<{
        name: string;
        id: string;
        description: string | null;
        photoUrl: string | null;
        capacity: number;
        promotionId: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string): Promise<{
        name: string;
        id: string;
        description: string | null;
        photoUrl: string | null;
        capacity: number;
        promotionId: string;
        createdAt: Date;
        updatedAt: Date;
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
        description: string | null;
        photoUrl: string | null;
        capacity: number;
        promotionId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
export {};
