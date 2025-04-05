import { CoachesService } from './coaches.service';
import { CreateCoachDto } from './dto/create-coach.dto';
export declare class CoachesController {
    private readonly coachesService;
    constructor(coachesService: CoachesService);
    create(createCoachDto: CreateCoachDto, photoFile?: Express.Multer.File): Promise<{
        id: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        photoUrl: string | null;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        matricule: string;
        qrCode: string | null;
        refId: string | null;
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
        matricule: string;
        qrCode: string | null;
        refId: string | null;
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
        matricule: string;
        qrCode: string | null;
        refId: string | null;
    }>;
    update(id: string, data: any): Promise<{
        id: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        photoUrl: string | null;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        matricule: string;
        qrCode: string | null;
        refId: string | null;
    }>;
    getAttendanceStats(id: string): Promise<{
        totalDays: number;
        presentDays: number;
        attendanceRate: number;
    }>;
}
