import { model } from 'mongoose';
import { IDocumentResetSessions, IResetSessionsModel } from './resetSessions.types';
import ResetSessionsSchema from './resetSessions.schema';

// Create and export the Reset Sessions model
const ResetSessionsModel = model<IDocumentResetSessions, IResetSessionsModel>('ResetSessions', ResetSessionsSchema);
export default ResetSessionsModel;
