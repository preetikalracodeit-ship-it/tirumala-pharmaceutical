import { type Pool, type ResultSetHeader, type RowDataPacket } from 'mysql2/promise';
export declare function getDriverName(): "mysql";
export declare function initDatabase(): Promise<void>;
export declare function query<T = RowDataPacket>(sql: string, params?: unknown[]): Promise<T[]>;
export declare function queryOne<T = RowDataPacket>(sql: string, params?: unknown[]): Promise<T | null>;
export declare function run(sql: string, params?: unknown[]): Promise<ResultSetHeader>;
export declare function getPool(): Pool;
