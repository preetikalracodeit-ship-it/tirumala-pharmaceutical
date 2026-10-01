export declare function calculateCommission(totalAmount: number, type: string | null | undefined, value: number): {
    commissionType: string;
    commissionValue: number;
    amount: number;
    pctForLegacyColumn: number;
};
/** Admin sets commission after customer confirms receipt. */
export declare function createCommissionForOrder(orderId: string, commissionPct: number, adminUserId: string): Promise<{
    id: string;
} | null>;
