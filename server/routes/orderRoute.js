import express from 'express';
import authUser from '../middlewares/authUser.js';
import authSeller from '../middlewares/authSeller.js';
import {
  getAllOrders,
  getUserOrders,
  placeOrderCOD,
  placeOrderStripe,
  getOrderInvoice,
} from '../controllers/orderController.js';
import {
  updateOrderStatus,
  cancelOrder,
} from '../controllers/orderStatusController.js';

const orderRouter = express.Router();

orderRouter.post('/cod', authUser, placeOrderCOD);
orderRouter.get('/user', authUser, getUserOrders);
orderRouter.get('/seller', authSeller, getAllOrders);
orderRouter.post('/stripe', authUser, placeOrderStripe);

// Seller endpoint — sellers may set any allowed status
orderRouter.post('/status', authSeller, updateOrderStatus);

// User endpoint to cancel their own order only
orderRouter.post('/status/cancel', authUser, cancelOrder);

// Invoice download
orderRouter.get('/invoice/:id', authUser, getOrderInvoice);

export default orderRouter;
