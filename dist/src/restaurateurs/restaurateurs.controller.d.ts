import { RestaurateursService } from './restaurateurs.service';
import { CreateRestaurateurDto } from './dto/create-restaurateur.dto';
export declare class RestaurateursController {
    private readonly restaurateursService;
    constructor(restaurateursService: RestaurateursService);
    create(createRestaurateurDto: CreateRestaurateurDto, photo?: Express.Multer.File): Promise<{
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
