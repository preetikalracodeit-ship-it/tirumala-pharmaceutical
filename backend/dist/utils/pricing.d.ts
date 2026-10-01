import type { RowDataPacket } from 'mysql2/promise';
/** Resolve unit price: role-based tier if exists, else product selling_price */
export declare function resolveUnitPrice(product: RowDataPacket, role: string, quantity: number): Promise<number>;
