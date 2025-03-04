import User from '@/models/user.model';
import { IProfile, IUser, UserRole } from '@/types/user.types';
import { ClientSession, ObjectId } from 'mongoose';
class UserService {
  /**
   * - Find user by Email
   * @param email - The email of the user to find
   * @param role - The role of the user to find by default is consumer
   * @returns
   */
  async findUserByEmail(email: string) {
    return await User.findOne({ email }).exec();
  }
  /**
   * - Get All Users
   * @returns All users
   */
  async getUsers() {
    return await User.find().exec();
  }
   /**
   * Create a new user
   * @param userData - User details
   * @param session - Optional MongoDB transaction session
   */
   async createUser(userData: Partial<IUser>, session?: ClientSession): Promise<IUser> {
    return await User.create([{ ...userData }], { session }).then((res) => res[0]);
  }
  /**
   * - This function allows you to update any field of the user document.
   * @param userId - The ID of the user being updated
   * @param updateData - The data object containing fields and values to update
   * @returns The updated user
   */
  async updateUserFields({ userId, updateData }: { userId: ObjectId; updateData: Partial<IProfile> }) {
    try {
      const user = await User.findByIdAndUpdate(userId, updateData, { new: true }).exec();
      return user;
    } catch (error) {
      console.error('Error updating user fields:', error);
      throw error;
    }
  }
}

export default UserService;
