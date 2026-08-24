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
var SmsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let SmsService = SmsService_1 = class SmsService {
    configService;
    logger = new common_1.Logger(SmsService_1.name);
    constructor(configService) {
        this.configService = configService;
    }
    async sendOtpSms(phoneNumber, code, purpose) {
        const provider = this.configService.get('messaging.sms.provider', 'console');
        const appName = this.configService.get('messaging.appName', 'BiteMate');
        const message = `${appName}: ${purpose} code ${code}`;
        if (provider === 'console') {
            this.logger.log(`[SMS:console] to=${phoneNumber} code=${code}`);
            return;
        }
        if (provider === 'kavenegar') {
            await this.sendKavenegar(phoneNumber, code, message);
            return;
        }
        if (provider === 'melipayamak') {
            await this.sendMelipayamak(phoneNumber, message);
            return;
        }
        if (provider === 'http') {
            await this.sendHttp(phoneNumber, message);
            return;
        }
        this.logger.warn(`Unknown SMS provider "${provider}" — code logged`);
        this.logger.log(`[SMS:fallback] to=${phoneNumber} code=${code}`);
    }
    async sendKavenegar(phoneNumber, code, fallbackMessage) {
        const apiKey = this.configService.get('messaging.sms.kavenegar.apiKey');
        const template = this.configService.get('messaging.sms.kavenegar.template');
        const sender = this.configService.get('messaging.sms.sender', 'BiteMate');
        if (!apiKey) {
            this.logger.warn('KAVENEGAR_API_KEY missing');
            this.logger.log(`[SMS:fallback] ${fallbackMessage}`);
            return;
        }
        const receptor = phoneNumber.replace(/\D/g, '');
        if (template) {
            const url = `https://api.kavenegar.com/v1/${apiKey}/verify/lookup.json?receptor=${encodeURIComponent(receptor)}&token=${encodeURIComponent(code)}&template=${encodeURIComponent(template)}`;
            const response = await fetch(url, { method: 'GET' });
            if (!response.ok) {
                throw new Error(`Kavenegar verify failed: ${response.status}`);
            }
            return;
        }
        const url = `https://api.kavenegar.com/v1/${apiKey}/sms/send.json`;
        const body = new URLSearchParams({
            receptor,
            sender,
            message: fallbackMessage,
        });
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body,
        });
        if (!response.ok) {
            throw new Error(`Kavenegar SMS failed: ${response.status}`);
        }
    }
    async sendMelipayamak(phoneNumber, message) {
        const username = this.configService.get('messaging.sms.melipayamak.username');
        const password = this.configService.get('messaging.sms.melipayamak.password');
        const from = this.configService.get('messaging.sms.melipayamak.from');
        if (!username || !password || !from) {
            this.logger.warn('Melipayamak credentials missing');
            this.logger.log(`[SMS:fallback] to=${phoneNumber} message=${message}`);
            return;
        }
        const response = await fetch('https://rest.payamak-panel.com/api/SendSMS/SendSMS', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username,
                password,
                to: phoneNumber,
                from,
                text: message,
                isFlash: false,
            }),
        });
        if (!response.ok) {
            throw new Error(`Melipayamak SMS failed: ${response.status}`);
        }
    }
    async sendHttp(phoneNumber, message) {
        const url = this.configService.get('messaging.sms.http.url');
        if (!url) {
            this.logger.warn('SMS_HTTP_URL missing');
            return;
        }
        const method = this.configService.get('messaging.sms.http.method', 'POST');
        const apiKeyHeader = this.configService.get('messaging.sms.http.apiKeyHeader', 'Authorization');
        const apiKey = this.configService.get('messaging.sms.http.apiKey', '');
        const headers = { 'Content-Type': 'application/json' };
        if (apiKey) {
            headers[apiKeyHeader] = apiKey;
        }
        const response = await fetch(url, {
            method,
            headers,
            body: JSON.stringify({ to: phoneNumber, message }),
        });
        if (!response.ok) {
            throw new Error(`HTTP SMS failed: ${response.status}`);
        }
    }
};
exports.SmsService = SmsService;
exports.SmsService = SmsService = SmsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], SmsService);
//# sourceMappingURL=sms.service.js.map