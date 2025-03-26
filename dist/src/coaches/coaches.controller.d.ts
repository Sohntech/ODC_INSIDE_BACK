import { CoachesService } from './coaches.service';
export declare class CoachesController {
    private readonly coachesService;
    constructor(coachesService: CoachesService);
    create(data: any, photoFile?: Express.Multer.File): Promise<{
        id: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        photoUrl: string | null;
        userId: string;
        refId: string | null;
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
        refId: string | null;
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
        refId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, data: any): Promise<{
        id: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        photoUrl: string | null;
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
