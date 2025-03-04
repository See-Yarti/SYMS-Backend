import { Schema, Document, ObjectId } from 'mongoose';

// Common fields for all documents
export interface DocumentConfig extends Document {
  _id: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}


// Function to add default fields & hooks
const mongooseSchemaConfig = (schema: Schema) => {
  schema.add({
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  });

  // Ensure `updatedAt` updates on changes
  schema.pre('save', function (this: DocumentConfig, next) {
    if (!this.isNew) {
      this.updatedAt = new Date();
    }
    next();
  });

  schema.pre('updateOne', function () {
    this.set({ updatedAt: new Date() });
  });

  schema.pre('findOneAndUpdate', function () {
    this.set({ updatedAt: new Date() });
  });

  // Virtual 'id' field for better JSON output
  schema.virtual('id').get(function (this: DocumentConfig) {
    return this._id.toString();
  });

  schema.set('toJSON', {
    virtuals: true,
    versionKey: false, // Remove __v
    transform: (_, ret) => {
      ret.id = ret._id;
      delete ret._id;
    },
  });

  schema.set('toObject', {
    virtuals: true,
    versionKey: false,
    transform: (_, ret) => {
      ret.id = ret._id;
      delete ret._id;
    },
  });
};

export default mongooseSchemaConfig;
