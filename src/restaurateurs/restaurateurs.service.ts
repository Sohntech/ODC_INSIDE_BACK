import { Injectable, ConflictException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { AuthUtils } from '../utils/auth.utils';
import { Restaurateur } from '@prisma/client';
import { CreateRestaurateurDto } from './dto/create-restaurateur.dto';

@Injectable()
export class RestaurateursService {
  private readonly logger = new Logger(RestaurateursService.name);

  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
  ) {}

  async create(createRestaurateurDto: CreateRestaurateurDto, photoFile?: Express.Multer.File): Promise<Restaurateur> {
    const existingRestaurateur = await this.prisma.restaurateur.findFirst({
      where: {
        OR: [
          { phone: createRestaurateurDto.phone },
          { user: { email: createRestaurateurDto.email } },
        ],
      },
    });

    if (existingRestaurateur) {
      throw new ConflictException('Un restaurateur avec cet email ou ce téléphone existe déjà');
    }

    let photoUrl: string | undefined;
    if (photoFile) {
      try {
        const result = await this.cloudinary.uploadFile(photoFile, 'restaurateurs');
        photoUrl = result.url;
      } catch (error) {
        this.logger.error('Failed to upload photo:', error);
      }
    }

    const password = AuthUtils.generatePassword();
    const hashedPassword = await AuthUtils.hashPassword(password);

    const restaurateur = await this.prisma.restaurateur.create({
      data: {
        firstName: createRestaurateurDto.firstName,
        lastName: createRestaurateurDto.lastName,
        phone: createRestaurateurDto.phone,
        photoUrl,
        user: {
          create: {
            email: createRestaurateurDto.email,
            password: hashedPassword,
            role: 'RESTAURATEUR',
          },
        },
      },
      include: {
        user: true,
      },
    });

    await AuthUtils.sendPasswordEmail(createRestaurateurDto.email, password, 'Restaurateur');

    return restaurateur;
  }

  async findAll(): Promise<Restaurateur[]> {
    return this.prisma.restaurateur.findMany({
      include: {
        user: true,
      },
    });
  }

  async findOne(id: string): Promise<Restaurateur> {
    const restaurateur = await this.prisma.restaurateur.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });

    if (!restaurateur) {
      throw new NotFoundException('Restaurateur non trouvé');
    }

    return restaurateur;
  }

  async update(id: string, updateData: Partial<Restaurateur>): Promise<Restaurateur> {
    const restaurateur = await this.findOne(id);

    return this.prisma.restaurateur.update({
      where: { id },
      data: updateData,
      include: {
        user: true,
      },
    });
  }

  async remove(id: string): Promise<Restaurateur> {
    const restaurateur = await this.findOne(id);

    return this.prisma.restaurateur.delete({
      where: { id },
    });
  }
}