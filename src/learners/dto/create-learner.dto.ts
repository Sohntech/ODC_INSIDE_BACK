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
  @ApiProperty({ description: 'First name of the learner' })
  @IsString()
  firstName: string;

  @ApiProperty({ description: 'Last name of the learner' })
  @IsString()
  lastName: string;

  @ApiPropertyOptional({ description: 'Address of the learner' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ description: 'Gender of the learner', enum: ['MALE', 'FEMALE'] })
  @IsEnum(['MALE', 'FEMALE'])
  gender: 'MALE' | 'FEMALE';

  @ApiProperty({ description: 'Birth date of the learner' })
  @Type(() => Date)
  @IsDate()
  birthDate: Date;

  @ApiProperty({ description: 'Birth place of the learner' })
  @IsString()
  birthPlace: string;

  @ApiProperty({ description: 'Phone number of the learner' })
  @IsString()
  phone: string;

  @ApiProperty({ description: 'Email address of the learner' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ description: 'Referential ID the learner is associated with' })
  @IsString()
  @IsOptional()
  refId?: string;

  @ApiProperty({ description: 'Promotion ID the learner belongs to' })
  @IsString()
  promotionId: string;

  @ApiProperty({ description: 'Tutor information' })
  @Type(() => CreateTutorDto)
  tutor: CreateTutorDto;

  @ApiPropertyOptional({ 
    description: 'Whether to add the learner to the waiting list',
    default: false 
  })
  @IsOptional()
  @IsBoolean()
  addToWaitlist?: boolean;

  @ApiPropertyOptional({ 
    enum: LearnerStatus,
    description: 'Initial status for the learner',
    default: LearnerStatus.ACTIVE
  })
  @IsEnum(LearnerStatus)
  @IsOptional()
  status?: LearnerStatus;
}