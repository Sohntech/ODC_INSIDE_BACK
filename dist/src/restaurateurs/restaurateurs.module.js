"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestaurateursModule = void 0;
const common_1 = require("@nestjs/common");
const restaurateurs_service_1 = require("./restaurateurs.service");
const restaurateurs_controller_1 = require("./restaurateurs.controller");
const prisma_module_1 = require("../prisma/prisma.module");
const cloudinary_module_1 = require("../cloudinary/cloudinary.module");
const vigils_module_1 = require("../vigils/vigils.module");
let RestaurateursModule = class RestaurateursModule {
};
exports.RestaurateursModule = RestaurateursModule;
exports.RestaurateursModule = RestaurateursModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, cloudinary_module_1.CloudinaryModule, vigils_module_1.VigilsModule, RestaurateursModule],
        controllers: [restaurateurs_controller_1.RestaurateursController],
        providers: [restaurateurs_service_1.RestaurateursService],
        exports: [restaurateurs_service_1.RestaurateursService],
    })
], RestaurateursModule);
//# sourceMappingURL=restaurateurs.module.js.map