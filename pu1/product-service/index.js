require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { redisClient } = require('./redis');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8081;

// Space-Based Architecture Principle: Processing Unit
// - Load from Data Grid (Redis)
// - NO DB connection here

// GET /products
app.get('/products', async (req, res) => {
    try {
        const keys = await redisClient.keys('product:*');
        
        if (keys.length === 0) {
            return res.status(200).json({ success: true, data: [] });
        }

        const products = [];
        for (const key of keys) {
            const productStr = await redisClient.get(key);
            if (productStr) {
                products.push(JSON.parse(productStr));
            }
        }

        res.status(200).json({ success: true, data: products });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// GET /products/:id
app.get('/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const productStr = await redisClient.get(`product:${id}`);

        if (!productStr) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        res.status(200).json({ success: true, data: JSON.parse(productStr) });
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

app.listen(PORT,'0.0.0.0', async () => {
    console.log(`[PU1 - Product Service] running on port ${PORT}`);
    // Ensuring Redis is connected
    try {
        if (!redisClient.isOpen) {
             await redisClient.connect();
        }
        console.log('Connected to Redis Data Grid');
    } catch (error) {
        console.error('Failed to connect to Redis', error);
    }
});
