import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';
import { VehicleStatus, VehicleType } from '../vehicle.types';

export class CreateVehicleDto {
  @IsString()
  @IsNotEmpty({ message: 'Marca é obrigatória' })
  brand: string;

  @IsString()
  @IsNotEmpty({ message: 'Modelo é obrigatório' })
  model: string;

  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1900)
  @Max(2100)
  year: number;

  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.replace(/[^A-Za-z0-9]/g, '').toUpperCase()
      : String(value ?? ''),
  )
  @IsString()
  @Length(7, 7, { message: 'Placa deve conter 7 caracteres' })
  plate: string;

  @IsString()
  @IsNotEmpty({ message: 'Cor é obrigatória' })
  color: string;

  @Transform(({ value }) => Number(value))
  @IsNumber({}, { message: 'Valor inválido' })
  @Min(0, { message: 'Valor deve ser positivo' })
  value: number;

  @IsEnum(VehicleType, { message: 'Tipo inválido' })
  type: VehicleType;

  @IsEnum(VehicleStatus, { message: 'Status inválido' })
  status: VehicleStatus;

  @IsOptional()
  @IsString()
  description?: string;
}
