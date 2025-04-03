import { IsString, IsEmail, IsEnum, IsDate, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { LearnerStatus } from '@prisma/client';

export class CreateTutorDto {
  @ApiProperty({ description: 'First name of the tutor' })
  @IsString()
  firstName: string;

  @ApiProperty({ description: 'Last name of the tutor' })
  @IsString()
  lastName: string;

  @ApiProperty({ description: 'Phone number of the tutor' })
  @IsString()
  phone: string;

  @ApiPropertyOptional({ description: 'Email address of the tutor' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ description: 'Address of the tutor' })
  @IsString()
  @IsOptional()
  address?: string;
}

export class CreateLearnerDto {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  gender: string;
  birthDate: Date;
  birthPlace: string;
  refId?: string;
  promotionId: string;
  status?: LearnerStatus;
  tutor: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    address: string;
  };
}