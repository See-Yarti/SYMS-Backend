import Notification from '@/models/notification.model';
import { NotificationType } from '@/types/notification.types';

class NotificationService {
  /**
   *
   * @param userId - The ID of the user to add the notification to
   * @param message - The message of the notification
   * @param type - The notification type
   */
  async addNotification(userId: string, message: string, type: NotificationType = NotificationType.info) {
    const notification = await Notification.create({ user: userId, message, type });
    await notification.save();
    return notification;
  }
  /**
   *
   * @param userId - Id of the user to get notifications for
   * @param isRead = Get notifications that are read or not read
   * @returns = Get notifications that are read or not read
   */
  async getAllNotifications(userId: string, isRead: boolean = false) {
    return await Notification.find({ user: userId, isRead }).exec();
  }

  /**
   * Get all notifications for a user in a number
   * @param userId - Id of the user to get notifications for
   * @param isRead = Get notifications that are read or not read
   * @returns = Get notifications in a number that are read or not read
   */
  async getTotalNotifications(userId: string, isRead: boolean = false) {
    return (await Notification.find({ user: userId, isRead })).length;
  }
}
export default NotificationService;
