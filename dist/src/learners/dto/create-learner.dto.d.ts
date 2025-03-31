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
    address?: string;
    gender: 'MALE' | 'FEMALE';
    birthDate: Date;
    birthPlace: string;
    phone: string;
    email: string;
    refId?: string;
    promotionId: string;
    tutor: CreateTutorDto;
    addToWaitlist?: boolean;
    status?: LearnerStatus;
}
