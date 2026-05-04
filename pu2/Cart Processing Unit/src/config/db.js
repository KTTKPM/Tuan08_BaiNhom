const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT) || 3306,
    database: process.env.DB_NAME || 'flashsale',
    user: process.env.DB_USER || 'appuser',
    password: process.env.DB_PASSWORD || 'apppassword',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    timezone: '+07:00',
});

async function testConnection() {
    try {
        const conn = await pool.getConnection();
        console.log('[MariaDB] Connected → ' + process.env.DB_HOST + ':' + process.env.DB_PORT);
        conn.release();
    } catch (err) {
        console.error('[MariaDB] Connection failed:', err.message);
        // Không crash app – MariaDB chỉ dùng cho audit log, không phải luồng chính
    }
}

module.exports = { pool, testConnection };