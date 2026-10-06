import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationDto } from '../../common/utils/pagination';

export class CreateMajorDto {
  @IsString() @MaxLength(150) name: string;
  @IsOptional() @IsString() description?: string;
}
export class UpdateMajorDto extends PartialType(CreateMajorDto) {
  @IsOptional() @IsBoolean() isActive?: boolean;
}
export class ListMajorsDto extends PaginationDto {
  @IsOptional() @IsString() q?: string;
}
