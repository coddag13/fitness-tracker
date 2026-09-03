import { AuthenticatedUser } from './authenticated-user.model';

export interface AuthenticationResponse {
  accessToken: string;
  expiresAt: string;
  user: AuthenticatedUser;
}
