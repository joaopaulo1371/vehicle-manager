import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateVehicleDto } from './dtos/create-vehicle.dto';
import { UpdateVehicleDto } from './dtos/update-vehicle.dto';
import { VehicleQueryDto } from './dtos/vehicle-query.dto';
import { VehiclesRepository } from './vehicles.repository';
import { Prisma } from '@prisma/client';

@Injectable()
export class VehiclesService {
  constructor(private readonly vehiclesRepository: VehiclesRepository) {}

  async create(data: CreateVehicleDto, photos: Express.Multer.File[]) {
    const created = await this.vehiclesRepository.create({
      brand: data.brand,
      model: data.model,
      year: data.year,
      plate: data.plate,
      color: data.color,
      value: data.value,
      type: data.type,
      status: data.status,
      description: data.description,
      photos: {
        create: photos.map((file) => ({
          filename: file.filename,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          url: `/uploads/${file.filename}`,
        })),
      },
    });
    return created;
  }

  async findAll(query: VehicleQueryDto) {
    const where: Prisma.VehicleWhereInput = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.search
        ? {
            OR: [
              { brand: { contains: query.search } },
              { model: { contains: query.search } },
            ],
          }
        : {}),
    };

    const skip = (query.page - 1) * query.limit;
    const [items, total] = await Promise.all([
      this.vehiclesRepository.findMany({
        where,
        orderBy: {
          [query.sortBy]: query.sortOrder,
        },
        skip,
        take: query.limit,
      }),
      this.vehiclesRepository.count(where),
    ]);

    return {
      items,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit) || 1,
      },
    };
  }

  async findOne(id: string) {
    const vehicle = await this.vehiclesRepository.findById(id);
    if (!vehicle) {
      throw new NotFoundException('Veículo não encontrado');
    }
    return vehicle;
  }

  async update(
    id: string,
    data: UpdateVehicleDto,
    photos: Express.Multer.File[],
    removedPhotoIds: string[],
  ) {
    await this.findOne(id);
    if (removedPhotoIds.length > 0) {
      await this.vehiclesRepository.deletePhotos(removedPhotoIds);
    }

    return this.vehiclesRepository.update(id, {
      ...data,
      photos: photos.length
        ? {
            create: photos.map((file) => ({
              filename: file.filename,
              originalName: file.originalname,
              mimeType: file.mimetype,
              size: file.size,
              url: `/uploads/${file.filename}`,
            })),
          }
        : undefined,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.vehiclesRepository.delete(id);
    return { message: 'Veículo removido com sucesso' };
  }
}
