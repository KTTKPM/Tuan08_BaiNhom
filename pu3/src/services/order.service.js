const { redisClient } = require("../config/redis");
const { createOrder } = require("../models/order.model");

const checkoutService = async (userId) => {
    const cartKey = `cart:${userId}`;
    const cartData = await redisClient.get(cartKey);

    if (!cartData) {
        throw new Error("Cart is empty");
    }

    const cart = JSON.parse(cartData);

  
    for (const item of cart.items) {
        const stockKey = `stock:${item.productId}`;
        const stock = await redisClient.get(stockKey);

        if (!stock || Number(stock) < item.quantity) {
            throw new Error(`Not enough stock for product ${item.productId}`);
        }

        await redisClient.decrBy(stockKey, item.quantity);
    }

 
    const order = createOrder(userId, cart.items);

    await redisClient.set(`order:${order.orderId}`, JSON.stringify(order));

 
    await redisClient.del(cartKey);


    await redisClient.publish("order_created", JSON.stringify(order));

    return order;
};
const getOrderById = async (orderId) => {
    const orderData = await redisClient.get(`order:${orderId}`);

    if (!orderData) {
        return null; 
    }

    return JSON.parse(orderData);
};


module.exports = {
    checkoutService,
    getOrderById
};