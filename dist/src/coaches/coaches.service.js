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
var CoachesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoachesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const cloudinary_service_1 = require("../cloudinary/cloudinary.service");
const client_1 = require("@prisma/client");
const auth_utils_1 = require("../utils/auth.utils");
let CoachesService = CoachesService_1 = class CoachesService {
    constructor(prisma, cloudinary) {
        this.prisma = prisma;
        this.cloudinary = cloudinary;
        this.logger = new common_1.Logger(CoachesService_1.name);
    }
    async create(createCoachDto, photoFile) {
        this.logger.log('Starting coach creation process...', {
            hasFile: !!photoFile,
            fileName: photoFile?.originalname,
            fileSize: photoFile?.size
        });
        let photoUrl;
        if (photoFile) {
            try {
                this.logger.log(`Uploading file: ${photoFile.originalname}`);
                const uploadResult = await this.cloudinary.uploadFile(photoFile, 'coaches');
                photoUrl = uploadResult.url;
                this.logger.log('Photo uploaded successfully', { photoUrl });
            }
            catch (error) {
                this.logger.error('Failed to upload photo:', error);
                throw new Error(`Failed to upload photo: ${error.message}`);
            }
        }
        try {
            const coach = await this.prisma.$transaction(async (prisma) => {
                const existingCoach = await prisma.coach.findFirst({
                    where: {
                        OR: [
                            { phone: createCoachDto.phone },
                            { user: { email: createCoachDto.email } },
                        ],
                    },
                });
                if (existingCoach) {
                    throw new common_1.ConflictException('Un coach avec cet email ou ce téléphone existe déjà');
                }
                const password = auth_utils_1.AuthUtils.generatePassword();
                const hashedPassword = await auth_utils_1.AuthUtils.hashPassword(password);
                const coachData = {
                    firstName: createCoachDto.firstName,
                    lastName: createCoachDto.lastName,
                    phone: createCoachDto.phone,
                    photoUrl,
                    ...(createCoachDto.refId && {
                        referential: {
                            connect: { id: createCoachDto.refId }
                        }
                    }),
                    user: {
                        create: {
                            email: createCoachDto.email,
                            password: hashedPassword,
                            role: client_1.UserRole.COACH
                        }
                    }
                };
                this.logger.log('Creating coach with data:', coachData);
                const newCoach = await prisma.coach.create({
                    data: coachData,
                    include: {
                        user: true,
                        referential: true,
                    },
                });
                await auth_utils_1.AuthUtils.sendPasswordEmail(createCoachDto.email, password, 'Coach');
                return newCoach;
            });
            this.logger.log('Coach created successfully:', coach.id);
            return coach;
        }
        catch (error) {
            this.logger.error('Failed to create coach:', error);
            throw error;
        }
    }
    async findAll() {
        return this.prisma.coach.findMany({
            include: {
                user: true,
                referential: true,
                modules: true,
                attendances: true,
            },
        });
    }
    async findOne(id) {
        const coach = await this.prisma.coach.findUnique({
            where: { id },
            include: {
                user: true,
                referential: true,
                modules: true,
                attendances: true,
            },
        });
        if (!coach) {
            throw new common_1.NotFoundException('Coach non trouvé');
        }
        return coach;
    }
    async update(id, data) {
        const coach = await this.findOne(id);
        return this.prisma.coach.update({
            where: { id },
            data,
            include: {
                user: true,
                referential: true,
                modules: true,
            },
        });
    }
    async getAttendanceStats(id) {
        const coach = await this.findOne(id);
        const totalDays = await this.prisma.coachAttendance.count({
            where: { coachId: id },
        });
        const presentDays = await this.prisma.coachAttendance.count({
            where: { coachId: id, isPresent: true },
        });
        return {
            totalDays,
            presentDays,
            attendanceRate: totalDays > 0 ? (presentDays / totalDays) * 100 : 0,
        };
    }
};
exports.CoachesService = CoachesService;
exports.CoachesService = CoachesService = CoachesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        cloudinary_service_1.CloudinaryService])
], CoachesService);
//# sourceMappingURL=coaches.service.js.map