import { ConfigService } from '@nestjs/config';
export declare class CloudinaryService {
    private configService;
    private readonly logger;
    private isConfigured;
    private readonly maxRetries;
    private readonly chunkSize;
    constructor(configService: ConfigService);
    uploadFile(file: Express.Multer.File, folder: string, retryCount?: number): Promise<{
        url: string;
    }>;
    deleteFile(publicId: string): Promise<void>;
}
