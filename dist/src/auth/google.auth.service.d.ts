export type GoogleProfile = {
    sub: string;
    email?: string | null;
    name?: string | null;
    picture?: string | null;
};
export declare class GoogleAuthService {
    private client;
    verify(idToken: string): Promise<GoogleProfile>;
}
