import Order from '../models/Order.js';

// ========== CHANGE ORDER STATUS (ADMIN) ==========
export const updateOrderStatus = async (req, res) => {
  try {
    const { status, id } = req.body;

    if (!status || !id) {
      return res
        .status(400)
        .json({ success: false, message: 'Status and Id are required' });
    }

    const order = await Order.findById(id);

    if (!order)
      return res
        .status(404)
        .json({ success: false, message: 'Order not found' });

    order.status = status;
    order.orderStatus = status;

    await order.save();

    res.json({ success: true, order });
  } catch (error) {
    console.error('[updateOrderStatus]', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ========== GET ORDERS FOR USER ==========
export const getUserOrders = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId)
      return res
        .status(400)
        .json({ success: false, message: 'Missing userId' });

    const orders = await Order.find({
      userId,
      $or: [{ paymentType: 'COD' }, { isPaid: true }],
    })
      .populate('items.product address')
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (error) {
    console.error('[getUserOrders]', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ========== GET ALL ORDERS (ADMIN) ==========
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('items.product address')
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (error) {
    console.error('[getAllOrders]', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ========== CANCEL ORDER (USER) ==========
export const cancelOrder = async (req, res) => {
  try {
    const { id, userId } = req.body; // authUser middleware auto-sets userId

    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: 'Missing order id' });
    }

    const order = await Order.findById(id);

    if (!order)
      return res
        .status(404)
        .json({ success: false, message: 'Order not found' });

    // Ensure this user owns this order
    if (!userId || String(order.userId) !== String(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this order',
      });
    }

    // Prevent cancelling delivered orders
    const currentStatus = (
      order.status ||
      order.orderStatus ||
      ''
    ).toLowerCase();

    if (currentStatus === 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a delivered order',
      });
    }

    // Mark order cancelled (DO NOT delete)
    order.status = 'Cancelled';
    order.orderStatus = 'Cancelled';

    await order.save();

    return res.json({
      success: true,
      message: 'Order cancelled successfully',
      order,
    });
  } catch (error) {
    console.error('[cancelOrder]', error);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
};
