import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationDto } from '../../common/utils/pagination';

export class CreateIntakeDto {
  @IsString() @MaxLength(100) name: string;
  @IsOptional() @IsString() description?: string;
}
export class UpdateIntakeDto extends PartialType(CreateIntakeDto) {
  @IsOptional() @IsBoolean() isActive?: boolean;
}
export class ListIntakesDto extends PaginationDto {
  @IsOptional() @IsString() q?: string;
}
