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
const matricule_utils_1 = require("../utils/matricule.utils");
let LearnersService = LearnersService_1 = class LearnersService {
    constructor(prisma, cloudinary) {
        this.prisma = prisma;
        this.cloudinary = cloudinary;
        this.logger = new common_1.Logger(LearnersService_1.name);
    }
    async create(createLearnerDto, photoFile) {
        let photoUrl;
        let qrCodeUrl;
        const referential = createLearnerDto.refId ?
            await this.prisma.referential.findUnique({ where: { id: createLearnerDto.refId } })
            : null;
        const matricule = await matricule_utils_1.MatriculeUtils.generateLearnerMatricule(this.prisma, createLearnerDto.firstName, createLearnerDto.lastName, referential?.name);
        try {
            const qrCodeBuffer = await QRCode.toBuffer(matricule);
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
            const qrCodeResult = await this.cloudinary.uploadFile(qrCodeFile, 'qrcodes');
            qrCodeUrl = qrCodeResult.url;
        }
        catch (error) {
            this.logger.error('Failed to generate or upload QR code:', error);
        }
        if (photoFile) {
            try {
                const result = await this.cloudinary.uploadFile(photoFile, 'learners');
                photoUrl = result.url;
            }
            catch (error) {
                this.logger.error('Failed to upload photo:', error);
            }
        }
        return this.prisma.$transaction(async (prisma) => {
            const existingLearner = await prisma.learner.findFirst({
                where: {
                    OR: [
                        { phone: createLearnerDto.phone },
                        { user: { email: createLearnerDto.email } },
                    ],
                },
            });
            if (existingLearner) {
                throw new common_1.ConflictException('Un apprenant avec cet email ou ce téléphone existe déjà');
            }
            const password = auth_utils_1.AuthUtils.generatePassword();
            const hashedPassword = await auth_utils_1.AuthUtils.hashPassword(password);
            const learner = await prisma.learner.create({
                data: {
                    matricule,
                    firstName: createLearnerDto.firstName,
                    lastName: createLearnerDto.lastName,
                    address: createLearnerDto.address,
                    gender: createLearnerDto.gender,
                    birthDate: createLearnerDto.birthDate,
                    birthPlace: createLearnerDto.birthPlace,
                    phone: createLearnerDto.phone,
                    photoUrl,
                    qrCode: qrCodeUrl,
                    status: createLearnerDto.status || client_1.LearnerStatus.ACTIVE,
                    user: {
                        create: {
                            email: createLearnerDto.email,
                            password: hashedPassword,
                            role: 'APPRENANT',
                        },
                    },
                    tutor: {
                        create: {
                            firstName: createLearnerDto.tutor.firstName,
                            lastName: createLearnerDto.tutor.lastName,
                            phone: createLearnerDto.tutor.phone,
                            email: createLearnerDto.tutor.email,
                            address: createLearnerDto.tutor.address,
                        },
                    },
                    promotion: {
                        connect: {
                            id: createLearnerDto.promotionId
                        }
                    },
                    referential: createLearnerDto.refId ? {
                        connect: {
                            id: createLearnerDto.refId
                        }
                    } : undefined,
                    kit: {
                        create: {
                            laptop: false,
                            charger: false,
                            bag: false,
                            polo: false
                        }
                    }
                },
                include: {
                    user: true,
                    promotion: true,
                    referential: true,
                    tutor: true,
                    kit: true,
                    statusHistory: true
                }
            });
            await prisma.learnerStatusHistory.create({
                data: {
                    learnerId: learner.id,
                    newStatus: learner.status,
                    reason: 'Initial status on creation',
                    date: new Date()
                }
            });
            await auth_utils_1.AuthUtils.sendPasswordEmail(createLearnerDto.email, password, 'Apprenant');
            return learner;
        }, {
            timeout: 20000
        });
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
    async updateLearnerStatus(learnerId, updateStatusDto) {
        const learner = await this.findOne(learnerId);
        this.logger.log(`Updating learner ${learnerId} status from ${learner.status} to ${updateStatusDto.status}`);
        return this.prisma.$transaction(async (prisma) => {
            await prisma.learnerStatusHistory.create({
                data: {
                    learnerId,
                    previousStatus: learner.status,
                    newStatus: updateStatusDto.status,
                    reason: updateStatusDto.reason,
                }
            });
            return prisma.learner.update({
                where: { id: learnerId },
                data: {
                    status: updateStatusDto.status,
                },
                include: {
                    user: true,
                    promotion: true,
                    referential: true,
                    statusHistory: true
                }
            });
        });
    }
    async replaceLearner(replacementDto) {
        const { activeLearnerForReplacement, replacementLearnerId, reason } = replacementDto;
        return this.prisma.$transaction(async (prisma) => {
            const activeLearner = await prisma.learner.findUnique({
                where: { id: activeLearnerForReplacement },
                include: { promotion: true }
            });
            if (!activeLearner || activeLearner.status !== 'ACTIVE') {
                throw new common_1.ConflictException('Invalid active learner or learner is not active');
            }
            const waitingLearner = await prisma.learner.findUnique({
                where: { id: replacementLearnerId },
            });
            if (!waitingLearner || waitingLearner.status !== 'WAITING') {
                throw new common_1.ConflictException('Invalid replacement learner or learner is not in waiting list');
            }
            const replacedLearner = await prisma.learner.update({
                where: { id: activeLearnerForReplacement },
                data: {
                    status: 'REPLACED',
                    statusHistory: {
                        create: {
                            previousStatus: 'ACTIVE',
                            newStatus: 'REPLACED',
                            reason,
                            date: new Date()
                        }
                    }
                },
                include: { promotion: true }
            });
            const replacementLearner = await prisma.learner.update({
                where: { id: replacementLearnerId },
                data: {
                    status: 'REPLACEMENT',
                    promotionId: activeLearner.promotionId,
                    statusHistory: {
                        create: {
                            previousStatus: 'WAITING',
                            newStatus: 'REPLACEMENT',
                            reason,
                            date: new Date()
                        }
                    }
                },
                include: { promotion: true }
            });
            return { replacedLearner, replacementLearner };
        });
    }
    async getWaitingList(promotionId) {
        return this.prisma.learner.findMany({
            where: {
                status: 'WAITING',
                ...(promotionId && { promotionId })
            },
            include: {
                user: true,
                promotion: true
            }
        });
    }
    async getStatusHistory(learnerId) {
        return this.prisma.learnerStatusHistory.findMany({
            where: { learnerId },
            orderBy: { date: 'desc' }
        });
    }
};
exports.LearnersService = LearnersService;
exports.LearnersService = LearnersService = LearnersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        cloudinary_service_1.CloudinaryService])
], LearnersService);
//# sourceMappingURL=learners.service.js.map