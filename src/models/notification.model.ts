import mongooseSchemaConfig from '@/config/db/basic-schema';
import { INotification, NotificationType } from '@/types/notification.types';
import { Schema, model, Model } from 'mongoose';

interface INotificationMethods {}

type INotificationModel = Model<INotification, {}, INotificationMethods>;

// Schema Definition
const NotificationSchema = new Schema<INotification, INotificationModel, INotificationMethods>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  image: { type: String, required: false },
  type: { type: String, enum: NotificationType, default: NotificationType.info },
  readAt: { type: Date },
  link: { type: String, required: false, default: null },
});

// Plugins
NotificationSchema.plugin(mongooseSchemaConfig);

// Model Export
const Notification = model<INotification, INotificationModel>('Notification', NotificationSchema);
export default Notification;
