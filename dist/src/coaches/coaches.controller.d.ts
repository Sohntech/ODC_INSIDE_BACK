import { CoachesService } from './coaches.service';
import { CreateCoachDto } from './dto/create-coach.dto';
export declare class CoachesController {
    private readonly coachesService;
    constructor(coachesService: CoachesService);
    create(createCoachDto: CreateCoachDto, photoFile?: Express.Multer.File): Promise<{
        id: string;
        matricule: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        photoUrl: string | null;
        qrCode: string | null;
        userId: string;
        refId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(): Promise<{
        id: string;
        matricule: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        photoUrl: string | null;
        qrCode: string | null;
        userId: string;
        refId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        matricule: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        photoUrl: string | null;
        qrCode: string | null;
        userId: string;
        refId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, data: any): Promise<{
        id: string;
        matricule: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        photoUrl: string | null;
        qrCode: string | null;
        userId: string;
        refId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getAttendanceStats(id: string): Promise<{
        totalDays: number;
        presentDays: number;
        attendanceRate: number;
    }>;
}
