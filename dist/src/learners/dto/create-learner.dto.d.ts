import { LearnerStatus } from '@prisma/client';
export declare class CreateTutorDto {
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
    address?: string;
}
export declare class CreateLearnerDto {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    gender: string;
    birthDate: Date;
    birthPlace: string;
    refId?: string;
    promotionId: string;
    status?: LearnerStatus;
    tutor: {
        firstName: string;
        lastName: string;
        phone: string;
        email: string;
        address: string;
    };
}
