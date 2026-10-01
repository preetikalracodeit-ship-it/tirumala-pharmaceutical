const subscribers = new Map();
export function subscribe(userId, send) {
    if (!subscribers.has(userId))
        subscribers.set(userId, new Set());
    subscribers.get(userId).add(send);
    return () => {
        subscribers.get(userId)?.delete(send);
        if (subscribers.get(userId)?.size === 0)
            subscribers.delete(userId);
    };
}
export function broadcast(userId, payload) {
    const msg = `data: ${JSON.stringify(payload)}\n\n`;
    subscribers.get(userId)?.forEach(fn => {
        try {
            fn(msg);
        }
        catch { /* client disconnected */ }
    });
}
export function broadcastMany(userIds, payload) {
    for (const id of userIds)
        broadcast(id, payload);
}
//# sourceMappingURL=notification-hub.js.map