const redisClient = require('./redisClient');

// Xem tồn kho
exports.getStock = async (req, res) => {
    try {
        const { productId } = req.params;
        
        let stock = await redisClient.get(`stock:${productId}`) || await redisClient.get(productId);

        if (stock === null) {
            const productData = await redisClient.get(`product:${productId}`);
            if (productData) {
                const p = JSON.parse(productData);
                stock = p.stock || p.Stock || p.inventory;
            }
        }

        if (stock === null) {
            console.log(`❌ Thất bại: Không tìm thấy sản phẩm ${productId} trong Data Grid.`);
            return res.status(404).json({ success: false, message: "Hàng không có trong kho RAM" });
        }

        res.json({
            productId: productId,
            stock: parseInt(stock)
        });

    } catch (error) {
        console.error("Lỗi hệ thống:", error);
        res.status(500).json({ error: "Lỗi Server nội bộ" });
    }
};

// Giảm tồn kho (Dùng cho Checkout)
exports.decreaseStock = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const q = parseInt(quantity);

        console.log(`--- Đang xử lý giảm kho cho ID: ${productId}, Số lượng: ${q} ---`);

        const key1 = `stock:${productId}`;
        const key2 = productId;
        
        let activeKey = null;
        let currentStock = await redisClient.get(key1);
        
        if (currentStock !== null) {
            activeKey = key1;
        } else {
            currentStock = await redisClient.get(key2);
            if (currentStock !== null) activeKey = key2;
        }

        if (activeKey === null) {
            return res.status(404).json({ 
                success: false, 
                message: `Không tìm thấy sản phẩm ${productId} trong kho Redis!` 
            });
        }

        if (parseInt(currentStock) < q) {
            return res.status(400).json({ 
                success: false, 
                message: `Flash Sale quá nhanh! Chỉ còn ${currentStock} sản phẩm, không đủ ${q}.` 
            });
        }

        const newStock = await redisClient.decrBy(activeKey, q);
        
        if (newStock < 0) {
            await redisClient.incrBy(activeKey, q);
            return res.status(400).json({ success: false, message: "Hết hàng ngay lúc đặt!" });
        }

        console.log(`✅ Thành công: Key [${activeKey}] giảm ${q}. Còn lại: ${newStock}`);
        
        res.json({ 
            success: true, 
            productId, 
            remainingStock: newStock,
            message: "Giảm tồn kho thành công!"
        });

    } catch (error) {
        console.error("Lỗi khi giảm kho:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};