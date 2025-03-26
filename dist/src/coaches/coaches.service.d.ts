import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Coach } from '@prisma/client';
export declare class CoachesService {
    private prisma;
    private cloudinary;
    private readonly logger;
    constructor(prisma: PrismaService, cloudinary: CloudinaryService);
    create(data: {
        firstName: string;
        lastName: string;
        phone?: string;
        email: string;
        password: string;
        refId?: string;
        photoFile?: Express.Multer.File;
    }): Promise<Coach>;
    findAll(): Promise<Coach[]>;
    findOne(id: string): Promise<Coach>;
    update(id: string, data: Partial<Coach>): Promise<Coach>;
    getAttendanceStats(id: string): Promise<{
        totalDays: number;
        presentDays: number;
        attendanceRate: number;
    }>;
}
