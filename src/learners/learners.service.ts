import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Learner, LearnerStatus } from '@prisma/client';
import * as QRCode from 'qrcode';
import * as fs from 'fs';
import { File } from 'formidable';
import { AuthUtils } from '../utils/auth.utils';

@Injectable()
export class LearnersService {
  private readonly logger = new Logger(LearnersService.name);

  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
  ) {}

  async create(data: {
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
    photoFile?: Express.Multer.File;
    tutor: {
      firstName: string;
      lastName: string;
      phone: string;
      email?: string;
      address?: string;
    };
  }): Promise<Learner> {
    this.logger.log('Creating learner with data:', {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      refId: data.refId,
      promotionId: data.promotionId
    });

    const existingLearner = await this.prisma.learner.findFirst({
      where: {
        OR: [
          { phone: data.phone },
          {
            user: {
              email: data.email,
            },
          },
        ],
      },
    });

    if (existingLearner) {
      throw new ConflictException(
        'Un apprenant avec cet email ou ce téléphone existe déjà',
      );
    }

    // Generate QR code
    const qrCodeValue = `${data.firstName}-${data.lastName}-${Date.now()}`;
    const qrCodeBuffer = await QRCode.toBuffer(qrCodeValue);

    // Create a custom File object
    const qrCodeFile = {
      fieldname: 'qrCode',
      originalname: 'qrcode.png',
      encoding: '7bit',
      mimetype: 'image/png',
      buffer: qrCodeBuffer,
      size: qrCodeBuffer.length,
      stream: null,
      destination: '',
      filename: 'qrcode.png',
      path: '',
    };

    let qrCodeUrl: string | undefined;
    
    // Upload QR code to Cloudinary
    try {
      this.logger.log('Attempting to upload QR code to Cloudinary...');
      const result = await this.cloudinary.uploadFile(qrCodeFile, 'qrcodes');
      qrCodeUrl = result.url;
      this.logger.log('Successfully uploaded QR code to Cloudinary:', qrCodeUrl);
    } catch (error) {
      this.logger.error('Failed to upload QR code to Cloudinary:', error);
    }

    let photoUrl: string | undefined;
    
    // Process photo if provided
    if (data.photoFile) {
      this.logger.log('Photo file received, processing...');
      
      try {
        // First try Cloudinary upload
        this.logger.log('Attempting to upload to Cloudinary...');
        const result = await this.cloudinary.uploadFile(data.photoFile, 'learners');
        photoUrl = result.url;
        this.logger.log('Successfully uploaded to Cloudinary:', photoUrl);
      } catch (cloudinaryError) {
        this.logger.error('Cloudinary upload failed:', cloudinaryError);
        
        // Fallback to local storage
        try {
          this.logger.log('Falling back to local storage...');
          // Create uploads directory if it doesn't exist
          if (!fs.existsSync('./uploads/learners')) {
            fs.mkdirSync('./uploads/learners', { recursive: true });
          }
          
          // Generate unique filename
          const uniquePrefix = Date.now() + '-' + Math.round(Math.random() * 1E9);
          const extension = data.photoFile.originalname.split('.').pop();
          const filename = `${uniquePrefix}.${extension}`;
          const filepath = `./uploads/learners/${filename}`;
          
          // Write the file
          fs.writeFileSync(filepath, data.photoFile.buffer);
          
          photoUrl = `uploads/learners/${filename}`;
          this.logger.log(`File saved locally at ${filepath}`);
        } catch (localError) {
          this.logger.error('Local storage fallback failed:', localError);
        }
      }
    }

    // Generate and hash password
    const password = AuthUtils.generatePassword();
    const hashedPassword = await AuthUtils.hashPassword(password);

    // Prepare createData object
    const createData: any = {
      firstName: data.firstName,
      lastName: data.lastName,
      address: data.address,
      gender: data.gender,
      birthDate: data.birthDate,
      birthPlace: data.birthPlace,
      phone: data.phone,
      photoUrl,
      qrCode: qrCodeUrl,
      status: LearnerStatus.ACTIVE,
      user: {
        create: {
          email: data.email,
          password: hashedPassword, // Use hashed password
          role: 'APPRENANT',
        },
      },
      tutor: {
        create: {
          firstName: data.tutor.firstName,
          lastName: data.tutor.lastName,
          phone: data.tutor.phone,
          email: data.tutor.email,
          address: data.tutor.address,
        },
      },
      promotion: {
        connect: {
          id: data.promotionId
        }
      },
      referential: data.refId ? {
        connect: {
          id: data.refId
        }
      } : undefined
    };

    this.logger.log('Creating learner with final data:', createData);

    const learner = await this.prisma.learner.create({
      data: createData,
      include: {
        user: true,
        promotion: true,
        referential: true,
        tutor: true,
      },
    });

    // Send password email
    await AuthUtils.sendPasswordEmail(data.email, password, 'Apprenant');

    return learner;
  }

  async findAll(): Promise<Learner[]> {
    return this.prisma.learner.findMany({
      include: {
        user: true,
        referential: true,
        promotion: true,
        tutor: true,
        kit: true,
        attendances: true,
        grades: true,
      },
    });
  }

  async findOne(id: string): Promise<Learner> {
    const learner = await this.prisma.learner.findUnique({
      where: { id },
      include: {
        user: true,
        referential: true,
        promotion: true,
        tutor: true,
        kit: true,
        attendances: true,
        grades: true,
        documents: true,
      },
    });

    if (!learner) {
      throw new NotFoundException('Apprenant non trouvé');
    }

    return learner;
  }

  async update(id: string, data: Partial<Learner>): Promise<Learner> {
    const learner = await this.findOne(id);

    return this.prisma.learner.update({
      where: { id },
      data,
      include: {
        user: true,
        referential: true,
        promotion: true,
        tutor: true,
        kit: true,
      },
    });
  }

  async updateStatus(id: string, status: LearnerStatus): Promise<Learner> {
    const learner = await this.findOne(id);

    return this.prisma.learner.update({
      where: { id },
      data: { status },
      include: {
        user: true,
        referential: true,
        promotion: true,
      },
    });
  }

  async updateKit(id: string, kitData: {
    laptop?: boolean;
    charger?: boolean;
    bag?: boolean;
    polo?: boolean;
  }): Promise<Learner> {
    const learner = await this.findOne(id);

    return this.prisma.learner.update({
      where: { id },
      data: {
        kit: {
          update: kitData,
        },
      },
      include: {
        kit: true,
      },
    });
  }

  async uploadDocument(
    id: string,
    file: Express.Multer.File,
    type: string,
    name: string,
  ) {
    this.logger.log(`Uploading document for learner ${id}`, {
      type,
      name,
      fileDetails: {
        originalname: file.originalname,
        size: file.size,
        mimetype: file.mimetype
      }
    });

    const learner = await this.findOne(id);
    
    let documentUrl: string | undefined;
    
    try {
      // Try Cloudinary upload first
      this.logger.log('Attempting to upload document to Cloudinary...');
      const result = await this.cloudinary.uploadFile(file, 'documents');
      documentUrl = result.url;
      this.logger.log('Successfully uploaded document to Cloudinary:', documentUrl);
    } catch (cloudinaryError) {
      this.logger.error('Cloudinary document upload failed:', cloudinaryError);
      
      // Fallback to local storage
      try {
        this.logger.log('Falling back to local storage for document...');
        // Create uploads directory if it doesn't exist
        if (!fs.existsSync('./uploads/documents')) {
          fs.mkdirSync('./uploads/documents', { recursive: true });
        }
        
        // Generate unique filename
        const uniquePrefix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = file.originalname.split('.').pop();
        const filename = `${uniquePrefix}.${extension}`;
        const filepath = `./uploads/documents/${filename}`;
        
        // Write the file
        fs.writeFileSync(filepath, file.buffer);
        
        documentUrl = `uploads/documents/${filename}`;
        this.logger.log(`Document saved locally at ${filepath}`);
      } catch (localError) {
        this.logger.error('Local storage fallback for document failed:', localError);
        throw new Error('Failed to upload document');
      }
    }

    return this.prisma.document.create({
      data: {
        name,
        type,
        url: documentUrl,
        learnerId: id,
      },
    });
  }

  async getAttendanceStats(id: string) {
    const learner = await this.findOne(id);
    const totalDays = await this.prisma.learnerAttendance.count({
      where: { learnerId: id },
    });
    const presentDays = await this.prisma.learnerAttendance.count({
      where: { learnerId: id, isPresent: true },
    });

    return {
      totalDays,
      presentDays,
      attendanceRate: totalDays > 0 ? (presentDays / totalDays) * 100 : 0,
    };
  }
}