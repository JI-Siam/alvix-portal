import { PartialType } from '@nestjs/mapped-types';
import { IsDateString, IsEmail, IsNumber, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';
import { PaginationDto } from '../../common/utils/pagination';

export class CreateApplicantDto {
  @IsString() @MaxLength(100) passportNumber: string;
  @IsString() @MinLength(8) @MaxLength(128) password: string;
  @IsString() @MaxLength(100) firstName: string;
  @IsOptional() @IsString() @MaxLength(100) lastName?: string;
  @IsOptional() @IsDateString() dateOfBirth?: string;
  @IsOptional() @IsString() @MaxLength(30) gender?: string;
  @IsOptional() @IsString() @MaxLength(100) nationality?: string;
  @IsOptional() @IsString() @MaxLength(30) phone?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsString() @MaxLength(100) city?: string;
  @IsOptional() @IsString() @MaxLength(100) country?: string;
  @IsOptional() @IsDateString() passportExpiryDate?: string;

  // sponsor / bank statement details
  @IsOptional() @IsString() @MaxLength(150) sponsor?: string;
  @IsOptional() @IsDateString() bankOpenDate?: string;
  @IsOptional() @IsDateString() bankIssueDate?: string;
  @IsOptional() @IsDateString() bankMaturity?: string;
  @IsOptional() @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) @Max(9999999999999.99) fundUsd?: number | null;
  @IsOptional() @IsString() @MaxLength(150) referencePerson?: string;
}
export class UpdateApplicantDto extends PartialType(CreateApplicantDto) {}
export class ListApplicantsDto extends PaginationDto {
  @IsOptional() @IsString() q?: string;
}
