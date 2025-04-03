import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Gender, Learner, LearnerStatus, PrismaClient } from '@prisma/client';
import * as QRCode from 'qrcode';
import * as fs from 'fs';
import { File } from 'formidable';
import { AuthUtils } from '../utils/auth.utils';
import { CreateLearnerDto } from './dto/create-learner.dto';
import { ReplaceLearnerDto, UpdateStatusDto } from './dto/update-status.dto';
import { MatriculeUtils } from '../utils/matricule.utils';

@Injectable()
export class LearnersService {
  private readonly logger = new Logger(LearnersService.name);

  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
  ) {}

  async create(createLearnerDto: CreateLearnerDto, photoFile?: Express.Multer.File): Promise<Learner> {
    // Handle file uploads before transaction
    let photoUrl: string | undefined;
    let qrCodeUrl: string | undefined;

    // Generate matricule first (outside transaction to prepare QR code)
    const referential = createLearnerDto.refId ? 
      await this.prisma.referential.findUnique({ where: { id: createLearnerDto.refId } }) 
      : null;

    const matricule = await MatriculeUtils.generateLearnerMatricule(
      this.prisma,
      createLearnerDto.firstName,
      createLearnerDto.lastName,
      referential?.name
    );

    // Generate and upload QR code
    try {
      const qrCodeBuffer = await QRCode.toBuffer(matricule);
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

      const qrCodeResult = await this.cloudinary.uploadFile(qrCodeFile, 'qrcodes');
      qrCodeUrl = qrCodeResult.url;
    } catch (error) {
      this.logger.error('Failed to generate or upload QR code:', error);
    }

    // Handle photo upload
    if (photoFile) {
      try {
        const result = await this.cloudinary.uploadFile(photoFile, 'learners');
        photoUrl = result.url;
      } catch (error) {
        this.logger.error('Failed to upload photo:', error);
      }
    }

    // Start transaction with increased timeout
    return this.prisma.$transaction(async (prisma) => {
      const existingLearner = await prisma.learner.findFirst({
        where: {
          OR: [
            { phone: createLearnerDto.phone },
            { user: { email: createLearnerDto.email } },
          ],
        },
      });

      if (existingLearner) {
        throw new ConflictException(
          'Un apprenant avec cet email ou ce téléphone existe déjà',
        );
      }

      // Generate and hash password
      const password = AuthUtils.generatePassword();
      const hashedPassword = await AuthUtils.hashPassword(password);

      const learner = await prisma.learner.create({
        data: {
          matricule,
          firstName: createLearnerDto.firstName,
          lastName: createLearnerDto.lastName,
          address: createLearnerDto.address,
          gender: createLearnerDto.gender as Gender,
          birthDate: createLearnerDto.birthDate,
          birthPlace: createLearnerDto.birthPlace,
          phone: createLearnerDto.phone,
          photoUrl,
          qrCode: qrCodeUrl,
          status: createLearnerDto.status || LearnerStatus.ACTIVE,
          user: {
            create: {
              email: createLearnerDto.email,
              password: hashedPassword,
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
        },
        include: {
          user: true,
          promotion: true,
          referential: true,
          tutor: true,
          kit: true,
          statusHistory: true
        }
      });

      // Create initial status history
      await prisma.learnerStatusHistory.create({
        data: {
          learnerId: learner.id,
          newStatus: learner.status,
          reason: 'Initial status on creation',
          date: new Date()
        }
      });

      // Send password email after transaction
      await AuthUtils.sendPasswordEmail(createLearnerDto.email, password, 'Apprenant');

      return learner;
    }, {
      timeout: 20000 // Increase timeout to 20 seconds
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

