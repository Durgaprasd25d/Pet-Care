const Order = require("../models/Order");
const Product = require("../models/Product");
const NotificationService = require("../services/notificationService");

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
  const { items, totalPrice, address, phone, paymentMethod } = req.body;

  if (items && items.length === 0) {
    res.status(400);
    throw new Error("No order items");
  } else {
    try {
      // Validate stock before creating order
      for (const item of items) {
        const product = await Product.findById(item.productId);
        if (!product) {
          return res
            .status(404)
            .json({ message: `Product ${item.productId} not found` });
        }
        if (product.stock < item.quantity) {
          return res
            .status(400)
            .json({ message: `Insufficient stock for ${product.name}` });
        }
      }

      const order = new Order({
        userId: req.user._id,
        items,
        totalPrice,
        address,
        phone,
        paymentMethod,
      });

      const createdOrder = await order.save();

      // Deduct stock
      for (const item of items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: -item.quantity },
        });
      }

      // Notify User
      NotificationService.sendToUser(req.user._id.toString(), {
        title: 'Order Placed! 📦',
        body: `Your order for $${totalPrice} has been successfully placed.`,
        data: { type: 'order', orderId: createdOrder._id.toString() }
      });

      res.status(201).json(createdOrder);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("userId", "name email")
      .populate("items.productId", "name image storeId");

    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ message: "Order not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/user
// @access  Private
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort(
      "-createdAt",
    );
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (Store/Admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.status = req.body.status || order.status;
      const updatedOrder = await order.save();

      // Notify User
      NotificationService.sendToUser(order.userId.toString(), {
        title: 'Order Update 🚚',
        body: `Your order status is now: ${updatedOrder.status}`,
        data: { type: 'order_update', orderId: updatedOrder._id.toString() }
      });

      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: "Order not found" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all orders for a store
// @route   GET /api/orders/store
// @access  Private (Store)
exports.getStoreOrders = async (req, res) => {
  try {
    // This is a bit complex since items might be from multiple stores.
    // For this implementation, we'll assume a store admin wants to see any order containing their products.
    const products = await Product.find({ storeId: req.user._id }).distinct(
      "_id",
    );
    const orders = await Order.find({
      "items.productId": { $in: products },
    }).sort("-createdAt");

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
