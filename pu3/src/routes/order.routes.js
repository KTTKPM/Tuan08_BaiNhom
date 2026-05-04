const express = require("express");
const router = express.Router();

const { checkout, getOrder } = require("../controllers/order.controller");

router.post("/checkout", checkout);
router.get("/orders/:id", getOrder);


module.exports = router;