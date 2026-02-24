import { createHash, randomInt, randomBytes } from 'crypto';
export function generateOtp6() {
    // 100000..999999
    const n = randomInt(100000, 1000000);
    return String(n);
}
export function sha256(input) {
    return createHash('sha256').update(input).digest('hex');
}
export function makeOtpHash(code, phoneE164, pepper) {
    // bind to phone so code reuse across phones is useless
    return sha256(`${pepper}:${phoneE164}:${code}`);
}
export function makeRefreshToken() {
    return randomBytes(48).toString('hex');
}
export function makeRefreshTokenHash(token, pepper) {
    return sha256(`${pepper}:refresh:${token}`);
}
//# sourceMappingURL=auth.crypto.js.map