import { Injectable, Logger } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';
import * as streamifier from 'streamifier';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);
  private isConfigured = false;
  private readonly maxRetries = 3;
  private readonly chunkSize = 5242880; // 5MB chunks

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
    retryCount = 0
  ): Promise<{ url: string }> {
    try {
      this.logger.log(`Attempting to upload file ${file.originalname} to folder ${folder}`);

      // Set specific upload options
      const uploadOptions = {
        folder,
        resource_type: "auto" as "auto",
        timeout: 120000, // 2 minutes timeout
        chunk_size: this.chunkSize,
      };

      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) {
              this.logger.error('Upload failed:', error);
              reject(error);
            } else {
              resolve({ url: result.secure_url });
            }
          }
        );

        // Stream the file in chunks
        streamifier.createReadStream(file.buffer).pipe(uploadStream);
      });
    } catch (error) {
      this.logger.error(`Upload failed (attempt ${retryCount + 1}):`, error);

      // Implement retry logic
      if (retryCount < this.maxRetries) {
        this.logger.log(`Retrying upload (attempt ${retryCount + 2})...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
        return this.uploadFile(file, folder, retryCount + 1);
      }

      throw error;
    }
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