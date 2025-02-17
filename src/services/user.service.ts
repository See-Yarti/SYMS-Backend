import User, { IUser } from '@/models/user.model';

class UserService {
  // Find User By Email
  /**
   * 
   * @param email 
   * @returns 
   */
  async findUserByEmail(email: string) {
    return await User.findOne({ email }).exec();
  }
  // Get All Users
  async getUsers() {
    return await User.find().exec();
  }
  // Create User
  async createUser(data: IUser) {
    try {
      return await User.create({
        avatarUrl: '',
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}

export default UserService;
