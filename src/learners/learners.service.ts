import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Learner, LearnerStatus } from '@prisma/client';
import * as QRCode from 'qrcode';
import * as fs from 'fs';
import { File } from 'formidable';
import { AuthUtils } from '../utils/auth.utils';
import { CreateLearnerDto } from './dto/create-learner.dto';
import { ReplaceLearnerDto, UpdateStatusDto } from './dto/update-status.dto';

@Injectable()
export class LearnersService {
  private readonly logger = new Logger(LearnersService.name);

  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
  ) {}

  async create(createLearnerDto: CreateLearnerDto, photoFile?: Express.Multer.File): Promise<Learner> {
    return this.prisma.$transaction(async (prisma) => {
      // Add this logging
      this.logger.log('Received photo file:', {
        exists: !!photoFile,
        details: photoFile ? {
          fieldname: photoFile.fieldname,
          originalname: photoFile.originalname,
          size: photoFile.size,
          mimetype: photoFile.mimetype
        } : null
      });

      this.logger.log('Creating learner with data:', {
        firstName: createLearnerDto.firstName,
        lastName: createLearnerDto.lastName,
        email: createLearnerDto.email,
        refId: createLearnerDto.refId,
        promotionId: createLearnerDto.promotionId
      });

      const existingLearner = await prisma.learner.findFirst({
        where: {
          OR: [
            { phone: createLearnerDto.phone },
            {
              user: {
                email: createLearnerDto.email,
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
      const qrCodeValue = `${createLearnerDto.firstName}-${createLearnerDto.lastName}-${Date.now()}`;
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
      if (photoFile) {
        this.logger.log('Photo file received, processing...');
        
        try {
          // First try Cloudinary upload
          this.logger.log('Attempting to upload to Cloudinary...');
          const result = await this.cloudinary.uploadFile(photoFile, 'learners');
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
            const extension = photoFile.originalname.split('.').pop();
            const filename = `${uniquePrefix}.${extension}`;
            const filepath = `./uploads/learners/${filename}`;
            
            // Write the file
            fs.writeFileSync(filepath, photoFile.buffer);
            
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
        firstName: createLearnerDto.firstName,
        lastName: createLearnerDto.lastName,
        address: createLearnerDto.address,
        gender: createLearnerDto.gender,
        birthDate: createLearnerDto.birthDate,
        birthPlace: createLearnerDto.birthPlace,
        phone: createLearnerDto.phone,
        photoUrl,
        qrCode: qrCodeUrl,
        status: createLearnerDto.status || LearnerStatus.ACTIVE,
        user: {
          create: {
            email: createLearnerDto.email,
            password: hashedPassword, // Use hashed password
            role: 'APPRENANT',
          },
        },
        tutor: {
          create: {
            firstName: createLearnerDto.tutor.firstName,
            lastName: createLearnerDto.tutor.lastName,
            phone: createLearnerDto.tutor.phone,
            email: createLearnerDto.tutor.email,
            address: createLearnerDto.tutor.address,
          },
        },
        promotion: {
          connect: {
            id: createLearnerDto.promotionId
          }
        },
        referential: createLearnerDto.refId ? {
          connect: {
            id: createLearnerDto.refId
          }
        } : undefined,
        kit: {
          create: {
            laptop: false,
            charger: false,
            bag: false,
            polo: false
          }
        }
      };

      this.logger.log('Creating learner with final data:', createData);

      const learner = await prisma.learner.create({
        data: createData,
        include: {
          user: true,
          promotion: true,
          referential: true,
          tutor: true,
          kit: true,
          statusHistory: true // Add this to track initial status
        },
      });

      // Create initial status history without previousStatus for new learners
      await prisma.learnerStatusHistory.create({
        data: {
          learnerId: learner.id,
          newStatus: learner.status,
          reason: 'Initial status on creation',
          date: new Date()
        }
      });

      // Send password email
      await AuthUtils.sendPasswordEmail(createLearnerDto.email, password, 'Apprenant');

      return learner;
    });
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

  async updateLearnerStatus(
    learnerId: string,
    updateStatusDto: UpdateStatusDto
  ): Promise<Learner> {
    const learner = await this.findOne(learnerId);
    
    this.logger.log(`Updating learner ${learnerId} status from ${learner.status} to ${updateStatusDto.status}`);

    return this.prisma.$transaction(async (prisma) => {
      // Create status history record
      await prisma.learnerStatusHistory.create({
        data: {
          learnerId,
          previousStatus: learner.status,
          newStatus: updateStatusDto.status,
          reason: updateStatusDto.reason,
        }
      });

      // Update learner status
      return prisma.learner.update({
        where: { id: learnerId },
        data: {
          status: updateStatusDto.status,
        },
        include: {
          user: true,
          promotion: true,
          referential: true,
          statusHistory: true
        }
      });
    });
  }

  async replaceLearner(replacementDto: ReplaceLearnerDto): Promise<{
    replacedLearner: Learner;
    replacementLearner: Learner;
  }> {
    const { activeLearnerForReplacement, replacementLearnerId, reason } = replacementDto;

    return this.prisma.$transaction(async (prisma) => {
      // 1. Verify active learner
      const activeLearner = await prisma.learner.findUnique({
        where: { id: activeLearnerForReplacement },
        include: { promotion: true }
      });

      if (!activeLearner || activeLearner.status !== 'ACTIVE') {
        throw new ConflictException('Invalid active learner or learner is not active');
      }

      // 2. Verify waiting list learner
      const waitingLearner = await prisma.learner.findUnique({
        where: { id: replacementLearnerId },
      });

      if (!waitingLearner || waitingLearner.status !== 'WAITING') {
        throw new ConflictException('Invalid replacement learner or learner is not in waiting list');
      }

      // 3. Update active learner to REPLACED
      const replacedLearner = await prisma.learner.update({
        where: { id: activeLearnerForReplacement },
        data: {
          status: 'REPLACED',
          statusHistory: {
            create: {
              previousStatus: 'ACTIVE',
              newStatus: 'REPLACED',
              reason,
              date: new Date()
            }
          }
        },
        include: { promotion: true }
      });

      // 4. Update waiting learner to REPLACEMENT
      const replacementLearner = await prisma.learner.update({
        where: { id: replacementLearnerId },
        data: {
          status: 'REPLACEMENT',
          promotionId: activeLearner.promotionId,
          statusHistory: {
            create: {
              previousStatus: 'WAITING',
              newStatus: 'REPLACEMENT',
              reason,
              date: new Date()
            }
          }
        },
        include: { promotion: true }
      });

      return { replacedLearner, replacementLearner };
    });
  }

  async getWaitingList(promotionId?: string): Promise<Learner[]> {
    return this.prisma.learner.findMany({
      where: {
        status: 'WAITING',
        ...(promotionId && { promotionId })
      },
      include: {
        user: true,
        promotion: true
      }
    });
  }

  async getStatusHistory(learnerId: string) {
    return this.prisma.learnerStatusHistory.findMany({
      where: { learnerId },
      orderBy: { date: 'desc' }
    });
  }
}

