import { Injectable, Logger } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';

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

  async uploadFile(
    file: Express.Multer.File,
    folder: string,
  ): Promise<{ url: string; public_id: string }> {
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
      // Use try-catch to catch any configuration errors
      try {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: 'auto',
          },
          (error, result) => {
            if (error) {
              this.logger.error(`Error uploading to Cloudinary: ${error.message}`);
              return reject(error);
            }
            
            this.logger.log(`Successfully uploaded file. URL: ${result.secure_url}`);
            
            resolve({
              url: result.secure_url,
              public_id: result.public_id,
            });
          },
        );

        uploadStream.end(file.buffer);
      } catch (error) {
        this.logger.error(`Error in Cloudinary upload stream: ${error.message}`);
        reject(error);
      }
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