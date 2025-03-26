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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModulesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ModulesService = class ModulesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        return this.prisma.module.create({
            data,
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
};
exports.ModulesService = ModulesService;
exports.ModulesService = ModulesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ModulesService);
//# sourceMappingURL=modules.service.js.map