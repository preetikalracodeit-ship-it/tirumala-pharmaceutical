export type NotificationRow = {
    id: string;
    userId: string;
    type: string;
    title: string;
    body: string;
    orderId?: string | null;
    isRead: boolean;
    requiresAction: boolean;
    actionType?: string | null;
    metadata?: Record<string, unknown> | null;
    createdAt: string;
};
declare function formatRow(n: Record<string, unknown>): NotificationRow;
export declare function createNotification(opts: {
    userId: string;
    type: string;
    title: string;
    body: string;
    orderId?: string;
    requiresAction?: boolean;
    actionType?: string;
    metadata?: Record<string, unknown>;
}): Promise<NotificationRow>;
export declare function notifyUsers(userIds: string[], opts: Omit<Parameters<typeof createNotification>[0], 'userId'>): Promise<NotificationRow[]>;
export declare function getUnreadCount(userId: string): Promise<number>;
export { formatRow as formatNotification };
