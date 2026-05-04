const express = require('express');
const router = express.Router();
const cartService = require('../services/cartService');

// GET /cart?userId=123
router.get('/', async (req, res) => {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId is required' });
    try {
        const cart = await cartService.getCart(userId);
        res.json({ success: true, data: cart });
    } catch (err) {
        console.error('[GET /cart]', err.message);
        res.status(500).json({ error: 'Failed to get cart' });
    }
});

// POST /cart/add  — body: { userId, productId, name, price, quantity }
router.post('/add', async (req, res) => {
    const { userId, productId, name, price, quantity } = req.body;
    if (!userId || !productId || price == null) {
        return res.status(400).json({ error: 'userId, productId, price are required' });
    }
    const unitPrice = Number(price);
    const qty = quantity == null ? 1 : Number(quantity);
    if (!Number.isFinite(unitPrice) || unitPrice < 0) {
        return res.status(400).json({ error: 'price must be a non-negative number' });
    }
    if (!Number.isInteger(qty) || qty <= 0) {
        return res.status(400).json({ error: 'quantity must be a positive integer' });
    }
    try {
        const cart = await cartService.addToCart(userId, {
            productId,
            name,
            price: unitPrice,
            quantity: qty,
        });
        res.json({ success: true, data: cart });
    } catch (err) {
        console.error('[POST /cart/add]', err.message);
        res.status(500).json({ error: 'Failed to add to cart' });
    }
});

// DELETE /cart/clear?userId=123  — PU3 gọi sau checkout
router.delete('/clear', async (req, res) => {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId is required' });
    try {
        await cartService.clearCart(userId);
        res.json({ success: true, message: 'Cart cleared' });
    } catch (err) {
        console.error('[DELETE /cart/clear]', err.message);
        res.status(500).json({ error: 'Failed to clear cart' });
    }
});

module.exports = router;
