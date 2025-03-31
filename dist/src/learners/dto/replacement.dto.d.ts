import { LearnerStatus } from '@prisma/client';
export declare class ReplacementDto {
    activeLearnerForReplacement: string;
    waitingLearnerId: string;
    reason: string;
}
export declare class UpdateStatusDto {
    status: LearnerStatus;
    reason: string;
}
