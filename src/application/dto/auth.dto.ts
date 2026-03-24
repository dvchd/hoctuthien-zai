/**
 * Authentication DTOs
 */

export interface IGoogleLoginDto {
  email: string;
  googleId: string;
  name?: string;
  avatarUrl?: string;
}

export interface IAuthResponseDto {
  success: boolean;
  user?: {
    id: string;
    email: string;
    name: string | null;
    avatarUrl: string | null;
    role: string;
    status: string;
  };
  error?: string;
}

export interface ICurrentUserDto {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  role: string;
  status: string;
  isAdmin: boolean;
  isMentor: boolean;
  isMentee: boolean;
  isActivated?: boolean;
}
