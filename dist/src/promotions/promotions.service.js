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
var PromotionsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromotionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const cloudinary_service_1 = require("../cloudinary/cloudinary.service");
const client_1 = require("@prisma/client");
const fs = require("fs");
let PromotionsService = PromotionsService_1 = class PromotionsService {
    constructor(prisma, cloudinary) {
        this.prisma = prisma;
        this.cloudinary = cloudinary;
        this.logger = new common_1.Logger(PromotionsService_1.name);
    }
    async create(data, photoFile) {
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
                status: client_1.PromotionStatus.ACTIVE
            },
        });
        if (activePromotion) {
            throw new common_1.ConflictException('Une promotion active existe déjà');
        }
        if (!photoFile || !photoFile.buffer) {
            this.logger.log('No photo file or buffer, skipping photo upload');
            const createData = {
                name: data.name,
                startDate: data.startDate,
                endDate: data.endDate,
                photoUrl: null,
                status: client_1.PromotionStatus.ACTIVE,
            };
            this.logger.log('Creating promotion without photo:', createData);
            return this.prisma.promotion.create({
                data: createData,
            });
        }
        let photoUrl = null;
        try {
            this.logger.log('Attempting to upload to Cloudinary...');
            const result = await this.cloudinary.uploadFile(photoFile, 'promotions');
            photoUrl = result.url;
            this.logger.log('Successfully uploaded to Cloudinary:', photoUrl);
        }
        catch (cloudinaryError) {
            this.logger.error('Cloudinary upload failed:', cloudinaryError);
            try {
                this.logger.log('Falling back to local storage...');
                if (!fs.existsSync('./uploads')) {
                    fs.mkdirSync('./uploads', { recursive: true });
                }
                const uniquePrefix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                const extension = photoFile.originalname.split('.').pop();
                const filename = `${uniquePrefix}.${extension}`;
                const filepath = `./uploads/${filename}`;
                fs.writeFileSync(filepath, photoFile.buffer);
                photoUrl = `uploads/${filename}`;
                this.logger.log(`File saved locally at ${filepath}`);
            }
            catch (localError) {
                this.logger.error('Local storage fallback failed:', localError);
            }
        }
        const createData = {
            name: data.name,
            startDate: data.startDate,
            endDate: data.endDate,
            photoUrl,
            status: client_1.PromotionStatus.ACTIVE,
        };
        this.logger.log('Creating promotion with final data:', createData);
        return this.prisma.promotion.create({
            data: createData,
        });
    }
    async findAll() {
        return this.prisma.promotion.findMany({
            include: {
                learners: true,
                referentials: true,
            },
        });
    }
    async findOne(id) {
        const promotion = await this.prisma.promotion.findUnique({
            where: { id },
            include: {
                learners: true,
                referentials: true,
                events: true,
            },
        });
        if (!promotion) {
            throw new common_1.NotFoundException('Promotion non trouvée');
        }
        return promotion;
    }
    async update(id, data) {
        const promotion = await this.findOne(id);
        if (data.status === client_1.PromotionStatus.ACTIVE) {
            const activePromotion = await this.prisma.promotion.findFirst({
                where: {
                    status: client_1.PromotionStatus.ACTIVE,
                    id: { not: id },
                },
            });
            if (activePromotion) {
                throw new common_1.ConflictException('Une autre promotion est déjà active');
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
    async getActivePromotion() {
        const promotion = await this.prisma.promotion.findFirst({
            where: { status: client_1.PromotionStatus.ACTIVE },
            include: {
                learners: true,
                referentials: true,
                events: true,
            },
        });
        if (!promotion) {
            throw new common_1.NotFoundException('Aucune promotion active trouvée');
        }
        return promotion;
    }
    async getStatistics(id) {
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
};
exports.PromotionsService = PromotionsService;
exports.PromotionsService = PromotionsService = PromotionsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        cloudinary_service_1.CloudinaryService])
], PromotionsService);
//# sourceMappingURL=promotions.service.js.map