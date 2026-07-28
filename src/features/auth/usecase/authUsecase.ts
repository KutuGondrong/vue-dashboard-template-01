import { authRepository } from '@/datasource/repositories';
import type { AuthSession, LoginCredentials, RegisterCredentials } from '@/models/model.type';

export const authUsecase = {
  async login(credentials: LoginCredentials): Promise<AuthSession> {
    return authRepository.login(credentials);
  },

  async register(credentials: RegisterCredentials): Promise<AuthSession> {
    return authRepository.register(credentials);
  },

  async logout(): Promise<void> {
    return authRepository.logout();
  },
};
