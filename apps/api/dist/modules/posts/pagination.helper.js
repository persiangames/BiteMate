"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaginationHelper = void 0;
exports.computeTrendingScore = computeTrendingScore;
const common_1 = require("@nestjs/common");
let PaginationHelper = class PaginationHelper {
    encodeCursor(cursor) {
        return Buffer.from(JSON.stringify(cursor)).toString('base64url');
    }
    decodeCursor(raw) {
        if (!raw) {
            return null;
        }
        try {
            return JSON.parse(Buffer.from(raw, 'base64url').toString('utf8'));
        }
        catch {
            return null;
        }
    }
};
exports.PaginationHelper = PaginationHelper;
exports.PaginationHelper = PaginationHelper = __decorate([
    (0, common_1.Injectable)()
], PaginationHelper);
function computeTrendingScore(likeCount, commentCount, shareCount) {
    return likeCount * 3 + commentCount * 5 + shareCount * 2;
}
//# sourceMappingURL=pagination.helper.js.map