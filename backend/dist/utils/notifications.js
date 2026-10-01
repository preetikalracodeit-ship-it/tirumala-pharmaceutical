import { v4 as uuidv4 } from 'uuid';
import { run, query } from '../db/index.js';
import { broadcast } from './notification-hub.js';
function now() {
    return new Date().toISOString().slice(0, 19).replace('T', ' ');
}
function formatRow(n) {
    let metadata = null;
    if (n.metadata) {
        try {
            metadata = JSON.parse(String(n.metadata));
        }
        catch {
            metadata = null;
        }
    }
    return {
        id: String(n.id),
        userId: String(n.user_id),
        type: String(n.type),
        title: String(n.title),
        body: String(n.body),
        orderId: n.order_id ? String(n.order_id) : null,
        isRead: Boolean(n.is_read),
        requiresAction: Boolean(n.requires_action),
        actionType: n.action_type ? String(n.action_type) : null,
        metadata,
        createdAt: String(n.created_at),
    };
}
export async function createNotification(opts) {
    const id = uuidv4();
    const ts = now();
    await run(`INSERT INTO notifications (id,user_id,type,title,body,order_id,is_read,requires_action,action_type,metadata,created_at)
     VALUES (?,?,?,?,?,?,0,?,?,?,?)`, [
        id, opts.userId, opts.type, opts.title, opts.body,
        opts.orderId ?? null, opts.requiresAction ? 1 : 0,
        opts.actionType ?? null, opts.metadata ? JSON.stringify(opts.metadata) : null, ts,
    ]);
    const row = formatRow({
        id, user_id: opts.userId, type: opts.type, title: opts.title, body: opts.body,
        order_id: opts.orderId ?? null, is_read: 0, requires_action: opts.requiresAction ? 1 : 0,
        action_type: opts.actionType ?? null, metadata: opts.metadata ? JSON.stringify(opts.metadata) : null,
        created_at: ts,
    });
    broadcast(opts.userId, { event: 'notification', data: row });
    return row;
}
export async function notifyUsers(userIds, opts) {
    const rows = [];
    for (const userId of [...new Set(userIds)]) {
        rows.push(await createNotification({ ...opts, userId }));
    }
    return rows;
}
export async function getUnreadCount(userId) {
    const rows = await query('SELECT COUNT(*) as c FROM notifications WHERE user_id=? AND is_read=0', [userId]);
    return Number(rows[0]?.c ?? 0);
}
export { formatRow as formatNotification };
//# sourceMappingURL=notifications.js.map