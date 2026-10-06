import { IsDateString, IsEnum, IsOptional, IsString, IsUUID, Length, ValidateIf } from 'class-validator';
import { ApplicationStatus } from '../../common/enums';
import { PaginationDto } from '../../common/utils/pagination';

export class CreateApplicationDto {
  /** Provided by the university. If left blank the server generates one from the sequence. */
  @IsOptional() @IsString() @Length(1, 30) applicationId?: string;
  @IsUUID() applicantId: string;
  @IsUUID() universityId: string;
  @IsUUID() programId: string;
  @IsUUID() majorId: string;
  @IsUUID() intakeId: string;
  @IsOptional() @IsEnum(ApplicationStatus) status?: ApplicationStatus;
  @IsOptional() @IsDateString() applicationDate?: string;
  @IsOptional() @IsString() notes?: string;
}
/** applicantId is intentionally not updatable: an application never moves between applicants. */
export class UpdateApplicationDto {
  @IsOptional() @IsString() @Length(1, 30) applicationId?: string;
  @ValidateIf((_, v) => v !== undefined) @IsUUID() universityId?: string;
  @ValidateIf((_, v) => v !== undefined) @IsUUID() programId?: string;
  @ValidateIf((_, v) => v !== undefined) @IsUUID() majorId?: string;
  @ValidateIf((_, v) => v !== undefined) @IsUUID() intakeId?: string;
  @ValidateIf((_, v) => v !== undefined) @IsEnum(ApplicationStatus) status?: ApplicationStatus;
  @IsOptional() @IsDateString() applicationDate?: string | null;
  @IsOptional() @IsString() notes?: string | null;
}
export class ListApplicationsDto extends PaginationDto {
  @IsOptional() @IsEnum(ApplicationStatus) status?: ApplicationStatus;
  @IsOptional() @IsUUID() applicantId?: string;
  @IsOptional() @IsUUID() universityId?: string;
  @IsOptional() @IsUUID() areaId?: string;
  @IsOptional() @IsUUID() majorId?: string;
  @IsOptional() @IsUUID() programId?: string;
  @IsOptional() @IsUUID() intakeId?: string;
  @IsOptional() @IsString() q?: string;
}
