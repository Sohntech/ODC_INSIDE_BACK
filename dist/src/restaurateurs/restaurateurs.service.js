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
var RestaurateursService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestaurateursService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const cloudinary_service_1 = require("../cloudinary/cloudinary.service");
const auth_utils_1 = require("../utils/auth.utils");
let RestaurateursService = RestaurateursService_1 = class RestaurateursService {
    constructor(prisma, cloudinary) {
        this.prisma = prisma;
        this.cloudinary = cloudinary;
        this.logger = new common_1.Logger(RestaurateursService_1.name);
    }
    async create(createRestaurateurDto, photoFile) {
        const existingRestaurateur = await this.prisma.restaurateur.findFirst({
            where: {
                OR: [
                    { phone: createRestaurateurDto.phone },
                    { user: { email: createRestaurateurDto.email } },
                ],
            },
        });
        if (existingRestaurateur) {
            throw new common_1.ConflictException('Un restaurateur avec cet email ou ce téléphone existe déjà');
        }
        let photoUrl;
        if (photoFile) {
            try {
                const result = await this.cloudinary.uploadFile(photoFile, 'restaurateurs');
                photoUrl = result.url;
            }
            catch (error) {
                this.logger.error('Failed to upload photo:', error);
            }
        }
        const password = auth_utils_1.AuthUtils.generatePassword();
        const hashedPassword = await auth_utils_1.AuthUtils.hashPassword(password);
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
        await auth_utils_1.AuthUtils.sendPasswordEmail(createRestaurateurDto.email, password, 'Restaurateur');
        return restaurateur;
    }
    async findAll() {
        return this.prisma.restaurateur.findMany({
            include: {
                user: true,
            },
        });
    }
    async findOne(id) {
        const restaurateur = await this.prisma.restaurateur.findUnique({
            where: { id },
            include: {
                user: true,
            },
        });
        if (!restaurateur) {
            throw new common_1.NotFoundException('Restaurateur non trouvé');
        }
        return restaurateur;
    }
    async update(id, updateData) {
        const restaurateur = await this.findOne(id);
        return this.prisma.restaurateur.update({
            where: { id },
            data: updateData,
            include: {
                user: true,
            },
        });
    }
    async remove(id) {
        const restaurateur = await this.findOne(id);
        return this.prisma.restaurateur.delete({
            where: { id },
        });
    }
};
exports.RestaurateursService = RestaurateursService;
exports.RestaurateursService = RestaurateursService = RestaurateursService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        cloudinary_service_1.CloudinaryService])
], RestaurateursService);
//# sourceMappingURL=restaurateurs.service.js.map