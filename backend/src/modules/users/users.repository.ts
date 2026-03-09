import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  create(data: {
    name: string;
    email: string;
    passwordHash: string;
    role?: string;
  }) {
    return this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash: data.passwordHash,
        role: data.role ?? 'USER',
      },
    });
  }

  async ensureDefaultAdmin() {
    const email = process.env.DEFAULT_ADMIN_EMAIL ?? 'admin@vehiclemanager.com';
    const existing = await this.findByEmail(email);
    if (existing) return existing;

    const bcrypt = await import('bcryptjs');
    const password = process.env.DEFAULT_ADMIN_PASSWORD ?? 'admin123';
    const hash = await bcrypt.hash(password, 10);

    return this.prisma.user.create({
      data: {
        name: 'Administrador',
        email,
        passwordHash: hash,
        role: 'ADMIN',
      },
    });
  }
}
