import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class AdminLoginDto {
  @IsEmail() email: string;
  @IsString() @MaxLength(128) password: string;
}
export class ApplicantLoginDto {
  @IsString() @MaxLength(100) passportNumber: string;
  @IsString() @MaxLength(128) password: string;
}

export class ChangePasswordDto {
  @IsString() @MaxLength(128) currentPassword: string;
  @IsString() @MinLength(8) @MaxLength(128) newPassword: string;
}
/** Used when an admin sets someone else's password directly (no old password needed). */
export class ResetPasswordDto {
  @IsString() @MinLength(8) @MaxLength(128) newPassword: string;
}
