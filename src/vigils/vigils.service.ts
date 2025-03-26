import { Injectable, ConflictException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { AuthUtils } from '../utils/auth.utils';
import { Vigil } from '@prisma/client';
import { CreateVigilDto } from './dto/create-vigil.dto';

@Injectable()
export class VigilsService {
  private readonly logger = new Logger(VigilsService.name);

  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
  ) {}

  async create(createVigilDto: CreateVigilDto, photoFile?: Express.Multer.File): Promise<Vigil> {
    const existingVigil = await this.prisma.vigil.findFirst({
      where: {
        OR: [
          { phone: createVigilDto.phone },
          { user: { email: createVigilDto.email } },
        ],
      },
    });

    if (existingVigil) {
      throw new ConflictException('Un vigil avec cet email ou ce téléphone existe déjà');
    }

    let photoUrl: string | undefined;
    if (photoFile) {
      try {
        const result = await this.cloudinary.uploadFile(photoFile, 'vigils');
        photoUrl = result.url;
      } catch (error) {
        this.logger.error('Failed to upload photo:', error);
      }
    }

    const password = AuthUtils.generatePassword();
    const hashedPassword = await AuthUtils.hashPassword(password);

    const vigil = await this.prisma.vigil.create({
      data: {
        firstName: createVigilDto.firstName,
        lastName: createVigilDto.lastName,
        phone: createVigilDto.phone,
        photoUrl,
        user: {
          create: {
            email: createVigilDto.email,
            password: hashedPassword,
            role: 'VIGIL',
          },
        },
      },
      include: {
        user: true,
      },
    });

    await AuthUtils.sendPasswordEmail(createVigilDto.email, password, 'Vigil');

    return vigil;
  }

  async findAll(): Promise<Vigil[]> {
    return this.prisma.vigil.findMany({
      include: {
        user: true,
      },
    });
  }

  async findOne(id: string): Promise<Vigil> {
    const vigil = await this.prisma.vigil.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });

    if (!vigil) {
      throw new NotFoundException('Vigil non trouvé');
    }

    return vigil;
  }

  async update(id: string, updateData: Partial<Vigil>): Promise<Vigil> {
    const vigil = await this.findOne(id);

    return this.prisma.vigil.update({
      where: { id },
      data: updateData,
      include: {
        user: true,
      },
    });
  }

  async remove(id: string): Promise<Vigil> {
    const vigil = await this.findOne(id);

    return this.prisma.vigil.delete({
      where: { id },
    });
  }
}