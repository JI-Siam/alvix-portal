import { PartialType, OmitType } from '@nestjs/mapped-types';
import { IsBoolean, IsEmail, IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { PaginationDto } from '../../common/utils/pagination';

export class CreateUserDto {
  @IsString() @MaxLength(150) name: string;
  @IsEmail() email: string;
  @IsString() @MinLength(10) @MaxLength(128) password: string;
  @IsIn(['SUPER_ADMIN', 'ADMIN']) role: string;
}
export class UpdateUserDto extends PartialType(OmitType(CreateUserDto, ['email'] as const)) {
  @IsOptional() @IsBoolean() isActive?: boolean;
}
export class ListUsersDto extends PaginationDto {
  @IsOptional() @IsString() q?: string;
}
