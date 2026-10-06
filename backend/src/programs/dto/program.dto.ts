import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationDto } from '../../common/utils/pagination';

export class CreateProgramDto {
  @IsString() @MaxLength(255) name: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() @MaxLength(100) visaType?: string;
  @IsOptional() @IsString() @MaxLength(100) duration?: string;
}
export class UpdateProgramDto extends PartialType(CreateProgramDto) {
  @IsOptional() @IsBoolean() isActive?: boolean;
}
export class ListProgramsDto extends PaginationDto {
  @IsOptional() @IsString() q?: string;
}
