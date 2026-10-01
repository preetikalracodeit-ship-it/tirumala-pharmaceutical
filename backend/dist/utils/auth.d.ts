export interface TokenPayload {
    userId: string;
    email: string;
    role: string;
}
export declare function hashPassword(password: string): Promise<string>;
export declare function verifyPassword(password: string, hash: string): Promise<boolean>;
export declare function generateToken(payload: TokenPayload): string;
export declare function verifyToken(token: string): TokenPayload | null;
export declare function extractToken(authHeader?: string): string | null;
