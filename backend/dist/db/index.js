let active;
let driverLabel = 'mysql';
export function getActiveDriver() {
    return driverLabel;
}
export async function initDatabase() {
    const requested = (process.env.DB_DRIVER || 'mysql').toLowerCase();
    if (requested === 'sqlite') {
        active = await import('./sqlite.js');
        driverLabel = 'sqlite';
        await active.initDatabase();
        const { ensureExtendedSchema } = await import('./extended-schema.js');
        await ensureExtendedSchema();
        return;
    }
    try {
        const mysqlDb = await import('./mysql.js');
        await mysqlDb.initDatabase();
        active = mysqlDb;
        driverLabel = 'mysql';
    }
    catch (err) {
        const code = err && typeof err === 'object' && 'code' in err ? String(err.code) : '';
        const retryable = ['ETIMEDOUT', 'ECONNREFUSED', 'ECONNRESET', 'ENOTFOUND', 'EHOSTUNREACH'].includes(code);
        if (!retryable && process.env.DB_FALLBACK_SQLITE !== '1') {
            throw err;
        }
        console.warn('\n⚠️  MySQL is not responding (XAMPP may need a restart).');
        console.warn(`   Error: ${code || (err instanceof Error ? err.message : 'connection failed')}`);
        console.warn('   Using SQLite instead → backend/data/medical.db');
        console.warn('   Fix MySQL: XAMPP → Stop MySQL → Start MySQL, set DB_HOST=127.0.0.1, DB_DRIVER=mysql\n');
        active = await import('./sqlite.js');
        driverLabel = 'sqlite';
        await active.initDatabase();
    }
    const { ensureExtendedSchema } = await import('./extended-schema.js');
    await ensureExtendedSchema();
}
export async function query(sql, params = []) {
    return active.query(sql, params);
}
export async function queryOne(sql, params = []) {
    return active.queryOne(sql, params);
}
export async function run(sql, params = []) {
    return active.run(sql, params);
}
export function getPool() {
    return null;
}
//# sourceMappingURL=index.js.map