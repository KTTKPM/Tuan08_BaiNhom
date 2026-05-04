const createOrder = (userId, items) => {
    return {
        orderId: require("uuid").v4(),
        userId,
        items,
        createdAt: new Date(),
        status: "SUCCESS"
    };
};

module.exports = {
    createOrder
};