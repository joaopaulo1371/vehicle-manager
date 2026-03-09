import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import { LoginDto } from './dtos/login.dto';
import { UsersService } from '../users/users.service';
import { AuthRepository } from './auth.repository';
import { JwtPayload } from './types/jwt-payload.type';
import { RefreshTokenDto } from './dtos/refresh-token.dto';
import { RegisterDto } from './dtos/register.dto';

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(data: LoginDto) {
    const user = await this.usersService.findByEmail(data.email);
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const bcrypt = await import('bcryptjs');
    const isPasswordValid = await bcrypt.compare(
      data.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    const tokens = await this.generateTokens(payload);
    return {
      ...tokens,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async register(data: RegisterDto) {
    const existing = await this.usersService.findByEmail(data.email);
    if (existing) {
      throw new ConflictException('E-mail ja cadastrado');
    }

    const bcrypt = await import('bcryptjs');
    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await this.usersService.create({
      name: data.name,
      email: data.email,
      passwordHash,
      role: 'USER',
    });

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
    const tokens = await this.generateTokens(payload);

    return {
      ...tokens,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async refresh(data: RefreshTokenDto) {
    const decoded = await this.verifyRefreshToken(data.refreshToken);
    const storedToken = await this.authRepository.findRefreshTokenById(
      decoded.jti,
    );

    if (!storedToken || storedToken.revokedAt) {
      throw new ForbiddenException('Refresh token inválido');
    }
    if (storedToken.expiresAt < new Date()) {
      throw new ForbiddenException('Refresh token expirado');
    }

    const bcrypt = await import('bcryptjs');
    const matches = await bcrypt.compare(
      data.refreshToken,
      storedToken.tokenHash,
    );
    if (!matches) {
      throw new ForbiddenException('Refresh token inválido');
    }

    const user = await this.usersService.findById(storedToken.userId);
    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    await this.authRepository.revokeRefreshToken(storedToken.id);

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
    const tokens = await this.generateTokens(payload);

    return {
      ...tokens,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async logout(data: RefreshTokenDto) {
    try {
      const decoded = await this.verifyRefreshToken(data.refreshToken);
      const storedToken = await this.authRepository.findRefreshTokenById(
        decoded.jti,
      );
      if (storedToken && !storedToken.revokedAt) {
        await this.authRepository.revokeRefreshToken(storedToken.id);
      }
    } catch {
      // Logout deve ser idempotente.
    }
    return { message: 'Logout realizado com sucesso' };
  }

  private async generateTokens(payload: JwtPayload): Promise<AuthTokens> {
    const accessSecret =
      this.configService.get<string>('jwt.accessSecret') ?? '';
    const refreshSecret =
      this.configService.get<string>('jwt.refreshSecret') ?? '';
    const accessTtl = this.configService.get<string>('jwt.accessTtl') ?? '15m';
    const refreshTtl = this.configService.get<string>('jwt.refreshTtl') ?? '7d';

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: accessSecret,
      expiresIn: accessTtl as never,
    });

    const tokenId = randomUUID();
    const refreshToken = await this.jwtService.signAsync(
      { sub: payload.sub },
      {
        secret: refreshSecret,
        expiresIn: refreshTtl as never,
        jwtid: tokenId,
      },
    );

    const bcrypt = await import('bcryptjs');
    const refreshHash = await bcrypt.hash(refreshToken, 10);
    const refreshExpiry = this.calculateExpiry(refreshTtl);

    await this.authRepository.createRefreshToken(
      payload.sub,
      refreshHash,
      refreshExpiry,
    );

    return { accessToken, refreshToken };
  }

  private async verifyRefreshToken(refreshToken: string) {
    const refreshSecret =
      this.configService.get<string>('jwt.refreshSecret') ?? '';
    try {
      return await this.jwtService.verifyAsync<{ sub: string; jti: string }>(
        refreshToken,
        { secret: refreshSecret },
      );
    } catch {
      throw new ForbiddenException('Refresh token inválido');
    }
  }

  private calculateExpiry(ttl: string) {
    const now = new Date();
    const value = Number.parseInt(ttl.slice(0, -1), 10);
    const unit = ttl.at(-1);

    if (Number.isNaN(value) || !unit) {
      now.setDate(now.getDate() + 7);
      return now;
    }

    if (unit === 'd') now.setDate(now.getDate() + value);
    if (unit === 'h') now.setHours(now.getHours() + value);
    if (unit === 'm') now.setMinutes(now.getMinutes() + value);

    return now;
  }
}
