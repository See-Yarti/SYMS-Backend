import mongooseSchemaConfig from '@/config/db/basic-schema';
import { IConsumer } from '@/types/user.types';
import { Schema, model, Model, ObjectId } from 'mongoose';

interface IConsumerMethods {}

type IConsumerModel = Model<IConsumer, {}, IConsumerMethods>;

// Schema Definition
const ConsumerSchema = new Schema<IConsumer, IConsumerModel, IConsumerMethods>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});

// Plugins
ConsumerSchema.plugin(mongooseSchemaConfig);

// Model Export
const Consumer = model<IConsumer, IConsumer>('Consumer', ConsumerSchema);
export default Consumer;
