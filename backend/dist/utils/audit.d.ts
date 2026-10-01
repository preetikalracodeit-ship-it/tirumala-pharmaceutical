export declare function logAudit(opts: {
    userId?: string | null;
    action: string;
    entityType?: string;
    entityId?: string;
    details?: string;
    ip?: string;
}): Promise<void>;
