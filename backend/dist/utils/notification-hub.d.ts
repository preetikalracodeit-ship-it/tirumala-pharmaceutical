type Sender = (chunk: string) => void;
export declare function subscribe(userId: string, send: Sender): () => void;
export declare function broadcast(userId: string, payload: Record<string, unknown>): void;
export declare function broadcastMany(userIds: string[], payload: Record<string, unknown>): void;
export {};
