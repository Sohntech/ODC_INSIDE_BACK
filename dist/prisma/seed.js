"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new client_1.PrismaClient();
async function main() {
    const adminPassword = await bcrypt.hash('Admin123!', 10);
    const adminUser = await prisma.user.upsert({
        where: { email: 'admin@sonatel-academy.sn' },
        update: {},
        create: {
            email: 'admin@sonatel-academy.sn',
            password: adminPassword,
            role: client_1.UserRole.ADMIN,
            admin: {
                create: {
                    firstName: 'Admin',
                    lastName: 'Sonatel',
                    phone: '+221777777777',
                },
            },
        },
    });
    console.log('Admin user created:', adminUser);
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map