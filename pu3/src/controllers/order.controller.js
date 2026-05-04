const { checkoutService, getOrderById, getAllOrders } = require("../services/order.service");

const checkout = async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ message: "Missing userId" });
        }

        const order = await checkoutService(userId);

        return res.json({
            message: "Order placed successfully",
            order
        });

    } catch (error) {
        return res.status(400).json({
            message: error.message
        });
    }
};

const getOrder = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await getOrderById(id);

        if (!order) {
            return res.json(null);
        }

        return res.json(order);

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};

module.exports = {
    checkout,
    getOrder
};