"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTotpSecret = generateTotpSecret;
exports.buildOtpAuthUrl = buildOtpAuthUrl;
exports.verifyTotpCode = verifyTotpCode;
const node_crypto_1 = require("node:crypto");
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
function generateTotpSecret() {
    return encodeBase32((0, node_crypto_1.randomBytes)(20));
}
function buildOtpAuthUrl(account, secret, issuer = 'BiteMate') {
    const label = encodeURIComponent(`${issuer}:${account}`);
    return `otpauth://totp/${label}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&digits=6&period=30`;
}
function verifyTotpCode(secret, code, window = 1) {
    const trimmed = code.trim();
    if (!/^\d{6}$/.test(trimmed)) {
        return false;
    }
    const counter = Math.floor(Date.now() / 1000 / 30);
    for (let offset = -window; offset <= window; offset += 1) {
        const expected = hotp(secret, counter + offset);
        if (safeEqual(expected, trimmed)) {
            return true;
        }
    }
    return false;
}
function hotp(secret, counter) {
    const key = decodeBase32(secret);
    const buffer = Buffer.alloc(8);
    buffer.writeUInt32BE(Math.floor(counter / 0x100000000), 0);
    buffer.writeUInt32BE(counter % 0x100000000, 4);
    const digest = (0, node_crypto_1.createHmac)('sha1', key).update(buffer).digest();
    const offset = digest[digest.length - 1] & 0xf;
    const binary = ((digest[offset] & 0x7f) << 24) |
        ((digest[offset + 1] & 0xff) << 16) |
        ((digest[offset + 2] & 0xff) << 8) |
        (digest[offset + 3] & 0xff);
    return String(binary % 1_000_000).padStart(6, '0');
}
function encodeBase32(bytes) {
    let bits = 0;
    let value = 0;
    let output = '';
    for (const byte of bytes) {
        value = (value << 8) | byte;
        bits += 8;
        while (bits >= 5) {
            output += ALPHABET[(value >>> (bits - 5)) & 31];
            bits -= 5;
        }
    }
    if (bits > 0) {
        output += ALPHABET[(value << (5 - bits)) & 31];
    }
    return output;
}
function decodeBase32(input) {
    const cleaned = input.replace(/=+$/, '').toUpperCase();
    let bits = 0;
    let value = 0;
    const bytes = [];
    for (const char of cleaned) {
        const index = ALPHABET.indexOf(char);
        if (index < 0) {
            continue;
        }
        value = (value << 5) | index;
        bits += 5;
        if (bits >= 8) {
            bytes.push((value >>> (bits - 8)) & 255);
            bits -= 8;
        }
    }
    return Buffer.from(bytes);
}
function safeEqual(left, right) {
    const a = Buffer.from(left);
    const b = Buffer.from(right);
    return a.length === b.length && (0, node_crypto_1.timingSafeEqual)(a, b);
}
//# sourceMappingURL=totp.js.map