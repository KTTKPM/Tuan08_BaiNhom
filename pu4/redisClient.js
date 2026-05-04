const redis = require('redis');
require('dotenv').config();

const client = redis.createClient({
    url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
});

client.on('error', (err) => console.error('Redis Client Error', err));

(async () => {
    await client.connect();
    console.log('Connected to Data Grid (Redis)');
})();

module.exports = client;