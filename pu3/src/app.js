const express = require("express");
const { connectRedis } = require("./config/redis");
const orderRoutes = require("./routes/order.routes");

const app = express();
app.use(express.json());

app.use("/", orderRoutes);

const startServer = async () => {
    await connectRedis();

    app.listen(8083, () => {
        console.log("🚀 Order PU running on port 8083");
    });
};

startServer();