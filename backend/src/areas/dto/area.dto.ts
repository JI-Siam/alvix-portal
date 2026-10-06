import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationDto } from '../../common/utils/pagination';

export class CreateAreaDto {
  @IsString() @MaxLength(150) name: string;
  @IsOptional() @IsString() @MaxLength(150) province?: string;
  @IsOptional() @IsString() @MaxLength(100) country?: string;
}
export class UpdateAreaDto extends PartialType(CreateAreaDto) {
  @IsOptional() @IsBoolean() isActive?: boolean;
}
export class ListAreasDto extends PaginationDto {
  @IsOptional() @IsString() q?: string;
}
