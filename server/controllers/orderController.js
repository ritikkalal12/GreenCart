import Order from '../models/Order.js';
import Product from '../models/Product.js';
import stripe from 'stripe';
import User from '../models/User.js';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

// Place Order COD : /api/order/cod
export const placeOrderCOD = async (req, res) => {
  try {
    const { userId, items, address } = req.body;
    if (!address || items.length === 0) {
      return res.json({ success: false, message: 'Invalid data' });
    }
    // Calculate Amount Using Items
    let amount = await items.reduce(async (acc, item) => {
      const product = await Product.findById(item.product);
      return (await acc) + product.offerPrice * item.quantity;
    }, 0);

    // Add Tax Charge (2%)
    amount += Math.floor(amount * 0.02);

    await Order.create({
      userId,
      items,
      amount,
      address,
      paymentType: 'COD',
    });

    return res.json({ success: true, message: 'Order Placed Successfully' });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// Place Order Stripe : /api/order/stripe
export const placeOrderStripe = async (req, res) => {
  try {
    const { userId, items, address } = req.body;
    const { origin } = req.headers;

    if (!address || items.length === 0) {
      return res.json({ success: false, message: 'Invalid data' });
    }

    let productData = [];

    // Calculate Amount Using Items
    let amount = await items.reduce(async (acc, item) => {
      const product = await Product.findById(item.product);
      productData.push({
        name: product.name,
        price: product.offerPrice,
        quantity: item.quantity,
      });
      return (await acc) + product.offerPrice * item.quantity;
    }, 0);

    // Add Tax Charge (2%)
    amount += Math.floor(amount * 0.02);

    const order = await Order.create({
      userId,
      items,
      amount,
      address,
      paymentType: 'Online',
    });

    // Stripe Gateway Initialize
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

    // create line items for stripe

    const line_items = productData.map((item) => {
      return {
        price_data: {
          currency: 'inr',
          product_data: {
            name: item.name,
          },
          unit_amount: Math.floor(item.price + item.price * 0.02) * 100, // still ok: rupees → paise
        },
        quantity: item.quantity,
      };
    });

    // create session
    const session = await stripeInstance.checkout.sessions.create({
      line_items,
      mode: 'payment',
      success_url: `${origin}/loader?next=my-orders`,
      cancel_url: `${origin}/cart`,
      metadata: {
        orderId: order._id.toString(),
        userId,
      },
    });

    return res.json({ success: true, url: session.url });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};
// Stripe Webhooks to Verify Payments Action : /stripe
export const stripeWebhooks = async (request, response) => {
  // Stripe Gateway Initialize
  const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

  const sig = request.headers['stripe-signature'];
  let event;

  try {
    event = stripeInstance.webhooks.constructEvent(
      request.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    response.status(400).send(`Webhook Error: ${error.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object;
      const paymentIntentId = paymentIntent.id;

      // Getting Session Metadata
      const session = await stripeInstance.checkout.sessions.list({
        payment_intent: paymentIntentId,
      });

      const { orderId, userId } = session.data[0].metadata;
      // Mark Payment as Paid
      await Order.findByIdAndUpdate(orderId, { isPaid: true });
      // Clear user cart
      await User.findByIdAndUpdate(userId, { cartItems: {} });
      break;
    }
    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object;
      const paymentIntentId = paymentIntent.id;

      // Getting Session Metadata
      const session = await stripeInstance.checkout.sessions.list({
        payment_intent: paymentIntentId,
      });

      const { orderId } = session.data[0].metadata;
      await Order.findByIdAndDelete(orderId);
      break;
    }

    default:
      console.error(`Unhandled event type ${event.type}`);
      break;
  }
  response.json({ received: true });
};

// Get Orders by User ID : /api/order/user
export const getUserOrders = async (req, res) => {
  try {
    const { userId } = req.body;
    const orders = await Order.find({
      userId,
      $or: [{ paymentType: 'COD' }, { isPaid: true }],
    })
      .populate('items.product address')
      .sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Get All Orders ( for seller / admin) : /api/order/seller
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      $or: [{ paymentType: 'COD' }, { isPaid: true }],
    })
      .populate('items.product address')
      .sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Modern-looking Invoice PDF : /api/order/invoice/:id
export const getOrderInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body; // from authUser middleware

    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: 'Order id is required' });
    }

    const order = await Order.findById(id)
      .populate('items.product')
      .populate('address');

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: 'Order not found' });
    }

    // ensure invoice only for that user
    if (!userId || String(order.userId) !== String(userId)) {
      return res
        .status(403)
        .json({ success: false, message: 'Not authorized to view invoice' });
    }

    // get user details for name & email
    const customer = await User.findById(order.userId).select('name email');

    // ---------- PDF INIT ----------
    const doc = new PDFDocument({ margin: 40 });

    // font in ./fonts/DejaVuSans.ttf (supports ₹)
    const fontPath = path.resolve('fonts/DejaVuSans.ttf');

    // Register font that supports ₹
    doc.registerFont('Regular', fontPath);
    doc.registerFont('Bold', fontPath);

    const primaryColor = '#22c55e'; // green
    const lightGray = '#E5E7EB';
    const textGray = '#4B5563';

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=invoice-${order._id}.pdf`
    );

    doc.pipe(res);

    // ---------- HEADER BAR ----------
    doc.rect(40, 40, 520, 60).fill(primaryColor);

    doc
      .fillColor('white')
      .font('Bold')
      .fontSize(24)
      .text('Greencart', 55, 55, { align: 'left' });

    doc.fontSize(14).text('INVOICE', 40, 55, { align: 'right', width: 520 });

    doc.moveDown(3);
    doc.fillColor('black').font('Regular');

    // ---------- INVOICE META + CUSTOMER ----------
    const invoiceTop = 120;

    // headings (bold)
    doc
      .font('Bold')
      .fontSize(11)
      .fillColor(textGray)
      .text('Invoice ID:', 40, invoiceTop)
      .text('Date:', 40, invoiceTop + 16)
      .text('Payment Type:', 40, invoiceTop + 32)
      .text('Status:', 40, invoiceTop + 48)
      .text('Customer:', 40, invoiceTop + 64)
      .text('Email:', 40, invoiceTop + 80);

    // values (regular)
    doc
      .font('Regular')
      .fillColor('black')
      .text(String(order._id), 130, invoiceTop)
      .text(
        new Date(order.createdAt).toLocaleDateString(),
        130,
        invoiceTop + 16
      )
      .text(order.paymentType, 130, invoiceTop + 32)
      .text(order.status || order.orderStatus || 'N/A', 130, invoiceTop + 48)
      .text(customer?.name || '', 130, invoiceTop + 64)
      .text(customer?.email || '', 130, invoiceTop + 80);

    // ---------- AMOUNT SUMMARY BOX ----------
    const rightBoxX = 340;
    const rightBoxY = invoiceTop;
    const rightBoxWidth = 220;
    const rightBoxHeight = 70;

    doc
      .roundedRect(rightBoxX, rightBoxY, rightBoxWidth, rightBoxHeight, 8)
      .strokeColor(lightGray)
      .lineWidth(1)
      .stroke();

    // heading (bold)
    doc
      .font('Bold')
      .fontSize(10)
      .fillColor(textGray)
      .text('Total Amount', rightBoxX + 14, rightBoxY + 10);

    // value (regular)
    doc
      .font('Regular')
      .fontSize(18)
      .fillColor(primaryColor)
      .text(`₹${order.amount}`, rightBoxX + 14, rightBoxY + 28);

    doc.fillColor('black').font('Regular');

    // ---------- SHIP TO (only) ----------
    const addressTop = rightBoxY + rightBoxHeight + 40;
    const addr = order.address || {};

    // heading bold
    doc
      .font('Bold')
      .fontSize(12)
      .fillColor(textGray)
      .text('Ship To', 40, addressTop, { underline: true });

    // values regular
    doc
      .font('Regular')
      .fontSize(10)
      .fillColor('black')
      .text(addr.fullName || '', 40, addressTop + 18)
      .text(addr.street || '', 40, addressTop + 32)
      .text(
        `${addr.city || ''}, ${addr.state || ''} - ${addr.pincode || ''}`,
        40,
        addressTop + 46
      )
      .text(`Phone: ${addr.phone || ''}`, 40, addressTop + 60);

    // separator line
    doc
      .moveTo(40, addressTop + 90)
      .lineTo(560, addressTop + 90)
      .strokeColor(lightGray)
      .lineWidth(1)
      .stroke();

    // ---------- ITEMS TABLE ----------
    let tableTop = addressTop + 110;

    // section heading
    doc
      .font('Bold')
      .fontSize(12)
      .fillColor(textGray)
      .text('Order Items', 40, tableTop - 18);

    // Table headers (bold)
    const itemX = 40;
    const qtyX = 300;
    const priceX = 360;
    const totalX = 440;

    doc
      .font('Bold')
      .fontSize(10)
      .text('Item', itemX, tableTop)
      .text('Qty', qtyX, tableTop, { width: 40, align: 'right' })
      .text('Price', priceX, tableTop, { width: 60, align: 'right' })
      .text('Total', totalX, tableTop, { width: 80, align: 'right' });

    doc
      .moveTo(40, tableTop + 14)
      .lineTo(560, tableTop + 14)
      .strokeColor(lightGray)
      .lineWidth(1)
      .stroke();

    // Table rows (values regular)
    let rowY = tableTop + 22;
    let subtotal = 0;

    order.items.forEach((item, index) => {
      const p = item.product;
      const qty = item.quantity || 1;
      const price = p?.offerPrice ?? p?.price ?? 0;
      const lineTotal = price * qty;
      subtotal += lineTotal;

      // zebra background
      if (index % 2 === 0) {
        doc
          .rect(40, rowY - 2, 520, 18)
          .fillOpacity(0.03)
          .fill(primaryColor)
          .fillOpacity(1);
      }

      doc
        .font('Regular')
        .fontSize(10)
        .fillColor(textGray)
        .text(p?.name || 'Product', itemX + 4, rowY, { width: 250 })
        .text(String(qty), qtyX, rowY, { width: 40, align: 'right' })
        .text(`₹${price}`, priceX, rowY, { width: 60, align: 'right' })
        .text(`₹${lineTotal}`, totalX, rowY, { width: 80, align: 'right' });

      rowY += 20;
    });

    // ---------- TOTALS SECTION (Subtotal, Tax, Shipping, Total) ----------
    const totalsTop = rowY + 10;
    const totalsX = 340;

    // compute tax & shipping from actual stored total
    const tax = Math.round(subtotal * 0.02); // 2% tax (same as UI)
    const rawShipping = order.amount - (subtotal + tax);
    const shipping = rawShipping > 0 ? rawShipping : 0;

    // labels (bold)
    doc
      .font('Bold')
      .fontSize(10)
      .fillColor(textGray)
      .text('Subtotal', totalsX, totalsTop, { width: 100, align: 'right' })
      .text('Tax (2%)', totalsX, totalsTop + 16, {
        width: 100,
        align: 'right',
      })
      .text('Shipping', totalsX, totalsTop + 32, {
        width: 100,
        align: 'right',
      });

    // values (regular)
    doc
      .font('Regular')
      .text(`₹${subtotal}`, totalsX + 110, totalsTop, {
        width: 80,
        align: 'right',
      })
      .text(`₹${tax}`, totalsX + 110, totalsTop + 16, {
        width: 80,
        align: 'right',
      })
      .text(`₹${shipping}`, totalsX + 110, totalsTop + 32, {
        width: 80,
        align: 'right',
      });

    // TOTAL row – heading bold, value regular
    doc
      .font('Bold')
      .fontSize(11)
      .fillColor('black')
      .text('Total', totalsX, totalsTop + 52, {
        width: 100,
        align: 'right',
      });

    doc
      .font('Regular')
      .text(`₹${order.amount}`, totalsX + 110, totalsTop + 52, {
        width: 80,
        align: 'right',
      });

    // ---------- FOOTER (same page) ----------
    doc
      .moveTo(40, 760)
      .lineTo(560, 760)
      .strokeColor(lightGray)
      .lineWidth(1)
      .stroke();

    doc
      .font('Regular')
      .fontSize(9)
      .fillColor(textGray)
      .text('Thank you for shopping with Greencart.', 40, 770, {
        width: 520,
        align: 'center',
      });

    doc.end();
  } catch (error) {
    console.error('[getOrderInvoice]', error);
    if (!res.headersSent) {
      return res
        .status(500)
        .json({ success: false, message: 'Failed to generate invoice' });
    }
  }
};
