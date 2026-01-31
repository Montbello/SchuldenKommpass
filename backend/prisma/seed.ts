import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

// Provide a minimal `process` typing if `@types/node` isn't installed
declare const process: {
    exit(arg0: number): unknown;
    env: { [key: string]: string | undefined };
};

const prisma = new PrismaClient();

async function main() {
                        const email = 'admin@schuldenkompass.local';
                        const existing = await prisma.user.findUnique({ where: { email } });
                        if (!existing) {
                                                const adminPass = process.env.ADMIN_PASS || 'adminpass';
                                                const passwordHash = await argon2.hash(adminPass);
                                                await prisma.user.create({
                                                                        data: {
                                                                                                email,
                                                                                                name: 'Admin',
                                                                                                password_hash: passwordHash,
                                                                                                role: 'ADMIN',
                                                                        },
                                                });
                                                console.log('Created admin user:', email);
                        } else {
                                                console.log('Admin user already exists');
                        }
}

main()
                        .catch(e => {
                                                console.error(e);
                                                process.exit(1);
                        })
                        .finally(async () => {
                                                await prisma.$disconnect();
                        });
