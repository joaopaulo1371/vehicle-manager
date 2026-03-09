import { NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { VehiclesService } from './vehicles.service';
import { VehiclesRepository } from './vehicles.repository';
import { VehicleStatus, VehicleType } from './vehicle.types';

describe('VehiclesService', () => {
  let service: VehiclesService;
  let repository: jest.Mocked<VehiclesRepository>;

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deletePhotos: jest.fn(),
    } as unknown as jest.Mocked<VehiclesRepository>;

    service = new VehiclesService(repository);
  });

  it('deve serializar value como number ao criar', async () => {
    repository.create.mockResolvedValue({
      id: 'v1',
      brand: 'Toyota',
      model: 'Corolla',
      year: 2022,
      plate: 'ABC1234',
      color: 'Prata',
      value: new Prisma.Decimal(12345.67),
      type: VehicleType.CAR,
      status: VehicleStatus.AVAILABLE,
      description: null,
      photos: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await service.create(
      {
        brand: 'Toyota',
        model: 'Corolla',
        year: 2022,
        plate: 'ABC1234',
        color: 'Prata',
        value: 12345.67,
        type: VehicleType.CAR,
        status: VehicleStatus.AVAILABLE,
      },
      [],
    );

    expect(result.value).toBe(12345.67);
  });

  it('deve lancar NotFoundException no findOne quando veiculo nao existe', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(service.findOne('missing-id')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
