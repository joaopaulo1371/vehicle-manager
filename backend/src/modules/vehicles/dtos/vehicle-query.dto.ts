import { Transform } from 'class-transformer';
import { IsEnum, IsIn, IsOptional, IsString, Max, Min } from 'class-validator';
import { VehicleStatus } from '../vehicle.types';

export class VehicleQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(VehicleStatus)
  status?: VehicleStatus;

  @IsOptional()
  @IsIn(['year', 'value', 'brand', 'createdAt'])
  sortBy: 'year' | 'value' | 'brand' | 'createdAt' = 'createdAt';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder: 'asc' | 'desc' = 'desc';

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @Min(1)
  page = 1;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @Min(1)
  @Max(50)
  limit = 12;
}
