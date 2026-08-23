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
exports.MessageSchema = exports.Message = exports.MessageReadReceipt = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let MessageReadReceipt = class MessageReadReceipt {
    userId;
    readAt;
};
exports.MessageReadReceipt = MessageReadReceipt;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], MessageReadReceipt.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: Date }),
    __metadata("design:type", Date)
], MessageReadReceipt.prototype, "readAt", void 0);
exports.MessageReadReceipt = MessageReadReceipt = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], MessageReadReceipt);
let Message = class Message {
    chatId;
    senderId;
    type;
    content;
    mediaUrl;
    mediaMimeType;
    durationSeconds;
    readBy;
    createdAt;
};
exports.Message = Message;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, required: true, index: true, ref: 'Chat' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Message.prototype, "chatId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, index: true }),
    __metadata("design:type", String)
], Message.prototype, "senderId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: ['TEXT', 'IMAGE', 'VIDEO', 'VOICE'] }),
    __metadata("design:type", String)
], Message.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Message.prototype, "content", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Message.prototype, "mediaUrl", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Message.prototype, "mediaMimeType", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], Message.prototype, "durationSeconds", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [MessageReadReceipt], default: [] }),
    __metadata("design:type", Array)
], Message.prototype, "readBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: Date.now }),
    __metadata("design:type", Date)
], Message.prototype, "createdAt", void 0);
exports.Message = Message = __decorate([
    (0, mongoose_1.Schema)({ collection: 'messages' })
], Message);
exports.MessageSchema = mongoose_1.SchemaFactory.createForClass(Message);
exports.MessageSchema.index({ chatId: 1, createdAt: -1 });
//# sourceMappingURL=message.schema.js.map