import { IsString, IsEmail, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCoachDto {
  @ApiProperty({ description: 'First name of the coach' })
  @IsString()
  firstName: string;

  @ApiProperty({ description: 'Last name of the coach' })
  @IsString()
  lastName: string;

  @ApiProperty({ description: 'Phone number of the coach' })
  @IsString()
  phone: string;

  @ApiProperty({ description: 'Email address of the coach' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ description: 'Referential ID the coach is associated with' })
  @IsString()
  @IsOptional()
  refId?: string;
}