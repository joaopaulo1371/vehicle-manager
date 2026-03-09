import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ConflictException,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { MulterError } from 'multer';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let normalizedException = exception;

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      if (exception.code === 'P2002') {
        normalizedException = new ConflictException(
          'Registro duplicado. Verifique campos unicos (ex.: placa ou e-mail).',
        );
      } else if (exception.code === 'P2025') {
        normalizedException = new NotFoundException('Registro nao encontrado.');
      } else if (exception.code === 'P2003') {
        normalizedException = new BadRequestException(
          'Violacao de relacionamento no banco.',
        );
      } else {
        normalizedException = new BadRequestException(
          'Erro de banco de dados.',
        );
      }
    }

    if (exception instanceof MulterError) {
      if (exception.code === 'LIMIT_FILE_SIZE') {
        normalizedException = new BadRequestException(
          'Arquivo excede 5MB. Envie imagens menores.',
        );
      } else {
        normalizedException = new BadRequestException(
          'Falha no upload do arquivo.',
        );
      }
    }

    if (exception instanceof Error && !(exception instanceof HttpException)) {
      const message = exception.message || 'Erro interno no servidor';
      if (message.toLowerCase().includes('tipo de arquivo')) {
        normalizedException = new BadRequestException(
          'Tipo de arquivo invalido. Use JPG, PNG ou WEBP.',
        );
      }
    }

    const status =
      normalizedException instanceof HttpException
        ? normalizedException.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const payload =
      normalizedException instanceof HttpException
        ? normalizedException.getResponse()
        : null;
    const errors =
      typeof payload === 'object' && payload !== null && 'message' in payload
        ? (payload as { message: string | string[] }).message
        : 'Erro interno no servidor';

    const body = {
      statusCode: status,
      message: errors,
      path: request.url,
      timestamp: new Date().toISOString(),
    };

    if (status >= 500) {
      console.error('Unhandled exception:', exception);
    }

    response.status(status).json(body);
  }
}
