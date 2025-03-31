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
let PromotionsService = PromotionsService_1 = class PromotionsService {
    constructor(prisma, cloudinary) {
        this.prisma = prisma;
        this.cloudinary = cloudinary;
        this.logger = new common_1.Logger(PromotionsService_1.name);
    }
    async create(data, photoFile) {
        try {
            let processedReferentialIds = [];
            if (data.referentialIds) {
                try {
                    processedReferentialIds = typeof data.referentialIds === 'string'
                        ? JSON.parse(data.referentialIds.replace(/\s/g, ''))
                        : data.referentialIds;
                }
                catch (e) {
                    this.logger.error(`Error parsing referentialIds: ${e.message}`);
                    throw new common_1.ConflictException('Invalid referentialIds format');
                }
            }
            this.logger.debug(`Processed referentialIds: ${JSON.stringify(processedReferentialIds)}`);
            let photoUrl = data.photoUrl;
            if (photoFile) {
                const uploadResult = await this.cloudinary.uploadFile(photoFile, 'promotions');
                photoUrl = uploadResult.url;
            }
            return await this.prisma.$transaction(async (prisma) => {
                if (processedReferentialIds.length > 0) {
                    const existingReferentials = await prisma.referential.findMany({
                        where: { id: { in: processedReferentialIds } },
                        select: { id: true, name: true }
                    });
                    this.logger.debug(`Found referentials: ${JSON.stringify(existingReferentials)}`);
                    if (existingReferentials.length !== processedReferentialIds.length) {
                        const foundIds = existingReferentials.map(ref => ref.id);
                        const missingIds = processedReferentialIds.filter(id => !foundIds.includes(id));
                        throw new common_1.NotFoundException(`Referentials not found: ${missingIds.join(', ')}`);
                    }
                }
                const createData = {
                    name: data.name,
                    startDate: new Date(data.startDate),
                    endDate: new Date(data.endDate),
                    photoUrl,
                    status: client_1.PromotionStatus.ACTIVE,
                    referentials: processedReferentialIds.length > 0 ? {
                        connect: processedReferentialIds.map(id => ({ id }))
                    } : undefined
                };
                this.logger.log('Creating promotion with data:', JSON.stringify(createData, null, 2));
                return prisma.promotion.create({
                    data: createData,
                    include: {
                        referentials: true,
                        learners: true
                    }
                });
            });
        }
        catch (error) {
            this.logger.error(`Creation failed: ${error.message}`);
            throw error;
        }
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
                referentials: true,
                learners: true,
                events: true,
            }
        });
        if (!promotion) {
            throw new common_1.NotFoundException(`Promotion with ID ${id} not found`);
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
                    promotions: { some: { id } },
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