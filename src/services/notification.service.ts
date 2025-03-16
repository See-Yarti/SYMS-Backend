import Notification from '@/models/notification.model';
import Socket from '@/providers/Socket';
import { NotificationType } from '@/types/notification.types';

type addNotificationProps = {
  userId: string;
  message: string;
  type: NotificationType;
  image?: string;
  link?: string;
};

class NotificationService {
  /**
   *
   * @param userId - The ID of the user to add the notification to
   * @param message - The message of the notification
   * @param type - The notification type
   */
  async addNotification({ type = NotificationType.info, ...props }: addNotificationProps) {
    const notification = await Notification.create({ ...props, type, user: props.userId });
    await notification.save();

    const sendNotification = {
      message: notification.message,
      link: notification.link,
      time: notification.createdAt.toString(),
      image:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=3276&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      fallback: 'AA',
    };

    // Emit the notification via WebSocket
    Socket.getIO().to(props.userId).emit('notification', sendNotification);

    return notification;
  }
  /**
   *
   * @param userId - Id of the user to get notifications for
   * @param page - Page number
   * @param limit - Limit of notifications to get
   * @returns = Get All notifications for user with pagination limit
   */
  async getAllNotifications(userId: string, page: number = 1, limit: number = 10) {
  const skip = (page - 1) * limit;

  const [notifications, total] = await Promise.all([
    Notification.find({ user: userId }).skip(skip).limit(limit).select('id message createdAt image link').exec(),
    Notification.countDocuments({ user: userId }),
  ]);

  return {
    notifications,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

}
export default NotificationService;
