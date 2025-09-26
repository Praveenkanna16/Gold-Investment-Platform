import { UserRole } from '../../common/enums/user-role.enum';

export interface JwtPayload {
  sub: string; // user id
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}
