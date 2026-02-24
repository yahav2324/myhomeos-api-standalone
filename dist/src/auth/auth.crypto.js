"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOtp6 = generateOtp6;
exports.sha256 = sha256;
exports.makeOtpHash = makeOtpHash;
exports.makeRefreshToken = makeRefreshToken;
exports.makeRefreshTokenHash = makeRefreshTokenHash;
const crypto_1 = require("crypto");
function generateOtp6() {
    const n = (0, crypto_1.randomInt)(100000, 1000000);
    return String(n);
}
function sha256(input) {
    return (0, crypto_1.createHash)('sha256').update(input).digest('hex');
}
function makeOtpHash(code, phoneE164, pepper) {
    return sha256(`${pepper}:${phoneE164}:${code}`);
}
function makeRefreshToken() {
    return (0, crypto_1.randomBytes)(48).toString('hex');
}
function makeRefreshTokenHash(token, pepper) {
    return sha256(`${pepper}:refresh:${token}`);
}
//# sourceMappingURL=auth.crypto.js.map