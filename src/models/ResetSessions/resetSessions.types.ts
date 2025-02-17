import { DocumentConfig } from '@/config/db/basic-schema';
import { Model } from 'mongoose';

type IResetSessions = {
  email: string;
  session: string;
  expiresAt: Date;
};

export interface IDocumentResetSessions extends IResetSessions, DocumentConfig {}

export interface IResetSessionsMethods {}

export type IResetSessionsModel = Model<IDocumentResetSessions, {}, IResetSessionsMethods>;
