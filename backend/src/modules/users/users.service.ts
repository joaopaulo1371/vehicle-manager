import { Injectable, OnModuleInit } from '@nestjs/common';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(private readonly usersRepository: UsersRepository) {}

  async onModuleInit() {
    await this.usersRepository.ensureDefaultAdmin();
  }

  findByEmail(email: string) {
    return this.usersRepository.findByEmail(email);
  }

  findById(id: string) {
    return this.usersRepository.findById(id);
  }

  create(data: {
    name: string;
    email: string;
    passwordHash: string;
    role?: string;
  }) {
    return this.usersRepository.create(data);
  }
}
