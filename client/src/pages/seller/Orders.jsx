import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { assets, dummyOrders } from '../../assets/assets';
import toast from 'react-hot-toast';

const STATUSES = [
  'Pending',
  'Picked Up',
  'On The Way',
  'Delivered',
  'Cancelled',
];

// return tailwind classes for a status badge
const statusClasses = (s) => {
  switch ((s || '').toLowerCase()) {
    case 'picked up':
      return 'bg-yellow-600 text-white';
    case 'on the way':
      return 'bg-blue-600 text-white';
    case 'delivered':
      return 'bg-green-700 text-white';
    case 'cancelled':
      return 'bg-red-700 text-white';
    default:
      return 'bg-gray-800 text-white';
  }
};

const Orders = () => {
  const { currency, axios } = useAppContext();
  const [orders, setOrders] = useState([]);

  // modal / status update state
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editingStatus, setEditingStatus] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get('/api/order/seller');
      if (data.success) {
        setOrders(data.orders);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const openOrder = (order) => {
    setSelectedOrder(order);
    setEditingStatus(order.status || order.orderStatus || 'Pending');
  };

  const closeOrder = () => {
    setSelectedOrder(null);
    setEditingStatus('');
  };

  const updateStatus = async () => {
    if (!selectedOrder) return;
    try {
      setIsUpdating(true);
      const { data } = await axios.post('/api/order/status', {
        id: selectedOrder._id,
        status: editingStatus,
      });
      if (data?.success) {
        toast.success('Order status updated');

        // Do not replace the whole selectedOrder with server response
        // (server may return minimal object without populated items/address).
        // Instead update only status fields locally and update list.
        const updatedFromServer = data.order || {};
        const newStatus =
          updatedFromServer.status ??
          updatedFromServer.orderStatus ??
          editingStatus;

        // update local orders list
        setOrders((prev) =>
          prev.map((o) =>
            o._id === selectedOrder._id
              ? { ...o, status: newStatus, orderStatus: newStatus }
              : o
          )
        );

        // update modal copy by merging status only (keep existing items/address)
        setSelectedOrder((prev) =>
          prev ? { ...prev, status: newStatus, orderStatus: newStatus } : prev
        );
        // refresh background list if you want authoritative data
        fetchOrders().catch(() => {});
      } else {
        toast.error(data?.message || 'Update failed');
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.message || err.message || 'Update failed'
      );
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className='no-scrollbar flex-1 h-[95vh] overflow-y-scroll'>
      <div className='md:p-10 p-4 space-y-4'>
        <h2 className='text-lg font-medium'>Orders List</h2>
        {orders.map((order, index) => (
          <button
            key={index}
            onClick={() => openOrder(order)}
            type='button'
            className='w-full text-left flex flex-col md:items-center md:flex-row gap-5 justify-between p-5 max-w-4xl rounded-md border border-gray-300 hover:shadow-sm'
          >
            <div className='flex gap-5 max-w-80'>
              <img
                className='w-12 h-12 object-cover rounded'
                src={
                  // try product image -> fallback to box icon
                  (order.items?.[0]?.product?.image &&
                    (Array.isArray(order.items[0].product.image)
                      ? order.items[0].product.image[0]
                      : order.items[0].product.image)) ||
                  order.items?.[0]?.product?.imageUrl ||
                  assets.box_icon
                }
                alt='boxIcon'
              />
              <div>
                {order.items.map((item, idx) => (
                  <div key={idx} className='flex flex-col'>
                    <p className='font-medium'>
                      {item.product?.name ?? item.productName ?? 'Product'}{' '}
                      <span className='text-primary'>
                        x {item.quantity ?? item.qty}
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className='text-sm md:text-base text-black/60'>
              <p className='text-black/80'>
                {order.address?.firstName ?? order.address?.name ?? ''}{' '}
                {order.address?.lastName ?? ''}
              </p>

              <p>
                {order.address?.street}, {order.address?.city}
              </p>
              <p>
                {order.address?.state}, {order.address?.zipcode},{' '}
                {order.address?.country}
              </p>
              <p>{order.address?.phone}</p>
            </div>

            <p className='font-medium text-lg my-auto'>
              {currency}
              {order.amount}
            </p>

            <div className='flex flex-col text-sm md:text-base text-black/60 items-end'>
              <div>Method: {order.paymentType}</div>
              <div>Date: {new Date(order.createdAt).toLocaleDateString()}</div>
              <div>Payment: {order.isPaid ? 'Paid' : 'Pending'}</div>

              {/* show single order status with dark background */}
              <div className='mt-2'>
                <span className='text-sm text-black/70 mr-2'>
                  Order Status:
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${statusClasses(
                    order.status || order.orderStatus
                  )}`}
                >
                  {order.status || order.orderStatus || 'Pending'}
                </span>
              </div>

              {/* removed duplicate small pill */}
            </div>
          </button>
        ))}
      </div>

      {/* Modal: order full details */}
      {selectedOrder && (
        <div
          onClick={closeOrder}
          className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className='bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 shadow-lg'
          >
            <div className='flex justify-between items-start mb-4'>
              <h3 className='text-lg font-semibold'>Order Details</h3>
              <button onClick={closeOrder} className='text-gray-500'>
                Close
              </button>
            </div>

            <div className='space-y-4'>
              <div>
                <h4 className='font-medium'>Items</h4>
                <div className='space-y-3 mt-2'>
                  {(selectedOrder.items || []).map((it, i) => {
                    const prod = it.product || {};
                    const unit = Number(it.price ?? prod.price ?? 0);
                    const qty = Number(it.quantity ?? it.qty ?? 1);
                    const img =
                      (prod.image &&
                        (Array.isArray(prod.image)
                          ? prod.image[0]
                          : prod.image)) ||
                      prod.imageUrl ||
                      assets.box_icon;
                    return (
                      <div
                        key={i}
                        className='flex items-center gap-3 border rounded p-3'
                      >
                        <img
                          src={img}
                          alt={prod.name || 'product'}
                          className='w-16 h-16 object-cover rounded'
                        />
                        <div className='flex-1'>
                          <div className='font-medium'>
                            {prod.name ?? it.productName ?? 'Product'}
                          </div>
                          <div className='text-sm text-gray-500'>
                            Qty: {qty} — {currency}
                            {unit}
                          </div>
                        </div>
                        <div className='font-medium'>
                          {currency}
                          {(unit * qty).toFixed(2)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <h4 className='font-medium'>Shipping Address</h4>
                <div className='mt-2 text-sm text-gray-700'>
                  <div>
                    {selectedOrder.address?.firstName}{' '}
                    {selectedOrder.address?.lastName}
                  </div>
                  <div>{selectedOrder.address?.street}</div>
                  <div>
                    {selectedOrder.address?.city},{' '}
                    {selectedOrder.address?.state}{' '}
                    {selectedOrder.address?.zipcode}
                  </div>
                  <div>{selectedOrder.address?.country}</div>
                  <div className='mt-1'>
                    Phone: {selectedOrder.address?.phone}
                  </div>
                </div>
              </div>

              <div>
                <h4 className='font-medium'>Payment</h4>
                <div className='mt-2 text-sm text-gray-700'>
                  <div>Method: {selectedOrder.paymentType}</div>
                  <div>Status: {selectedOrder.isPaid ? 'Paid' : 'Pending'}</div>
                </div>
              </div>

              <div className='flex items-center gap-3 justify-end'>
                <label className='text-sm'>Order Status</label>
                <select
                  value={editingStatus}
                  onChange={(e) => setEditingStatus(e.target.value)}
                  className='border p-2 rounded'
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <button
                  onClick={updateStatus}
                  disabled={isUpdating}
                  className='px-4 py-2 bg-primary text-white rounded disabled:opacity-60'
                >
                  {isUpdating ? 'Updating...' : 'Update Status'}
                </button>
              </div>

              <div className='text-sm text-gray-600'>
                <div>
                  Order ID:{' '}
                  <span className='font-medium'>{selectedOrder._id}</span>
                </div>
                <div>
                  Date: {new Date(selectedOrder.createdAt).toLocaleString()}
                </div>
                <div className='mt-2 font-semibold'>
                  Total: {currency}
                  {selectedOrder.amount}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
