import { User } from '../../users/entities/user.entity';

export interface AuthResponse {
  user: Partial<User> & { id: string; email: string };
  accessToken: string;
  message?: string;
}
