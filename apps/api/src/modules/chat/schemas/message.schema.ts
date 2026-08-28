import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type MessageDocument = HydratedDocument<Message>;

@Schema({ _id: false })
export class MessageReadReceipt {
  @Prop({ required: true })
  userId!: string;

  @Prop({ required: true, type: Date })
  readAt!: Date;
}

@Schema({ collection: 'messages' })
export class Message {
  @Prop({ type: Types.ObjectId, required: true, index: true, ref: 'Chat' })
  chatId!: Types.ObjectId;

  @Prop({ required: true, index: true })
  senderId!: string;

  @Prop({ required: true, enum: ['TEXT', 'IMAGE', 'VIDEO', 'VOICE', 'FILE'] })
  type!: 'TEXT' | 'IMAGE' | 'VIDEO' | 'VOICE' | 'FILE';

  @Prop()
  content?: string;

  @Prop()
  mediaUrl?: string;

  @Prop()
  mediaMimeType?: string;

  @Prop()
  durationSeconds?: number;

  @Prop({ type: [MessageReadReceipt], default: [] })
  readBy!: MessageReadReceipt[];

  @Prop({ type: Date, default: Date.now })
  createdAt!: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
MessageSchema.index({ chatId: 1, createdAt: -1 });
