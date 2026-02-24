import { OtpSender } from './otp-sender';
export declare class SmsOtpSender implements OtpSender {
    sendOtp(toPhoneE164: string, code: string): Promise<void>;
}
