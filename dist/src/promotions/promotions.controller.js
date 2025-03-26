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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var PromotionsController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromotionsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const promotions_service_1 = require("./promotions.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const client_1 = require("@prisma/client");
const multer_1 = require("multer");
let PromotionsController = PromotionsController_1 = class PromotionsController {
    constructor(promotionsService) {
        this.promotionsService = promotionsService;
        this.logger = new common_1.Logger(PromotionsController_1.name);
    }
    async create(formData, photoFile) {
        this.logger.log('Form data received:', formData);
        if (photoFile) {
            this.logger.log('Photo file received:', {
                originalname: photoFile.originalname,
                mimetype: photoFile.mimetype,
                size: photoFile.size,
                buffer: photoFile.buffer ? `Buffer size: ${photoFile.buffer.length} bytes` : 'No buffer',
            });
        }
        else {
            this.logger.log('No photo file received');
        }
        try {
            let name = formData.name;
            let startDate = formData.startDate;
            let endDate = formData.endDate;
            if (typeof name === 'string' && name.startsWith('"') && name.endsWith('"')) {
                name = name.substring(1, name.length - 1);
            }
            if (typeof startDate === 'string' && startDate.startsWith('"') && startDate.endsWith('"')) {
                startDate = startDate.substring(1, startDate.length - 1);
            }
            if (typeof endDate === 'string' && endDate.startsWith('"') && endDate.endsWith('"')) {
                endDate = endDate.substring(1, endDate.length - 1);
            }
            const createData = {
                name,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
            };
            if (isNaN(createData.startDate.getTime()) || isNaN(createData.endDate.getTime())) {
                throw new common_1.BadRequestException('Invalid date format. Use ISO format (YYYY-MM-DDTHH:mm:ss.sssZ)');
            }
            this.logger.log('Processed data:', createData);
            return this.promotionsService.create(createData, photoFile);
        }
        catch (error) {
            this.logger.error('Error creating promotion:', error);
            throw error;
        }
    }
    async findAll() {
        return this.promotionsService.findAll();
    }
    async getActivePromotion() {
        return this.promotionsService.getActivePromotion();
    }
    async findOne(id) {
        return this.promotionsService.findOne(id);
    }
    async getStatistics(id) {
        return this.promotionsService.getStatistics(id);
    }
    async update(id, data) {
        return this.promotionsService.update(id, data);
    }
};
exports.PromotionsController = PromotionsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('photoFile', {
        storage: (0, multer_1.memoryStorage)(),
    })),
    (0, swagger_1.ApiOperation)({ summary: 'Créer une nouvelle promotion' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.CREATED, description: 'Promotion créée' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string' },
                startDate: { type: 'string', format: 'date-time' },
                endDate: { type: 'string', format: 'date-time' },
                photoFile: {
                    type: 'string',
                    format: 'binary'
                },
            },
            required: ['name', 'startDate', 'endDate'],
        },
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PromotionsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Récupérer toutes les promotions' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PromotionsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('active'),
    (0, swagger_1.ApiOperation)({ summary: 'Récupérer la promotion active' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PromotionsController.prototype, "getActivePromotion", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Récupérer une promotion par ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PromotionsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/statistics'),
    (0, swagger_1.ApiOperation)({ summary: 'Récupérer les statistiques d\'une promotion' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PromotionsController.prototype, "getStatistics", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Mettre à jour une promotion' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PromotionsController.prototype, "update", null);
exports.PromotionsController = PromotionsController = PromotionsController_1 = __decorate([
    (0, swagger_1.ApiTags)('promotions'),
    (0, common_1.Controller)('promotions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [promotions_service_1.PromotionsService])
], PromotionsController);
//# sourceMappingURL=promotions.controller.js.map