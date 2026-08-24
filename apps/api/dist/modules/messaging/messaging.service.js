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
exports.MessagingService = void 0;
const common_1 = require("@nestjs/common");
const email_service_1 = require("./email.service");
const sms_service_1 = require("./sms.service");
let MessagingService = class MessagingService {
    emailService;
    smsService;
    constructor(emailService, smsService) {
        this.emailService = emailService;
        this.smsService = smsService;
    }
    async sendOtp(destination, code, purposeLabel) {
        const target = destination.trim();
        if (target.includes('@')) {
            await this.emailService.sendOtpEmail(target.toLowerCase(), code, purposeLabel);
            return;
        }
        await this.smsService.sendOtpSms(target, code, purposeLabel);
    }
};
exports.MessagingService = MessagingService;
exports.MessagingService = MessagingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [email_service_1.EmailService,
        sms_service_1.SmsService])
], MessagingService);
//# sourceMappingURL=messaging.service.js.map