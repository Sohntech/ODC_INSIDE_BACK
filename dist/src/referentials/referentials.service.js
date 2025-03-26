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
exports.ReferentialsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ReferentialsService = class ReferentialsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        return this.prisma.referential.create({
            data,
            include: {
                learners: true,
                coaches: true,
                modules: true,
            },
        });
    }
    async findAll() {
        return this.prisma.referential.findMany({
            include: {
                learners: true,
                coaches: true,
                modules: true,
            },
        });
    }
    async findOne(id) {
        const referential = await this.prisma.referential.findUnique({
            where: { id },
            include: {
                learners: true,
                coaches: true,
                modules: true,
            },
        });
        if (!referential) {
            throw new common_1.NotFoundException('Référentiel non trouvé');
        }
        return referential;
    }
    async update(id, data) {
        const referential = await this.findOne(id);
        return this.prisma.referential.update({
            where: { id },
            data,
            include: {
                learners: true,
                coaches: true,
                modules: true,
            },
        });
    }
    async getStatistics(id) {
        const referential = await this.findOne(id);
        const totalLearners = await this.prisma.learner.count({
            where: { refId: id },
        });
        const activeModules = await this.prisma.module.count({
            where: {
                refId: id,
                endDate: {
                    gte: new Date(),
                },
                startDate: {
                    lte: new Date(),
                },
            },
        });
        const totalCoaches = await this.prisma.coach.count({
            where: { refId: id },
        });
        return {
            totalLearners,
            activeModules,
            totalCoaches,
            capacity: referential.capacity,
            availableSpots: referential.capacity - totalLearners,
        };
    }
};
exports.ReferentialsService = ReferentialsService;
exports.ReferentialsService = ReferentialsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReferentialsService);
//# sourceMappingURL=referentials.service.js.map