import Notification from '@/models/notification.model';
import Socket from '@/providers/Socket';
import { NotificationType } from '@/types/notification.types';
import moment from 'moment';
import mongoose from 'mongoose';

type addNotificationProps = {
  userId: string;
  message: string;
  title: string;
  type: NotificationType;
  image?: string;
  link?: string;
};

class NotificationService {
  /**
   *
   * @param userId - The ID of the user to add the notification to
   * @param title - The title of the notification
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
      title: notification.title,
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

    const userObjectId = new mongoose.Types.ObjectId(userId);

    const notificationsAggregation = await Notification.aggregate([
      { $match: { user: userObjectId } },
      {
        $facet: {
          data: [
            { $sort: { createdAt: -1 } }, // Sort by creation date
            { $skip: skip },
            { $limit: limit },
            {
              $lookup: {
                from: 'users',
                localField: 'user',
                foreignField: '_id',
                as: 'user',
              },
            },
            {
              $unwind: {
                path: '$user',
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $project: {
                _id: 1,
                title: 1,
                message: 1,
                createdAt: 1,
                link: 1,
                image: { $ifNull: ['$image', '$user.avatar'] }, // Use image, else user avatar
                user: {
                  _id: 1,
                  name: 1,
                  email: 1,
                  avatar: 1,
                },
              },
            },
          ],
          total: [{ $count: 'count' }],
        },
      },
    ]);

    // Extract data safely
    const notifications = notificationsAggregation[0]?.data || [];
    const totalCount = notificationsAggregation[0]?.total?.[0]?.count || 0;

    const formattedNotifications = notifications.map((notification: any) => ({
      id: notification._id.toString(),
      message: notification.message,
      title: notification.title,
      image: notification.image || '', // Ensure it's always a string
      link: notification.link || '',
      formattedDate: moment(notification.createdAt).fromNow(),
      createdAt: notification.createdAt,
    }));

    return {
      notifications : formattedNotifications,
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
    };
  }
}
export default NotificationService;
