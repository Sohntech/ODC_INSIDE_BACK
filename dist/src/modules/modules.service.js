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
var ModulesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModulesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const cloudinary_service_1 = require("../cloudinary/cloudinary.service");
let ModulesService = ModulesService_1 = class ModulesService {
    constructor(prisma, cloudinary) {
        this.prisma = prisma;
        this.cloudinary = cloudinary;
        this.logger = new common_1.Logger(ModulesService_1.name);
    }
    async create(data, photoFile) {
        this.logger.log('Creating module with data:', { ...data, hasPhoto: !!photoFile });
        let photoUrl;
        if (photoFile) {
            try {
                this.logger.log(`Uploading photo: ${photoFile.originalname}`);
                const uploadResult = await this.cloudinary.uploadFile(photoFile, 'modules');
                photoUrl = uploadResult.url;
                this.logger.log('Photo uploaded successfully', { photoUrl });
            }
            catch (error) {
                this.logger.error('Failed to upload photo:', error);
                throw new Error(`Failed to upload photo: ${error.message}`);
            }
        }
        return this.prisma.module.create({
            data: {
                name: data.name,
                description: data.description,
                startDate: new Date(data.startDate),
                endDate: new Date(data.endDate),
                photoUrl,
                coach: {
                    connect: { id: data.coachId }
                },
                referential: {
                    connect: { id: data.refId }
                }
            },
            include: {
                coach: true,
                referential: true,
                grades: true,
            },
        });
    }
    async findAll() {
        return this.prisma.module.findMany({
            include: {
                coach: true,
                referential: true,
                grades: true,
            },
        });
    }
    async findOne(id) {
        const module = await this.prisma.module.findUnique({
            where: { id },
            include: {
                coach: true,
                referential: true,
                grades: true,
            },
        });
        if (!module) {
            throw new common_1.NotFoundException('Module non trouvé');
        }
        return module;
    }
    async update(id, data) {
        const module = await this.findOne(id);
        return this.prisma.module.update({
            where: { id },
            data,
            include: {
                coach: true,
                referential: true,
                grades: true,
            },
        });
    }
    async addGrade(data) {
        const module = await this.findOne(data.moduleId);
        return this.prisma.grade.create({
            data: {
                value: data.value,
                comment: data.comment,
                moduleId: data.moduleId,
                learnerId: data.learnerId,
            },
            include: {
                module: true,
                learner: true,
            },
        });
    }
    async updateGrade(gradeId, data) {
        return this.prisma.grade.update({
            where: { id: gradeId },
            data,
            include: {
                module: true,
                learner: true,
            },
        });
    }
    async getActiveModules() {
        const now = new Date();
        return this.prisma.module.findMany({
            where: {
                startDate: {
                    lte: now,
                },
                endDate: {
                    gte: now,
                },
            },
            include: {
                coach: true,
                referential: true,
                grades: true,
            },
        });
    }
    async getModulesByReferential(refId) {
        return this.prisma.module.findMany({
            where: {
                refId,
            },
            include: {
                coach: true,
                referential: true,
                grades: true,
            },
        });
    }
    async getGradesByModule(moduleId) {
        const module = await this.prisma.module.findUnique({
            where: { id: moduleId },
            include: {
                grades: {
                    include: {
                        learner: {
                            include: {
                                referential: {
                                    select: {
                                        id: true,
                                        name: true
                                    }
                                }
                            },
                        }
                    }
                }
            }
        });
        if (!module) {
            throw new common_1.NotFoundException(`Module with ID ${moduleId} not found`);
        }
        return module.grades.map(grade => ({
            id: grade.id,
            value: grade.value,
            comment: grade.comment,
            createdAt: grade.createdAt,
            learner: {
                id: grade.learner.id,
                firstName: grade.learner.firstName,
                lastName: grade.learner.lastName,
                matricule: grade.learner.matricule,
                photoUrl: grade.learner.photoUrl,
                referential: grade.learner.referential
            }
        }));
    }
};
exports.ModulesService = ModulesService;
exports.ModulesService = ModulesService = ModulesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        cloudinary_service_1.CloudinaryService])
], ModulesService);
//# sourceMappingURL=modules.service.js.map