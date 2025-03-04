import RefreshToken from '@/models/refresh-token.model';
import Locals from '@/providers/Locals';
import { convertExpirationToMS } from '@/utils/authUtils';
import { ObjectId } from 'mongoose';

class RefreshTokenService {
  /**
   * - name: Function to save refresh token in the database against the user id
   * @param userId - The user id of the user that owns the refresh token
   * @param token - The refresh token to be used
   */
  async saveRefreshToken(userId: ObjectId, token: string): Promise<void> {
    const expires = convertExpirationToMS(Locals.config().REFRESH_JWT_EXPIRATION);
    const refreshToken = await RefreshToken.findOne({ userId }).exec();
    if (refreshToken) {
      await RefreshToken.updateOne({ userId }, { token, expires });
      return;
    }
    const refreshTokenDoc = new RefreshToken({
      userId,
      token,
      expires,
    });
    await refreshTokenDoc.save();
  }
  /**
   * Find Refresh Token By User ID
   * @param userId - User ID to retrieve the refresh token from the database
   */
  async getRefreshToken(userId: ObjectId) {
    return await RefreshToken.findOne({ userId }).exec();
  }
  // Find Refresh Token By Token
  // async getRefreshToken(token: string) {}
  // Delete Refresh Token By User ID
  async deleteRefreshToken(userId: ObjectId) {
    await RefreshToken.deleteOne({ userId }).exec();
  }
}
export default RefreshTokenService;
