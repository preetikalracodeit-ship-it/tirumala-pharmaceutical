import { Request, Response, NextFunction } from 'express';
import { TokenPayload } from '../utils/auth.js';
export interface AuthRequest extends Request {
    user?: TokenPayload;
}
export declare function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
export declare function roleMiddleware(...allowedRoles: string[]): (req: AuthRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
