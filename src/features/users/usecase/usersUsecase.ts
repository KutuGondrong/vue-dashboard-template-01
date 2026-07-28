import { usersRepository } from '@/datasource/repositories';
import type { PaginatedResult, User } from '@/models/model.type';

export const usersUsecase = {
  async getUsers(page: number, pageSize: number): Promise<PaginatedResult<User>> {
    return usersRepository.getUsers(page, pageSize);
  },
};
