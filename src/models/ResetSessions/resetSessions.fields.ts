import { SchemaDefinition } from 'mongoose';
import { IDocumentResetSessions } from './resetSessions.types';

const ResetSessionsFields: SchemaDefinition<Record<keyof IDocumentResetSessions, any>> = {
  email: {
    type: String,
    required: true,
    unique: true,
  },
  session: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
};

export default ResetSessionsFields;