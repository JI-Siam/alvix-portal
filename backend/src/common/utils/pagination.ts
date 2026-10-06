import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class PaginationDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page: number = 1;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(500) limit: number = 20;
}
export const skip = (p: PaginationDto) => (p.page - 1) * p.limit;
export const paged = <T>(items: T[], total: number, p: PaginationDto) => ({ items, total, page: p.page, limit: p.limit });
