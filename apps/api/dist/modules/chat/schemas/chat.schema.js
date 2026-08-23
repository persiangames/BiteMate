"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatSchema = exports.Chat = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let Chat = class Chat {
    type;
    participantIds;
    meetupRoomId;
    meetupId;
    title;
    directKey;
    lastMessageAt;
    lastMessagePreview;
    lastMessageType;
};
exports.Chat = Chat;
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: ['DIRECT', 'MEETUP_GROUP'] }),
    __metadata("design:type", String)
], Chat.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], required: true, index: true }),
    __metadata("design:type", Array)
], Chat.prototype, "participantIds", void 0);
__decorate([
    (0, mongoose_1.Prop)({ index: true, sparse: true, unique: true }),
    __metadata("design:type", String)
], Chat.prototype, "meetupRoomId", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Chat.prototype, "meetupId", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Chat.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)({ index: true, sparse: true, unique: true }),
    __metadata("design:type", String)
], Chat.prototype, "directKey", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], Chat.prototype, "lastMessageAt", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Chat.prototype, "lastMessagePreview", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: ['TEXT', 'IMAGE', 'VIDEO', 'VOICE'] }),
    __metadata("design:type", String)
], Chat.prototype, "lastMessageType", void 0);
exports.Chat = Chat = __decorate([
    (0, mongoose_1.Schema)({ collection: 'chats', timestamps: true })
], Chat);
exports.ChatSchema = mongoose_1.SchemaFactory.createForClass(Chat);
exports.ChatSchema.index({ participantIds: 1, lastMessageAt: -1 });
//# sourceMappingURL=chat.schema.js.map