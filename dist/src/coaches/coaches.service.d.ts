import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Coach } from '@prisma/client';
import { CreateCoachDto } from './dto/create-coach.dto';
export declare class CoachesService {
    private prisma;
    private cloudinary;
    private readonly logger;
    constructor(prisma: PrismaService, cloudinary: CloudinaryService);
    create(createCoachDto: CreateCoachDto, photoFile?: Express.Multer.File): Promise<Coach>;
    findAll(): Promise<Coach[]>;
    findOne(id: string): Promise<Coach>;
    update(id: string, data: Partial<Coach>): Promise<Coach>;
    getAttendanceStats(id: string): Promise<{
        totalDays: number;
        presentDays: number;
        attendanceRate: number;
    }>;
}
