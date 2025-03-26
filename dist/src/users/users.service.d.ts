import { PrismaService } from '../prisma/prisma.service';
import { User, UserRole } from '@prisma/client';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findByEmail(email: string): Promise<User | null>;
    findById(id: string): Promise<User | null>;
    create(data: {
        email: string;
        password: string;
        role: UserRole;
    }): Promise<User>;
    update(id: string, data: Partial<User>): Promise<User>;
}
