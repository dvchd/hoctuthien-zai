/**
 * User DTOs
 */

export interface ICreateUserDto {
  email: string;
  googleId?: string;
  name?: string;
  avatarUrl?: string;
}

export interface IUpdateUserDto {
  name?: string;
  bio?: string;
  phone?: string;
  avatarUrl?: string;
  skills?: string[];
}

export interface IUserResponseDto {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  phone: string | null;
  role: string;
  status: string;
  bio: string | null;
  skills: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserListQueryDto {
  role?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface IUserListResponseDto {
  data: IUserResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
