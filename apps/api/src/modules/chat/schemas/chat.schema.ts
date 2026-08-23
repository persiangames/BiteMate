import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ChatDocument = HydratedDocument<Chat>;

@Schema({ collection: 'chats', timestamps: true })
export class Chat {
  @Prop({ required: true, enum: ['DIRECT', 'MEETUP_GROUP'] })
  type!: 'DIRECT' | 'MEETUP_GROUP';

  @Prop({ type: [String], required: true, index: true })
  participantIds!: string[];

  @Prop({ index: true, sparse: true, unique: true })
  meetupRoomId?: string;

  @Prop()
  meetupId?: string;

  @Prop()
  title?: string;

  @Prop({ index: true, sparse: true, unique: true })
  directKey?: string;

  @Prop({ type: Date })
  lastMessageAt?: Date;

  @Prop()
  lastMessagePreview?: string;

  @Prop({ enum: ['TEXT', 'IMAGE', 'VIDEO', 'VOICE'] })
  lastMessageType?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'VOICE';
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
ChatSchema.index({ participantIds: 1, lastMessageAt: -1 });
