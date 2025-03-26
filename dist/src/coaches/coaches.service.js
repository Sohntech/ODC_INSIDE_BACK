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
const fs = require("fs");
let CoachesService = CoachesService_1 = class CoachesService {
    constructor(prisma, cloudinary) {
        this.prisma = prisma;
        this.cloudinary = cloudinary;
        this.logger = new common_1.Logger(CoachesService_1.name);
    }
    async create(data) {
        this.logger.log('Creating coach with data:', {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            refId: data.refId
        });
        const existingCoach = await this.prisma.coach.findFirst({
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
        if (existingCoach) {
            throw new common_1.ConflictException('Un coach avec cet email ou ce téléphone existe déjà');
        }
        let photoUrl;
        if (data.photoFile) {
            this.logger.log('Photo file received, processing...');
            try {
                this.logger.log('Attempting to upload to Cloudinary...');
                const result = await this.cloudinary.uploadFile(data.photoFile, 'coaches');
                photoUrl = result.url;
                this.logger.log('Successfully uploaded to Cloudinary:', photoUrl);
            }
            catch (cloudinaryError) {
                this.logger.error('Cloudinary upload failed:', cloudinaryError);
                try {
                    this.logger.log('Falling back to local storage...');
                    if (!fs.existsSync('./uploads/coaches')) {
                        fs.mkdirSync('./uploads/coaches', { recursive: true });
                    }
                    const uniquePrefix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                    const extension = data.photoFile.originalname.split('.').pop();
                    const filename = `${uniquePrefix}.${extension}`;
                    const filepath = `./uploads/coaches/${filename}`;
                    fs.writeFileSync(filepath, data.photoFile.buffer);
                    photoUrl = `uploads/coaches/${filename}`;
                    this.logger.log(`File saved locally at ${filepath}`);
                }
                catch (localError) {
                    this.logger.error('Local storage fallback failed:', localError);
                }
            }
        }
        const createData = {
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            photoUrl,
            user: {
                create: {
                    email: data.email,
                    password: data.password,
                    role: 'COACH',
                },
            },
        };
        if (data.refId) {
            createData.refId = data.refId;
            createData.referential = {
                connect: {
                    id: data.refId
                }
            };
        }
        this.logger.log('Creating coach with final data:', createData);
        return this.prisma.coach.create({
            data: createData,
            include: {
                user: true,
                referential: true,
            },
        });
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