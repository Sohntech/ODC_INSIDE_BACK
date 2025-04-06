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
var PrismaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let PrismaService = PrismaService_1 = class PrismaService extends client_1.PrismaClient {
    constructor() {
        super({
            log: ['query', 'info', 'warn', 'error'],
            datasources: {
                db: {
                    url: process.env.DATABASE_URL
                }
            }
        });
        this.logger = new common_1.Logger(PrismaService_1.name);
        this.maxRetries = 3;
        this.retryDelay = 1000;
        process.on('beforeExit', () => {
            this.logger.log('Process beforeExit event');
            this.$disconnect();
        });
    }
    async onModuleInit() {
        let retries = 0;
        while (retries < this.maxRetries) {
            try {
                await this.$connect();
                this.logger.log('Successfully connected to database');
                return;
            }
            catch (error) {
                retries++;
                this.logger.error(`Failed to connect to database (attempt ${retries}/${this.maxRetries}):`, error);
                if (retries === this.maxRetries) {
                    this.logger.error('Max retries reached. Unable to connect to database.');
                    throw error;
                }
                await new Promise(resolve => setTimeout(resolve, this.retryDelay * retries));
            }
        }
    }
    async onModuleDestroy() {
        this.logger.log('Disconnecting from database...');
        await this.$disconnect();
        this.logger.log('Successfully disconnected from database');
    }
    async healthCheck() {
        try {
            await this.$queryRaw `SELECT 1`;
            return true;
        }
        catch (error) {
            this.logger.error('Database health check failed:', error);
            return false;
        }
    }
};
exports.PrismaService = PrismaService;
exports.PrismaService = PrismaService = PrismaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], PrismaService);
//# sourceMappingURL=prisma.service.js.map