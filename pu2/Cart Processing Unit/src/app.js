require('dotenv').config();
const express = require('express');
const cors = require('cors');
const redis = require('./config/redis');
const cartRoutes = require('./routes/cart');

const app = express();
const PORT = process.env.PORT || 8082;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
    res.json({
        service: 'PU2 - Cart Processing Unit',
        status: 'OK',
        time: new Date().toISOString(),
    });
});

app.use('/cart', cartRoutes);

app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

async function start() {
    await redis.connect();
    app.listen(PORT, () => {
        console.log(`[PU2] Cart Service running on port ${PORT}`);
    });
}

start().catch((err) => {
    console.error('Failed to start:', err);
    process.exit(1);
});
