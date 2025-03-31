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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoachesController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const swagger_1 = require("@nestjs/swagger");
const coaches_service_1 = require("./coaches.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const client_1 = require("@prisma/client");
const create_coach_dto_1 = require("./dto/create-coach.dto");
let CoachesController = class CoachesController {
    constructor(coachesService) {
        this.coachesService = coachesService;
    }
    async create(createCoachDto, photoFile) {
        if (photoFile) {
            console.log(`Received file: ${photoFile.originalname}, size: ${photoFile.size} bytes`);
        }
        return this.coachesService.create(createCoachDto, photoFile);
    }
    async findAll() {
        return this.coachesService.findAll();
    }
    async findOne(id) {
        return this.coachesService.findOne(id);
    }
    async update(id, data) {
        return this.coachesService.update(id, data);
    }
    async getAttendanceStats(id) {
        return this.coachesService.getAttendanceStats(id);
    }
};
exports.CoachesController = CoachesController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('photoFile', {
        storage: (0, multer_1.memoryStorage)(),
        fileFilter: (req, file, cb) => {
            if (!file.mimetype.match(/^image\/(jpg|jpeg|png|gif)$/)) {
                return cb(new Error('Only image files are allowed!'), false);
            }
            cb(null, true);
        },
        limits: {
            fileSize: 5 * 1024 * 1024,
        }
    })),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new coach' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.CREATED, description: 'Coach created' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                firstName: { type: 'string' },
                lastName: { type: 'string' },
                phone: { type: 'string' },
                email: { type: 'string' },
                refId: { type: 'string' },
                photoFile: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_coach_dto_1.CreateCoachDto, Object]),
    __metadata("design:returntype", Promise)
], CoachesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Récupérer tous les coachs' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CoachesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Récupérer un coach par ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CoachesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Mettre à jour un coach' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CoachesController.prototype, "update", null);
__decorate([
    (0, common_1.Get)(':id/attendance-stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Récupérer les statistiques de présence d\'un coach' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CoachesController.prototype, "getAttendanceStats", null);
exports.CoachesController = CoachesController = __decorate([
    (0, swagger_1.ApiTags)('coaches'),
    (0, common_1.Controller)('coaches'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [coaches_service_1.CoachesService])
], CoachesController);
//# sourceMappingURL=coaches.controller.js.map