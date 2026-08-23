import { HydratedDocument } from 'mongoose';
export type ChatDocument = HydratedDocument<Chat>;
export declare class Chat {
    type: 'DIRECT' | 'MEETUP_GROUP';
    participantIds: string[];
    meetupRoomId?: string;
    meetupId?: string;
    title?: string;
    directKey?: string;
    lastMessageAt?: Date;
    lastMessagePreview?: string;
    lastMessageType?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'VOICE';
}
export declare const ChatSchema: import("mongoose").Schema<Chat, import("mongoose").Model<Chat, any, any, any, import("mongoose").Document<unknown, any, Chat, any, {}> & Chat & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Chat, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<Chat>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Chat> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
