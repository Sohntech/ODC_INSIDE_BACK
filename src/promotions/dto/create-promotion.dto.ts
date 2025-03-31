import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsDateString, IsOptional, IsArray } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreatePromotionDto {
  @ApiProperty({ description: 'Name of the promotion' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Start date of the promotion' })
  @IsDateString()
  startDate: Date;

  @ApiProperty({ description: 'End date of the promotion' })
  @IsDateString()
  endDate: Date;

  @ApiPropertyOptional({ description: 'Array of referential IDs' })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return JSON.parse(value.replace(/\s/g, ''));
    }
    return value;
  })
  @IsArray()
  referentialIds?: string[];
}