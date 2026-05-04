require('dotenv').config();
const { redisClient } = require('./redis');

const seedProducts = async () => {
    try {
        await redisClient.connect();
        
        const products = [
            { id: '1', name: 'iPhone 15 Pro Max', price: 1200, stock: 100, description: 'Apple Smartphone' },
            { id: '2', name: 'MacBook Pro M3', price: 2500, stock: 50, description: 'Apple Laptop' },
            { id: '3', name: 'AirPods Pro 2', price: 250, stock: 200, description: 'Wireless Earbuds' },
            { id: '4', name: 'Sony WH-1000XM5', price: 350, stock: 80, description: 'Noise Cancelling Headphones' },
            { id: '5', name: 'Samsung Galaxy S24 Ultra', price: 1300, stock: 120, description: 'Samsung Smartphone' }
        ];

        for (const product of products) {
            await redisClient.set(`product:${product.id}`, JSON.stringify(product));
            console.log(`Added product ${product.id}`);
        }

        console.log('Database seeded into Redis Data Grid successfully!');
    } catch (error) {
        console.error('Error seeding data:', error);
    } finally {
        await redisClient.disconnect();
    }
};

seedProducts();
