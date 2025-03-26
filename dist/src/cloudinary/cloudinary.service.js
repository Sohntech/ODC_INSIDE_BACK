"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var CloudinaryService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudinaryService = void 0;
const common_1 = require("@nestjs/common");
const cloudinary_1 = require("cloudinary");
const config_1 = require("@nestjs/config");
let CloudinaryService = CloudinaryService_1 = class CloudinaryService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(CloudinaryService_1.name);
        this.isConfigured = false;
        const cloudName = this.configService.get('CLOUDINARY_CLOUD_NAME');
        const apiKey = this.configService.get('CLOUDINARY_API_KEY');
        const apiSecret = this.configService.get('CLOUDINARY_API_SECRET');
        this.logger.log('Cloudinary configuration:');
        this.logger.log(`Cloud Name: ${cloudName ? 'Found' : 'MISSING'}`);
        this.logger.log(`API Key: ${apiKey ? 'Found' : 'MISSING'}`);
        this.logger.log(`API Secret: ${apiSecret ? 'Found' : 'MISSING'}`);
        if (!cloudName || !apiKey || !apiSecret) {
            this.logger.error('Missing Cloudinary configuration! Check your .env file');
            this.isConfigured = false;
            return;
        }
        try {
            cloudinary_1.v2.config({
                cloud_name: cloudName,
                api_key: apiKey,
                api_secret: apiSecret,
            });
            this.isConfigured = true;
            this.logger.log('Cloudinary configured successfully');
        }
        catch (error) {
            this.logger.error('Error configuring Cloudinary:', error);
            this.isConfigured = false;
        }
    }
    async uploadFile(file, folder) {
        if (!this.isConfigured) {
            this.logger.error('Cloudinary is not configured');
            throw new Error('Cloudinary is not configured');
        }
        this.logger.log(`Attempting to upload file ${file.originalname} to folder ${folder}`);
        if (!file) {
            this.logger.error('File is missing or undefined');
            throw new Error('File is missing or undefined');
        }
        if (!file.buffer) {
            this.logger.error('File buffer is missing');
            throw new Error('File buffer is missing');
        }
        this.logger.log(`File details: ${file.originalname}, size: ${file.size}, mimetype: ${file.mimetype}`);
        return new Promise((resolve, reject) => {
            try {
                const uploadStream = cloudinary_1.v2.uploader.upload_stream({
                    folder,
                    resource_type: 'auto',
                }, (error, result) => {
                    if (error) {
                        this.logger.error(`Error uploading to Cloudinary: ${error.message}`);
                        return reject(error);
                    }
                    this.logger.log(`Successfully uploaded file. URL: ${result.secure_url}`);
                    resolve({
                        url: result.secure_url,
                        public_id: result.public_id,
                    });
                });
                uploadStream.end(file.buffer);
            }
            catch (error) {
                this.logger.error(`Error in Cloudinary upload stream: ${error.message}`);
                reject(error);
            }
        });
    }
    async deleteFile(publicId) {
        if (!this.isConfigured) {
            this.logger.error('Cloudinary is not configured');
            throw new Error('Cloudinary is not configured');
        }
        this.logger.log(`Attempting to delete file with public ID: ${publicId}`);
        try {
            await cloudinary_1.v2.uploader.destroy(publicId);
            this.logger.log(`Successfully deleted file with public ID: ${publicId}`);
        }
        catch (error) {
            this.logger.error(`Error deleting file: ${error.message}`);
            throw error;
        }
    }
};
exports.CloudinaryService = CloudinaryService;
exports.CloudinaryService = CloudinaryService = CloudinaryService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], CloudinaryService);
//# sourceMappingURL=cloudinary.service.js.map