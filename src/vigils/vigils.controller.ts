import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { VigilsService } from './vigils.service';
import { CreateVigilDto } from './dto/create-vigil.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('vigils')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VigilsController {
  constructor(private readonly vigilsService: VigilsService) {}

  @Post()
  @Roles('ADMIN')
  @UseInterceptors(FileInterceptor('photo'))
  create(@Body() createVigilDto: CreateVigilDto, @UploadedFile() photo?: Express.Multer.File) {
    return this.vigilsService.create(createVigilDto, photo);
  }

  @Get()
  @Roles('ADMIN')
  findAll() {
    return this.vigilsService.findAll();
  }

  @Get(':id')
  @Roles('ADMIN', 'VIGIL')
  findOne(@Param('id') id: string) {
    return this.vigilsService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN')
  update(@Param('id') id: string, @Body() updateData: any) {
    return this.vigilsService.update(id, updateData);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.vigilsService.remove(id);
  }
}