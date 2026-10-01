import { queryOne } from '../db/index.js';
/** Resolve unit price: role-based tier if exists, else product selling_price */
export async function resolveUnitPrice(product, role, quantity) {
    const tier = await queryOne(`SELECT price FROM product_pricing
     WHERE product_id = ? AND role = ?
       AND min_quantity <= ?
       AND (max_quantity IS NULL OR max_quantity >= ?)
       AND (effective_to IS NULL OR effective_to >= ?)
     ORDER BY min_quantity DESC LIMIT 1`, [product.id, role, quantity, quantity, new Date().toISOString().slice(0, 19).replace('T', ' ')]);
    if (tier?.price != null)
        return Number(tier.price);
    return Number(product.selling_price) || 0;
}
//# sourceMappingURL=pricing.js.map