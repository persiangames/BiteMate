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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatController = void 0;
const common_1 = require("@nestjs/common");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const auth_decorators_1 = require("../../common/decorators/auth.decorators");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const otp_verified_guard_1 = require("../../common/guards/otp-verified.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const chat_service_1 = require("./chat.service");
const chat_dto_1 = require("./dto/chat.dto");
let ChatController = class ChatController {
    chatService;
    constructor(chatService) {
        this.chatService = chatService;
    }
    listChats(user) {
        return this.chatService.listChats(user.sub);
    }
    createDirectChat(user, dto) {
        return this.chatService.getOrCreateDirectChat(user.sub, dto.userId);
    }
    sendMessage(user, dto) {
        return this.chatService.sendMessage(user.sub, dto);
    }
    getMessages(user, chatId, query) {
        return this.chatService.getMessages(user.sub, chatId, query.cursor, query.limit);
    }
    markRead(user, chatId, dto) {
        return this.chatService
            .markChatRead(user.sub, chatId, dto.upToMessageId)
            .then(() => ({ ok: true }));
    }
};
exports.ChatController = ChatController;
__decorate([
    (0, common_1.Get)('chats'),
    (0, auth_decorators_1.RequireOtpVerified)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "listChats", null);
__decorate([
    (0, common_1.Post)('chats/direct'),
    (0, auth_decorators_1.RequireOtpVerified)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, chat_dto_1.CreateDirectChatDto]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "createDirectChat", null);
__decorate([
    (0, common_1.Post)('messages'),
    (0, auth_decorators_1.RequireOtpVerified)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, chat_dto_1.CreateMessageDto]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "sendMessage", null);
__decorate([
    (0, common_1.Get)('messages/:chatId'),
    (0, auth_decorators_1.RequireOtpVerified)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('chatId')),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, chat_dto_1.MessagesQueryDto]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getMessages", null);
__decorate([
    (0, common_1.Post)('messages/:chatId/read'),
    (0, auth_decorators_1.RequireOtpVerified)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('chatId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, chat_dto_1.MarkChatReadDto]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "markRead", null);
exports.ChatController = ChatController = __decorate([
    (0, common_1.Controller)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, otp_verified_guard_1.OtpVerifiedGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [chat_service_1.ChatService])
], ChatController);
//# sourceMappingURL=chat.controller.js.map