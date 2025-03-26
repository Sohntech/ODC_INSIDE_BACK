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
var LearnersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LearnersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const cloudinary_service_1 = require("../cloudinary/cloudinary.service");
const client_1 = require("@prisma/client");
const QRCode = require("qrcode");
const fs = require("fs");
const auth_utils_1 = require("../utils/auth.utils");
let LearnersService = LearnersService_1 = class LearnersService {
    constructor(prisma, cloudinary) {
        this.prisma = prisma;
        this.cloudinary = cloudinary;
        this.logger = new common_1.Logger(LearnersService_1.name);
    }
    async create(data) {
        this.logger.log('Creating learner with data:', {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            refId: data.refId,
            promotionId: data.promotionId
        });
        const existingLearner = await this.prisma.learner.findFirst({
            where: {
                OR: [
                    { phone: data.phone },
                    {
                        user: {
                            email: data.email,
                        },
                    },
                ],
            },
        });
        if (existingLearner) {
            throw new common_1.ConflictException('Un apprenant avec cet email ou ce téléphone existe déjà');
        }
        const qrCodeValue = `${data.firstName}-${data.lastName}-${Date.now()}`;
        const qrCodeBuffer = await QRCode.toBuffer(qrCodeValue);
        const qrCodeFile = {
            fieldname: 'qrCode',
            originalname: 'qrcode.png',
            encoding: '7bit',
            mimetype: 'image/png',
            buffer: qrCodeBuffer,
            size: qrCodeBuffer.length,
            stream: null,
            destination: '',
            filename: 'qrcode.png',
            path: '',
        };
        let qrCodeUrl;
        try {
            this.logger.log('Attempting to upload QR code to Cloudinary...');
            const result = await this.cloudinary.uploadFile(qrCodeFile, 'qrcodes');
            qrCodeUrl = result.url;
            this.logger.log('Successfully uploaded QR code to Cloudinary:', qrCodeUrl);
        }
        catch (error) {
            this.logger.error('Failed to upload QR code to Cloudinary:', error);
        }
        let photoUrl;
        if (data.photoFile) {
            this.logger.log('Photo file received, processing...');
            try {
                this.logger.log('Attempting to upload to Cloudinary...');
                const result = await this.cloudinary.uploadFile(data.photoFile, 'learners');
                photoUrl = result.url;
                this.logger.log('Successfully uploaded to Cloudinary:', photoUrl);
            }
            catch (cloudinaryError) {
                this.logger.error('Cloudinary upload failed:', cloudinaryError);
                try {
                    this.logger.log('Falling back to local storage...');
                    if (!fs.existsSync('./uploads/learners')) {
                        fs.mkdirSync('./uploads/learners', { recursive: true });
                    }
                    const uniquePrefix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                    const extension = data.photoFile.originalname.split('.').pop();
                    const filename = `${uniquePrefix}.${extension}`;
                    const filepath = `./uploads/learners/${filename}`;
                    fs.writeFileSync(filepath, data.photoFile.buffer);
                    photoUrl = `uploads/learners/${filename}`;
                    this.logger.log(`File saved locally at ${filepath}`);
                }
                catch (localError) {
                    this.logger.error('Local storage fallback failed:', localError);
                }
            }
        }
        const password = auth_utils_1.AuthUtils.generatePassword();
        const hashedPassword = await auth_utils_1.AuthUtils.hashPassword(password);
        const createData = {
            firstName: data.firstName,
            lastName: data.lastName,
            address: data.address,
            gender: data.gender,
            birthDate: data.birthDate,
            birthPlace: data.birthPlace,
            phone: data.phone,
            photoUrl,
            qrCode: qrCodeUrl,
            status: client_1.LearnerStatus.ACTIVE,
            user: {
                create: {
                    email: data.email,
                    password: hashedPassword,
                    role: 'APPRENANT',
                },
            },
            tutor: {
                create: {
                    firstName: data.tutor.firstName,
                    lastName: data.tutor.lastName,
                    phone: data.tutor.phone,
                    email: data.tutor.email,
                    address: data.tutor.address,
                },
            },
            promotion: {
                connect: {
                    id: data.promotionId
                }
            },
            referential: data.refId ? {
                connect: {
                    id: data.refId
                }
            } : undefined
        };
        this.logger.log('Creating learner with final data:', createData);
        const learner = await this.prisma.learner.create({
            data: createData,
            include: {
                user: true,
                promotion: true,
                referential: true,
                tutor: true,
            },
        });
        await auth_utils_1.AuthUtils.sendPasswordEmail(data.email, password, 'Apprenant');
        return learner;
    }
    async findAll() {
        return this.prisma.learner.findMany({
            include: {
                user: true,
                referential: true,
                promotion: true,
                tutor: true,
                kit: true,
                attendances: true,
                grades: true,
            },
        });
    }
    async findOne(id) {
        const learner = await this.prisma.learner.findUnique({
            where: { id },
            include: {
                user: true,
                referential: true,
                promotion: true,
                tutor: true,
                kit: true,
                attendances: true,
                grades: true,
                documents: true,
            },
        });
        if (!learner) {
            throw new common_1.NotFoundException('Apprenant non trouvé');
        }
        return learner;
    }
    async update(id, data) {
        const learner = await this.findOne(id);
        return this.prisma.learner.update({
            where: { id },
            data,
            include: {
                user: true,
                referential: true,
                promotion: true,
                tutor: true,
                kit: true,
            },
        });
    }
    async updateStatus(id, status) {
        const learner = await this.findOne(id);
        return this.prisma.learner.update({
            where: { id },
            data: { status },
            include: {
                user: true,
                referential: true,
                promotion: true,
            },
        });
    }
    async updateKit(id, kitData) {
        const learner = await this.findOne(id);
        return this.prisma.learner.update({
            where: { id },
            data: {
                kit: {
                    update: kitData,
                },
            },
            include: {
                kit: true,
            },
        });
    }
    async uploadDocument(id, file, type, name) {
        this.logger.log(`Uploading document for learner ${id}`, {
            type,
            name,
            fileDetails: {
                originalname: file.originalname,
                size: file.size,
                mimetype: file.mimetype
            }
        });
        const learner = await this.findOne(id);
        let documentUrl;
        try {
            this.logger.log('Attempting to upload document to Cloudinary...');
            const result = await this.cloudinary.uploadFile(file, 'documents');
            documentUrl = result.url;
            this.logger.log('Successfully uploaded document to Cloudinary:', documentUrl);
        }
        catch (cloudinaryError) {
            this.logger.error('Cloudinary document upload failed:', cloudinaryError);
            try {
                this.logger.log('Falling back to local storage for document...');
                if (!fs.existsSync('./uploads/documents')) {
                    fs.mkdirSync('./uploads/documents', { recursive: true });
                }
                const uniquePrefix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                const extension = file.originalname.split('.').pop();
                const filename = `${uniquePrefix}.${extension}`;
                const filepath = `./uploads/documents/${filename}`;
                fs.writeFileSync(filepath, file.buffer);
                documentUrl = `uploads/documents/${filename}`;
                this.logger.log(`Document saved locally at ${filepath}`);
            }
            catch (localError) {
                this.logger.error('Local storage fallback for document failed:', localError);
                throw new Error('Failed to upload document');
            }
        }
        return this.prisma.document.create({
            data: {
                name,
                type,
                url: documentUrl,
                learnerId: id,
            },
        });
    }
    async getAttendanceStats(id) {
        const learner = await this.findOne(id);
        const totalDays = await this.prisma.learnerAttendance.count({
            where: { learnerId: id },
        });
        const presentDays = await this.prisma.learnerAttendance.count({
            where: { learnerId: id, isPresent: true },
        });
        return {
            totalDays,
            presentDays,
            attendanceRate: totalDays > 0 ? (presentDays / totalDays) * 100 : 0,
        };
    }
};
exports.LearnersService = LearnersService;
exports.LearnersService = LearnersService = LearnersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        cloudinary_service_1.CloudinaryService])
], LearnersService);
//# sourceMappingURL=learners.service.js.map