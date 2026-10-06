import { PartialType } from '@nestjs/mapped-types';
import { IsArray, IsBoolean, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { PaginationDto } from '../../common/utils/pagination';

export class CreateUniversityDto {
  @IsString() @MaxLength(255) name: string;
  @IsUUID() areaId: string;
  @IsOptional() @IsString() website?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsArray() @IsUUID('all', { each: true }) programIds?: string[];
}
export class UpdateUniversityDto extends PartialType(CreateUniversityDto) {
  @IsOptional() @IsBoolean() isActive?: boolean;
}
export class ListUniversitiesDto extends PaginationDto {
  @IsOptional() @IsString() q?: string;
  @IsOptional() @IsUUID() areaId?: string;
}
