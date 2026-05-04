const redis = require('../config/redis');

const CART_TTL = 60 * 60;
const LOCK_TTL_MS = 3000;

const cartKey = (userId) => `cart:${userId}`;
const lockKey = (userId) => `lock:cart:${userId}`;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function getCart(userId) {
    const data = await redis.get(cartKey(userId));
    return data ? JSON.parse(data) : { userId, items: [], updatedAt: null };
}

async function acquireLock(userId, maxAttempts = 10) {
    const key = lockKey(userId);
    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
        const result = await redis.set(key, '1', { NX: true, PX: LOCK_TTL_MS });
        if (result === 'OK') return true;
        await sleep(20 + attempt * 10);
    }
    return false;
}

async function releaseLock(userId) {
    await redis.del(lockKey(userId));
}

async function addToCart(userId, product) {
    const acquired = await acquireLock(userId);
    if (!acquired) {
        throw new Error('Cart is busy, please retry');
    }

    try {
        const cart = await getCart(userId);
        const qty = Number(product.quantity) || 1;
        const existing = cart.items.find((i) => i.productId === product.productId);

        if (existing) {
            existing.quantity += qty;
            existing.price = product.price;
            if (product.name) existing.name = product.name;
        } else {
            cart.items.push({
                productId: product.productId,
                name: product.name || '',
                price: product.price,
                quantity: qty,
            });
        }

        cart.updatedAt = new Date().toISOString();
        await redis.setEx(cartKey(userId), CART_TTL, JSON.stringify(cart));
        return cart;
    } finally {
        await releaseLock(userId);
    }
}

async function clearCart(userId) {
    await redis.del(cartKey(userId));
}

module.exports = { getCart, addToCart, clearCart };
