import { IsDateString, IsEnum, IsOptional, IsString, MaxLength, ValidateIf } from 'class-validator';
import { DocumentStatus } from '../../common/enums';

export class CreateDocumentDto {
  @IsString() @MaxLength(100) documentType: string;
  @IsOptional() @IsEnum(DocumentStatus) status?: DocumentStatus;
  @IsOptional() @IsDateString() receivedDate?: string;
  @IsOptional() @IsString() notes?: string;
}
export class UpdateDocumentDto {
  @ValidateIf((_, v) => v !== undefined) @IsString() @MaxLength(100) documentType?: string;
  @ValidateIf((_, v) => v !== undefined) @IsEnum(DocumentStatus) status?: DocumentStatus;
  @IsOptional() @IsDateString() receivedDate?: string | null;
  @IsOptional() @IsString() notes?: string | null;
}
