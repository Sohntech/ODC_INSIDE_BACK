import { Injectable, ConflictException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Promotion, PromotionStatus } from '@prisma/client';
import * as fs from 'fs';

@Injectable()
export class PromotionsService {
  private readonly logger = new Logger(PromotionsService.name);

  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
  ) {}

  async create(data: {
    name: string;
    startDate: Date;
    endDate: Date;
    photoUrl?: string;
  }, photoFile?: Express.Multer.File): Promise<Promotion> {
    this.logger.log('Creating promotion with data:', data);
    
    if (photoFile) {
      this.logger.log('Photo file received:', {
        filename: photoFile.originalname,
        size: photoFile.size,
        mimetype: photoFile.mimetype
      });
    }

    const activePromotion = await this.prisma.promotion.findFirst({
      where: { 
        status: PromotionStatus.ACTIVE 
      },
    });

    if (activePromotion) {
      throw new ConflictException('Une promotion active existe déjà');
    }

    // Skip photo processing if there's no file
    if (!photoFile || !photoFile.buffer) {
      this.logger.log('No photo file or buffer, skipping photo upload');
      
      const createData = {
        name: data.name,
        startDate: data.startDate,
        endDate: data.endDate,
        photoUrl: null,
        status: PromotionStatus.ACTIVE,
      };
  
      this.logger.log('Creating promotion without photo:', createData);
      
      return this.prisma.promotion.create({
        data: createData,
      });
    }
    
    let photoUrl: string | null = null;
    
    // First try Cloudinary upload
    try {
      this.logger.log('Attempting to upload to Cloudinary...');
      const result = await this.cloudinary.uploadFile(photoFile, 'promotions');
      photoUrl = result.url;
      this.logger.log('Successfully uploaded to Cloudinary:', photoUrl);
    } catch (cloudinaryError) {
      this.logger.error('Cloudinary upload failed:', cloudinaryError);
      
      // Fallback to local storage
      try {
        this.logger.log('Falling back to local storage...');
        // Create uploads directory if it doesn't exist
        if (!fs.existsSync('./uploads')) {
          fs.mkdirSync('./uploads', { recursive: true });
        }
        
        // Generate unique filename
        const uniquePrefix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = photoFile.originalname.split('.').pop();
        const filename = `${uniquePrefix}.${extension}`;
        const filepath = `./uploads/${filename}`;
        
        // Write the file
        fs.writeFileSync(filepath, photoFile.buffer);
        
        photoUrl = `uploads/${filename}`;
        this.logger.log(`File saved locally at ${filepath}`);
      } catch (localError) {
        this.logger.error('Local storage fallback failed:', localError);
      }
    }

    // Create the promotion with or without photo
    const createData = {
      name: data.name,
      startDate: data.startDate,
      endDate: data.endDate,
      photoUrl,
      status: PromotionStatus.ACTIVE,
    };
    
    this.logger.log('Creating promotion with final data:', createData);
    
    return this.prisma.promotion.create({
      data: createData,
    });
  }

  async findAll(): Promise<Promotion[]> {
    return this.prisma.promotion.findMany({
      include: {
        learners: true,
        referentials: true,
      },
    });
  }

  async findOne(id: string): Promise<Promotion> {
    const promotion = await this.prisma.promotion.findUnique({
      where: { id },
      include: {
        learners: true,
        referentials: true,
        events: true,
      },
    });

    if (!promotion) {
      throw new NotFoundException('Promotion non trouvée');
    }

    return promotion;
  }

  async update(id: string, data: Partial<Promotion>): Promise<Promotion> {
    const promotion = await this.findOne(id);

    if (data.status === PromotionStatus.ACTIVE) {
      const activePromotion = await this.prisma.promotion.findFirst({
        where: {
          status: PromotionStatus.ACTIVE,
          id: { not: id },
        },
      });

      if (activePromotion) {
        throw new ConflictException('Une autre promotion est déjà active');
      }
    }

    return this.prisma.promotion.update({
      where: { id },
      data,
      include: {
        learners: true,
        referentials: true,
      },
    });
  }

  async getActivePromotion(): Promise<Promotion> {
    const promotion = await this.prisma.promotion.findFirst({
      where: { status: PromotionStatus.ACTIVE },
      include: {
        learners: true,
        referentials: true,
        events: true,
      },
    });

    if (!promotion) {
      throw new NotFoundException('Aucune promotion active trouvée');
    }

    return promotion;
  }

  async getStatistics(id: string) {
    const promotion = await this.findOne(id);
    const learners = await this.prisma.learner.findMany({
      where: { promotionId: id },
    });

    const totalLearners = learners.length;
    const femaleLearners = learners.filter(l => l.gender === 'FEMALE').length;
    const feminizationRate = totalLearners > 0 ? (femaleLearners / totalLearners) * 100 : 0;

    const activeModules = await this.prisma.module.count({
      where: {
        referential: {
          promotionId: id,
        },
        endDate: {
          gte: new Date(),
        },
        startDate: {
          lte: new Date(),
        },
      },
    });

    const upcomingEvents = await this.prisma.event.count({
      where: {
        promotionId: id,
        startDate: {
          gte: new Date(),
        },
      },
    });

    return {
      totalLearners,
      feminizationRate,
      activeModules,
      upcomingEvents,
    };
  }
}