const { createClient } = require('redis');

const client = createClient({
    socket: {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: parseInt(process.env.REDIS_PORT) || 6379,
        reconnectStrategy: (retries) => Math.min(retries * 100, 3000),
    },
});

client.on('error', (err) => console.error('[Redis] Error:', err.message));
client.on('connect', () => console.log(`[Redis] Connected → ${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`));
client.on('reconnecting', () => console.log('[Redis] Reconnecting...'));

module.exports = client;