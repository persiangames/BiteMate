import { HydratedDocument, Types } from 'mongoose';
export type MessageDocument = HydratedDocument<Message>;
export declare class MessageReadReceipt {
    userId: string;
    readAt: Date;
}
export declare class Message {
    chatId: Types.ObjectId;
    senderId: string;
    type: 'TEXT' | 'IMAGE' | 'VIDEO' | 'VOICE';
    content?: string;
    mediaUrl?: string;
    mediaMimeType?: string;
    durationSeconds?: number;
    readBy: MessageReadReceipt[];
    createdAt: Date;
}
export declare const MessageSchema: import("mongoose").Schema<Message, import("mongoose").Model<Message, any, any, any, import("mongoose").Document<unknown, any, Message, any, {}> & Message & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Message, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<Message>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Message> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
