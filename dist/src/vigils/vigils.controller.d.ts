import { VigilsService } from './vigils.service';
import { CreateVigilDto } from './dto/create-vigil.dto';
export declare class VigilsController {
    private readonly vigilsService;
    constructor(vigilsService: VigilsService);
    create(createVigilDto: CreateVigilDto, photo?: Express.Multer.File): Promise<{
        id: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        photoUrl: string | null;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(): Promise<{
        id: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        photoUrl: string | null;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        photoUrl: string | null;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, updateData: any): Promise<{
        id: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        photoUrl: string | null;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        id: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        photoUrl: string | null;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
