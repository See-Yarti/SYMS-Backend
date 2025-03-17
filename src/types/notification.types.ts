import { ObjectId } from 'mongoose';
import { IBaseModel, IUser } from './user.types';

export enum NotificationType {
  info = 'info',
  warning = 'warning',
  error = 'error',
}

export interface INotification extends IBaseModel {
  user: ObjectId | IUser;
  message: string;
  title: string;
  image: string;
  type: NotificationType;
  readAt: Date;
  link: string | null;
}

// Populated Notification Type
export type PopulatedNotification = Omit<INotification, 'user'> & { user: IUser };
