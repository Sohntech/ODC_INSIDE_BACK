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
exports.AttendanceController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const attendance_service_1 = require("./attendance.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const client_1 = require("@prisma/client");
let AttendanceController = class AttendanceController {
    constructor(attendanceService) {
        this.attendanceService = attendanceService;
    }
    async scanLearner(id) {
        return this.attendanceService.scanLearner(id);
    }
    async scanCoach(id) {
        return this.attendanceService.scanCoach(id);
    }
    async submitJustification(id, justification, document) {
        let documentUrl;
        if (document) {
        }
        return this.attendanceService.submitAbsenceJustification(id, justification, documentUrl);
    }
    async updateAbsenceStatus(id, status) {
        return this.attendanceService.updateAbsenceStatus(id, status);
    }
    async getLatestScans() {
        return this.attendanceService.getLatestScans();
    }
};
exports.AttendanceController = AttendanceController;
__decorate([
    (0, common_1.Post)('learner/:id/scan'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.VIGIL),
    (0, swagger_1.ApiOperation)({ summary: 'Scanner un apprenant' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "scanLearner", null);
__decorate([
    (0, common_1.Post)('coach/:id/scan'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.VIGIL),
    (0, swagger_1.ApiOperation)({ summary: 'Scanner un coach' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "scanCoach", null);
__decorate([
    (0, common_1.Post)('absence/:id/justify'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.APPRENANT),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('document')),
    (0, swagger_1.ApiOperation)({ summary: 'Soumettre une justification d\'absence' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('justification')),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "submitJustification", null);
__decorate([
    (0, common_1.Put)('absence/:id/status'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.COACH),
    (0, swagger_1.ApiOperation)({ summary: 'Mettre à jour le statut d\'une absence' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "updateAbsenceStatus", null);
__decorate([
    (0, common_1.Get)('scans/latest'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.VIGIL),
    (0, swagger_1.ApiOperation)({ summary: 'Récupérer les derniers scans' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "getLatestScans", null);
exports.AttendanceController = AttendanceController = __decorate([
    (0, swagger_1.ApiTags)('attendance'),
    (0, common_1.Controller)('attendance'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [attendance_service_1.AttendanceService])
], AttendanceController);
//# sourceMappingURL=attendance.controller.js.map