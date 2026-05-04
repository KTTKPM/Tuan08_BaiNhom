const express = require('express');
const cors = require('cors');
const inventoryController = require('./inventoryController');
require('dotenv').config();

const app = express();

app.use(cors()); 
app.use(express.json());

// Routes
app.get('/stock/:productId', inventoryController.getStock);
app.post('/stock/decrease', inventoryController.decreaseStock); // const { productId, quantity } = req.body;

const PORT = process.env.PORT || 8084;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Inventory PU đang chạy tại: http://${process.env.MY_IP}:${PORT}`);
});