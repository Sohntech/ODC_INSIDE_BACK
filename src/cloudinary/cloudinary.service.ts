import { Injectable, Logger } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';
import * as streamifier from 'streamifier';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);
  private isConfigured = false;

  constructor(private configService: ConfigService) {
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
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
      });
      
      this.isConfigured = true;
      this.logger.log('Cloudinary configured successfully');
    } catch (error) {
      this.logger.error('Error configuring Cloudinary:', error);
      this.isConfigured = false;
    }
  }

  async uploadFile(file: Express.Multer.File, folder: string): Promise<{ url: string }> {
    if (!this.isConfigured) {
      throw new Error('Cloudinary is not configured');
    }

    if (!file || !file.buffer) {
      this.logger.error('File or file buffer is missing');
      throw new Error('File buffer is missing');
    }

    this.logger.log(`Attempting to upload file ${file.originalname} to folder ${folder}`);

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) {
            this.logger.error('Upload failed:', error);
            reject(error);
            return;
          }
          this.logger.log(`File uploaded successfully. URL: ${result.secure_url}`);
          resolve({ url: result.secure_url });
        }
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  async deleteFile(publicId: string): Promise<void> {
    if (!this.isConfigured) {
      this.logger.error('Cloudinary is not configured');
      throw new Error('Cloudinary is not configured');
    }
    
    this.logger.log(`Attempting to delete file with public ID: ${publicId}`);
    
    try {
      await cloudinary.uploader.destroy(publicId);
      this.logger.log(`Successfully deleted file with public ID: ${publicId}`);
    } catch (error) {
      this.logger.error(`Error deleting file: ${error.message}`);
      throw error;
    }
  }
}