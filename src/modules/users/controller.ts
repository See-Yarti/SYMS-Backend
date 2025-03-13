import { asyncWrapper } from '@/utils/asyncWrapper';
import successResponse from '@/utils/SuccessResponse';
import { Request } from 'express';
import Cache from '@/providers/Cache';
import UsersService from '@/services/user.service';
import { UserRole } from '@/types/user.types';
import Socket from '@/providers/Socket';

export class UsersController {
  private usersService: UsersService = new UsersService();
  // Profile of the User
  profile = asyncWrapper(async (request: Request) => {
    const user = request.user;
    return new successResponse(user, 'User Fetched Successfully', true, 200);
  });
  // Get All Users
  get = asyncWrapper(async (request: Request) => {
    const cacheKey = 'all-users';
    const cachedData = await Cache.get(cacheKey);
    if (cachedData) {
      return new successResponse(cachedData, 'Users Fetched Successfully', true, 200);
    }
    const users = await this.usersService.getUsers();
    await Cache.set(cacheKey, users);
    return new successResponse(users, 'Users Fetched Successfully', true, 200);
  });

  // Create User
  // createUser = asyncWrapper(async (request: Request) => {
  //   const { firstName, lastName, email, password } = request.body;
  //   const newUser = await this.usersService.createUser({
  //     name,
  //     email,
  //     role: UserRole.vendor,
  //     password,
  //     agent: request.headers['user-agent'] || '',
  //     loginAt: new Date(),
  //     ip: request.clientIp,
  //   });
  //   return new successResponse(newUser, 'User Created Successfully', true, 200);
  // });
}
