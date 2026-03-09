import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class VehiclesRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.VehicleCreateInput) {
    return this.prisma.vehicle.create({
      data,
      include: { photos: true },
    });
  }

  findMany(params: {
    where: Prisma.VehicleWhereInput;
    orderBy: Prisma.VehicleOrderByWithRelationInput;
    skip: number;
    take: number;
  }) {
    return this.prisma.vehicle.findMany({
      ...params,
      include: { photos: true },
    });
  }

  count(where: Prisma.VehicleWhereInput) {
    return this.prisma.vehicle.count({ where });
  }

  findById(id: string) {
    return this.prisma.vehicle.findUnique({
      where: { id },
      include: { photos: true },
    });
  }

  update(id: string, data: Prisma.VehicleUpdateInput) {
    return this.prisma.vehicle.update({
      where: { id },
      data,
      include: { photos: true },
    });
  }

  delete(id: string) {
    return this.prisma.vehicle.delete({
      where: { id },
    });
  }

  deletePhotos(photoIds: string[]) {
    return this.prisma.vehiclePhoto.deleteMany({
      where: {
        id: {
          in: photoIds,
        },
      },
    });
  }
}
