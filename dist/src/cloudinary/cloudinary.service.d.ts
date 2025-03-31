import { ConfigService } from '@nestjs/config';
export declare class CloudinaryService {
    private configService;
    private readonly logger;
    private isConfigured;
    constructor(configService: ConfigService);
    uploadFile(file: Express.Multer.File, folder: string): Promise<{
        url: string;
    }>;
    deleteFile(publicId: string): Promise<void>;
}
