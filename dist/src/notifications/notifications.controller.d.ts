import { NotificationsService } from "./notifications.service";
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    getUnreadNotifications(req: any): Promise<({
        sender: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            password: string;
            role: import(".prisma/client").$Enums.UserRole;
        };
    } & {
        id: string;
        createdAt: Date;
        type: import(".prisma/client").$Enums.NotificationType;
        message: string;
        read: boolean;
        receiverId: string;
        senderId: string | null;
        attendanceId: string | null;
    })[]>;
    markAsRead(id: string, req: any): Promise<{
        id: string;
        createdAt: Date;
        type: import(".prisma/client").$Enums.NotificationType;
        message: string;
        read: boolean;
        receiverId: string;
        senderId: string | null;
        attendanceId: string | null;
    }>;
}
