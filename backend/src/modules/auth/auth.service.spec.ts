import { ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { AuthRepository } from './auth.repository';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let authRepository: jest.Mocked<AuthRepository>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(() => {
    usersService = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      onModuleInit: jest.fn(),
    } as unknown as jest.Mocked<UsersService>;

    authRepository = {
      createRefreshToken: jest.fn(),
      findRefreshTokenById: jest.fn(),
      revokeRefreshToken: jest.fn(),
    } as unknown as jest.Mocked<AuthRepository>;

    jwtService = {
      signAsync: jest.fn(),
      verifyAsync: jest.fn(),
    } as unknown as jest.Mocked<JwtService>;

    configService = {
      get: jest.fn(),
    } as unknown as jest.Mocked<ConfigService>;

    service = new AuthService(
      usersService,
      authRepository,
      jwtService,
      configService,
    );
  });

  it('deve falhar ao registrar com e-mail ja existente', async () => {
    usersService.findByEmail.mockResolvedValue({
      id: 'u1',
      name: 'User',
      email: 'john@doe.com',
      passwordHash: 'hash',
      role: 'USER',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await expect(
      service.register({
        name: 'John Doe',
        email: 'john@doe.com',
        password: '123456',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('deve retornar sucesso no logout mesmo com token invalido', async () => {
    jwtService.verifyAsync.mockRejectedValue(new Error('invalid token'));

    await expect(
      service.logout({ refreshToken: 'invalid-token' }),
    ).resolves.toEqual({
      message: 'Logout realizado com sucesso',
    });
  });
});
