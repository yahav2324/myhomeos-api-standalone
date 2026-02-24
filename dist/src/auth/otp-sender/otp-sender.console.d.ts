import { OtpSender } from './otp-sender';
export declare class ConsoleOtpSender implements OtpSender {
    sendOtp(toPhoneE164: string, code: string): Promise<void>;
}
