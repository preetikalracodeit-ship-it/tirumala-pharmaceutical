export declare function getDriverName(): "sqlite";
export declare function initDatabase(): Promise<void>;
export declare function query<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<T[]>;
export declare function queryOne<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<T | null>;
export declare function run(sql: string, params?: unknown[]): Promise<{
    changes: number;
    lastInsertRowid: number | bigint;
}>;
