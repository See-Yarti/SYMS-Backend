import { Schema } from 'mongoose';
import mongooseSchemaConfig from '@/config/db/basic-schema';
import ResetSessionsFields from './resetSessions.fields';
import { IDocumentResetSessions, IResetSessionsMethods, IResetSessionsModel } from './resetSessions.types';

const ResetSessionsSchema: Schema<IDocumentResetSessions, IResetSessionsModel, IResetSessionsMethods> = new Schema(ResetSessionsFields);

// Add a unique index on the email field
ResetSessionsSchema.index({ email: 1 }, { unique: true });

ResetSessionsSchema.plugin(mongooseSchemaConfig);

export default ResetSessionsSchema;
