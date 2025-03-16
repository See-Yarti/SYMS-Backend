import NotificationService from '@/services/notification.service';
import { asyncWrapper } from '@/utils/asyncWrapper';
import { BadRequestError } from '@/utils/errors';
import successResponse from '@/utils/SuccessResponse';
import { Request } from 'express';
import { GetNotificationsDTO } from './dto';

class NotificationsController {
  // Services
  private notificationService: NotificationService = new NotificationService();

  // Methods
  // Get  all notifications
  getAllNotifications = asyncWrapper(async (request: Request) => {
    const user = request.user;
    if (!user) {
      throw new BadRequestError('Unauthorized Request', 401);
    }
  
    const { page = 1, limit = 10 } = request.query as unknown as GetNotificationsDTO;
    
    const notifications = await this.notificationService.getAllNotifications(
      user.id.toString(),
      Number(page),
      Number(limit)
    );
  
    return new successResponse(notifications, 'Notifications fetched successfully', true, 200);
  });
  
}
export default NotificationsController;
