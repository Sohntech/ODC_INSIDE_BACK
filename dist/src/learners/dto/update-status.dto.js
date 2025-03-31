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
exports.ReplaceLearnerDto = exports.UpdateStatusDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
class UpdateStatusDto {
}
exports.UpdateStatusDto = UpdateStatusDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: client_1.LearnerStatus,
        description: 'New status for the learner'
    }),
    (0, class_validator_1.IsEnum)(client_1.LearnerStatus),
    __metadata("design:type", String)
], UpdateStatusDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Reason for status change'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateStatusDto.prototype, "reason", void 0);
class ReplaceLearnerDto {
}
exports.ReplaceLearnerDto = ReplaceLearnerDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID of the active learner to be replaced' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReplaceLearnerDto.prototype, "activeLearnerForReplacement", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID of the waiting list learner' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReplaceLearnerDto.prototype, "replacementLearnerId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ReplaceLearnerDto.prototype, "reason", void 0);
//# sourceMappingURL=update-status.dto.js.map