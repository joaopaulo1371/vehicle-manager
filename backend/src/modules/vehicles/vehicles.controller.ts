import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateVehicleDto } from './dtos/create-vehicle.dto';
import { UpdateVehicleDto } from './dtos/update-vehicle.dto';
import { VehicleQueryDto } from './dtos/vehicle-query.dto';
import { VehiclesService } from './vehicles.service';

const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
const maxFileSize = 5 * 1024 * 1024;

function generateFilename(file: Express.Multer.File) {
  const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  return `${unique}${extname(file.originalname)}`;
}

const uploadConfig = FilesInterceptor('photos', 8, {
  storage: diskStorage({
    destination: 'uploads',
    filename: (_req, file, cb) => cb(null, generateFilename(file)),
  }),
  limits: {
    fileSize: maxFileSize,
  },
  fileFilter: (_req, file, cb) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      cb(new Error('Tipo de arquivo inválido. Use JPG, PNG ou WEBP'), false);
      return;
    }
    cb(null, true);
  },
});

@UseGuards(JwtAuthGuard)
@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Post()
  @UseInterceptors(uploadConfig)
  create(
    @Body() data: CreateVehicleDto,
    @UploadedFiles() photos: Express.Multer.File[],
  ) {
    return this.vehiclesService.create(data, photos ?? []);
  }

  @Get()
  findAll(@Query() query: VehicleQueryDto) {
    return this.vehiclesService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vehiclesService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(uploadConfig)
  update(
    @Param('id') id: string,
    @Body() data: UpdateVehicleDto,
    @UploadedFiles() photos: Express.Multer.File[],
    @Body('removedPhotoIds')
    removedPhotoIdsRaw?: string | string[],
  ) {
    const removedPhotoIds =
      typeof removedPhotoIdsRaw === 'string'
        ? removedPhotoIdsRaw.split(',').filter(Boolean)
        : (removedPhotoIdsRaw ?? []);

    return this.vehiclesService.update(
      id,
      data,
      photos ?? [],
      removedPhotoIds ?? [],
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.vehiclesService.remove(id);
  }
}
