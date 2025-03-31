import { IsEnum, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AbsenceStatus } from '@prisma/client';

export class UpdateAbsenceStatusDto {
  @ApiProperty({ enum: AbsenceStatus })
  @IsEnum(AbsenceStatus)
  status: AbsenceStatus;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  comment?: string;
}