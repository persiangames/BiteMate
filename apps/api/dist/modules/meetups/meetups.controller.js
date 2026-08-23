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
exports.MeetupsController = void 0;
const common_1 = require("@nestjs/common");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const auth_decorators_1 = require("../../common/decorators/auth.decorators");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const otp_verified_guard_1 = require("../../common/guards/otp-verified.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const meetups_dto_1 = require("./dto/meetups.dto");
const meetups_service_1 = require("./meetups.service");
let MeetupsController = class MeetupsController {
    meetupsService;
    constructor(meetupsService) {
        this.meetupsService = meetupsService;
    }
    createMeetup(user, dto) {
        return this.meetupsService.createMeetup(user.sub, dto);
    }
    listMyMeetups(user) {
        return this.meetupsService.listMyMeetups(user.sub);
    }
    findNearbyMeetups(user, query) {
        return this.meetupsService.findNearbyMeetups(user.sub, query);
    }
    getMatches(user, query) {
        return this.meetupsService.getMatches(user.sub, query.meetupId);
    }
    listMyInvites(user) {
        return this.meetupsService.listMyInvites(user.sub);
    }
    getInviteLimit(user) {
        return this.meetupsService.getInviteLimit(user.sub);
    }
    sendInvite(user, dto) {
        return this.meetupsService.sendInvite(user.sub, dto.meetupId, dto.inviteeId);
    }
    acceptInvite(user, dto) {
        return this.meetupsService.acceptInvite(user.sub, dto.inviteId);
    }
    rejectInvite(user, dto) {
        return this.meetupsService.rejectInvite(user.sub, dto.inviteId);
    }
    getRoom(user, roomId) {
        return this.meetupsService.getRoom(user.sub, roomId);
    }
    getRoomMessages(user, roomId) {
        return this.meetupsService.getRoomMessages(user.sub, roomId);
    }
    sendRoomMessage(user, roomId, dto) {
        return this.meetupsService.sendRoomMessage(user.sub, roomId, dto);
    }
};
exports.MeetupsController = MeetupsController;
__decorate([
    (0, common_1.Post)('meetups'),
    (0, auth_decorators_1.RequireOtpVerified)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, meetups_dto_1.CreateMeetupDto]),
    __metadata("design:returntype", Promise)
], MeetupsController.prototype, "createMeetup", null);
__decorate([
    (0, common_1.Get)('meetups/me'),
    (0, auth_decorators_1.RequireOtpVerified)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MeetupsController.prototype, "listMyMeetups", null);
__decorate([
    (0, common_1.Get)('meetups/nearby'),
    (0, auth_decorators_1.RequireOtpVerified)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, meetups_dto_1.NearbyMeetupsQueryDto]),
    __metadata("design:returntype", Promise)
], MeetupsController.prototype, "findNearbyMeetups", null);
__decorate([
    (0, common_1.Get)('meetups/match'),
    (0, auth_decorators_1.RequireOtpVerified)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, meetups_dto_1.MeetupMatchQueryDto]),
    __metadata("design:returntype", Promise)
], MeetupsController.prototype, "getMatches", null);
__decorate([
    (0, common_1.Get)('meetups/invites/me'),
    (0, auth_decorators_1.RequireOtpVerified)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MeetupsController.prototype, "listMyInvites", null);
__decorate([
    (0, common_1.Get)('meetups/invites/limit'),
    (0, auth_decorators_1.RequireOtpVerified)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MeetupsController.prototype, "getInviteLimit", null);
__decorate([
    (0, common_1.Post)('meetups/invite'),
    (0, auth_decorators_1.RequireOtpVerified)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, meetups_dto_1.SendMeetupInviteDto]),
    __metadata("design:returntype", Promise)
], MeetupsController.prototype, "sendInvite", null);
__decorate([
    (0, common_1.Post)('meetups/accept'),
    (0, auth_decorators_1.RequireOtpVerified)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, meetups_dto_1.RespondMeetupInviteDto]),
    __metadata("design:returntype", Promise)
], MeetupsController.prototype, "acceptInvite", null);
__decorate([
    (0, common_1.Post)('meetups/reject'),
    (0, auth_decorators_1.RequireOtpVerified)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, meetups_dto_1.RespondMeetupInviteDto]),
    __metadata("design:returntype", Promise)
], MeetupsController.prototype, "rejectInvite", null);
__decorate([
    (0, common_1.Get)('meetups/rooms/:roomId'),
    (0, auth_decorators_1.RequireOtpVerified)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('roomId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MeetupsController.prototype, "getRoom", null);
__decorate([
    (0, common_1.Get)('meetups/rooms/:roomId/messages'),
    (0, auth_decorators_1.RequireOtpVerified)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('roomId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MeetupsController.prototype, "getRoomMessages", null);
__decorate([
    (0, common_1.Post)('meetups/rooms/:roomId/messages'),
    (0, auth_decorators_1.RequireOtpVerified)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('roomId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, meetups_dto_1.SendRoomMessageDto]),
    __metadata("design:returntype", Promise)
], MeetupsController.prototype, "sendRoomMessage", null);
exports.MeetupsController = MeetupsController = __decorate([
    (0, common_1.Controller)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, otp_verified_guard_1.OtpVerifiedGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [meetups_service_1.MeetupsService])
], MeetupsController);
//# sourceMappingURL=meetups.controller.js.map